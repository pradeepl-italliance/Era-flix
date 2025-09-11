import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { requireAuth } from '@/lib/adminAuth'
import Contact from '@/models/Contact'

export async function PUT(request, { params }) {
  try {
    await requireAuth(request) // This will check if user is authenticated
    await dbConnect()

    const { status } = await request.json()

    if (!['new', 'contacted', 'completed', 'spam'].includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid status value' 
      }, { status: 400 })
    }

    const contact = await Contact.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    )

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      contact: {
        id: contact._id.toString(),
        status: contact.status
      }
    })

  } catch (error) {
    console.error('Update contact error:', error)
    
    if (error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 })
  }
}