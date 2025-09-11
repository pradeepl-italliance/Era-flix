import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { requireAuth } from '@/lib/adminAuth'
import Contact from '@/models/Contact'

export async function GET(request) {
  try {
    await requireAuth(request) // This will check if user is authenticated
    await dbConnect()

    const contacts = await Contact.find({})
      .sort({ createdAt: -1 })
      .lean()

    const transformedContacts = contacts.map(contact => ({
      id: contact._id.toString(),
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      source: contact.source,
      status: contact.status,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt
    }))

    return NextResponse.json({
      success: true,
      contacts: transformedContacts
    })

  } catch (error) {
    console.error('Get contacts error:', error)
    const code = error.message.includes('Authentication') ? 401 : 500
    return NextResponse.json({ error: error.message }, { status: code })
  }
}