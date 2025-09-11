import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Contact from '@/models/Contact'

export async function POST(request) {
  try {
    await dbConnect()

    const { name, email, phone, source } = await request.json()

    // Validation
    if (!name || !email || !phone) {
      return NextResponse.json({ 
        error: 'Name, email, and phone are required' 
      }, { status: 400 })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        error: 'Please provide a valid email address' 
      }, { status: 400 })
    }

    // Phone validation (Indian numbers)
    const phoneRegex = /^[6-9]\d{9}$/
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ 
        error: 'Please provide a valid Indian phone number' 
      }, { status: 400 })
    }

    // Create contact submission
    const contact = await Contact.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      source: source || 'unknown'
    })

    return NextResponse.json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.',
      contact: {
        id: contact._id.toString(),
        name: contact.name,
        email: contact.email
      }
    })

  } catch (error) {
    console.error('Contact form error:', error)
    
    if (error.code === 11000) {
      return NextResponse.json({ 
        error: 'You have already submitted a contact request with this email/phone' 
      }, { status: 409 })
    }

    return NextResponse.json({ 
      error: 'Failed to submit contact form. Please try again later.' 
    }, { status: 500 })
  }
}