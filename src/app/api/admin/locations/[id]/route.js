import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { requireAuth, requireSuperAdmin } from '@/lib/adminAuth'
import Location from '@/models/Location'

// Get single location
export async function GET(request, { params }) {
  try {
    const user = await requireAuth(request)
    await dbConnect()

    let filter = { _id: params.id }

    // For non-super admins, only show assigned locations
    if (user.role !== 'super_admin') {
      const userLocationIds = user.assignedLocations.map(loc => 
        typeof loc === 'object' ? loc._id.toString() : loc.toString()
      )
      if (!userLocationIds.includes(params.id)) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    const location = await Location.findOne(filter)
      .populate('createdBy', 'username')
      .populate('managedBy', 'username')
      .lean()

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    const transformedLocation = {
      id: location._id.toString(),
      name: location.name,
      address: location.address,
      coordinates: location.coordinates,
      contactInfo: location.contactInfo,
      operatingHours: location.operatingHours,
      facilities: location.facilities,
      googleMapsUrl: location.googleMapsUrl,
      images: location.images, // ✅ Include images in response
      isActive: location.isActive,
      managedBy: location.managedBy,
      createdBy: location.createdBy,
      fullAddress: location.fullAddress,
      createdAt: location.createdAt,
      updatedAt: location.updatedAt
    }

    return NextResponse.json({
      success: true,
      location: transformedLocation
    })

  } catch (error) {
    console.error('Get location error:', error)
    const code = error.message.includes('Authentication') ? 401 : 500
    return NextResponse.json({ error: error.message }, { status: code })
  }
}

// Update location (Super Admin only)
export async function PUT(request, { params }) {
  try {
    const user = await requireSuperAdmin(request)
    await dbConnect()

    const locationData = await request.json()

    if (!locationData.name || !locationData.address?.street || !locationData.contactInfo?.phone) {
      return NextResponse.json({ 
        error: 'Name, street address, and phone are required' 
      }, { status: 400 })
    }

    // Ensure only one primary image exists
    if (locationData.images && locationData.images.length > 0) {
      const primaryImages = locationData.images.filter(img => img.isPrimary)
      if (primaryImages.length > 1) {
        return NextResponse.json({ 
          error: 'Only one image can be marked as primary' 
        }, { status: 400 })
      }
    }

    const location = await Location.findByIdAndUpdate(
      params.id,
      {
        ...locationData,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'username')

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      location: {
        id: location._id.toString(),
        name: location.name,
        address: location.address,
        images: location.images, // ✅ Return images in response
        isActive: location.isActive
      }
    })

  } catch (error) {
    console.error('Update location error:', error)
    
    if (error.code === 11000) {
      return NextResponse.json({ 
        error: 'A location with this name already exists' 
      }, { status: 409 })
    }

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message)
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validationErrors 
      }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 })
  }
}

// Delete location (Super Admin only)
export async function DELETE(request, { params }) {
  try {
    await requireSuperAdmin(request)
    await dbConnect()

    const location = await Location.findById(params.id)
    
    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    // Delete images from Supabase before deleting the location
    if (location.images && location.images.length > 0) {
      try {
        // Delete each image from Supabase directly
        for (const image of location.images) {
          if (image.path) {
            const deleteResult = await deleteFile(image.path)
            
            if (!deleteResult.success) {
              console.error(`Failed to delete image: ${image.path}`, deleteResult.error)
            }
          }
        }
      } catch (error) {
        console.error('Error deleting images from Supabase:', error)
        // Continue with location deletion even if image deletion fails
      }
    }

    await Location.findByIdAndDelete(params.id)

    return NextResponse.json({
      success: true,
      message: 'Location deleted successfully'
    })

  } catch (error) {
    console.error('Delete location error:', error)
    
    if (error.message === 'Super Admin access required') {
      return NextResponse.json({ error: 'Only super admin can delete locations' }, { status: 403 })
    }

    return NextResponse.json({ error: 'Failed to delete location' }, { status: 500 })
  }
}