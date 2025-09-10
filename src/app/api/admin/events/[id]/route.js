import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { requireAuth } from '@/lib/adminAuth'
import Event from '@/models/Event'

// PUT /api/admin/events/[id]
export async function PUT(request, { params }) {
  try {
    const user = await requireAuth(request) // ensure authenticated
    await dbConnect()

    const { id } = await params

    const body = await request.json()
    const {
      name,
      description,
      category,
      duration,
      maxCapacity,
      pricing
    } = body || {}

    // Basic validation similar to POST
    if (!name || !category || !duration || !pricing?.basePrice) {
      return NextResponse.json({
        error: 'Name, category, duration, and base price are required'
      }, { status: 400 })
    }

    // Build update doc with normalized types
    const update = {
      name: String(name).trim(),
      description: description?.trim() || '',
      category: String(category).trim(),
      duration: parseInt(duration, 10),
      maxCapacity: maxCapacity != null ? parseInt(maxCapacity, 10) : undefined,
      pricing: {
        basePrice: parseFloat(pricing.basePrice),
        currency: pricing.currency || 'INR'
      }
    }

    // Remove undefined keys so they don't unset accidentally
    Object.keys(update).forEach(k => update[k] === undefined && delete update[k])

    const updated = await Event.findByIdAndUpdate(
      id,
      update,
      {
        new: true,                // return updated doc
        runValidators: true,      // run schema validators on update
        context: 'query'          // some validators rely on query context
      }
    )
      .populate('createdBy', 'username')
      .lean()

    if (!updated) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      event: {
        id: updated._id.toString(),
        name: updated.name,
        description: updated.description,
        category: updated.category,
        duration: updated.duration,
        maxCapacity: updated.maxCapacity,
        pricing: updated.pricing,
        isActive: updated.isActive,
        createdBy: updated.createdBy,
        createdAt: updated.createdAt
      }
    })
  } catch (error) {
    // Handle duplicate name (unique) violations if schema has unique index
    if (error?.code === 11000) {
      return NextResponse.json({
        error: 'An event with this name already exists'
      }, { status: 409 })
    }
    console.error('Update event error:', error)
    const code = error.message?.includes('Authentication') ? 401 : 500
    return NextResponse.json({ error: 'Failed to update event' }, { status: code })
  }
}

// DELETE /api/admin/events/[id]
export async function DELETE(request, { params }) {
  try {
    const user = await requireAuth(request) // ensure authenticated
    await dbConnect()

    const { id } = await params

    const deleted = await Event.findByIdAndDelete(id)

    if (!deleted) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Event deleted'
    })
  } catch (error) {
    console.error('Delete event error:', error)
    const code = error.message?.includes('Authentication') ? 401 : 500
    return NextResponse.json({ error: 'Failed to delete event' }, { status: code })
  }
}
