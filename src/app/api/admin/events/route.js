import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { requireAuth } from '@/lib/adminAuth'
import Event from '@/models/Event'

export async function GET(request) {
  try {
    const user = await requireAuth(request)
    await dbConnect()

    const events = await Event.find()
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 })
      .lean()
  
    return NextResponse.json({
      success: true,
      events: events.map(event => ({
        id: event._id.toString(),
        name: event.name,
        description: event.description,
        category: event.category,
        duration: event.duration,
        maxCapacity: event.maxCapacity,
        pricing: event.pricing,
        isActive: event.isActive,
        createdBy: event.createdBy,
        createdAt: event.createdAt
      }))
    })

  } catch (error) {
    console.error('Get events error:', error)
    const code = error.message.includes('Authentication') ? 401 : 500
    return NextResponse.json({ error: error.message }, { status: code })
  }
}

export async function POST(request) {
  try {
    const user = await requireAuth(request)
    await dbConnect()
    const { name, description, category, duration, maxCapacity, pricing } = await request.json()
    
    if (!name) {
      return NextResponse.json({ 
        error: 'Name is required' 
      }, { status: 400 })
    }
    
    const eventData = {
      name: name.trim(),
      description: description?.trim(),
      category: String(category)?.trim() || '',
      duration: parseInt(duration),
      maxCapacity: parseInt(maxCapacity) || 10,
      pricing: {
        basePrice: 0,
        currency: 'INR'
      },
      createdBy: user._id
    }
    
    
    
    const event = await Event.create(eventData)
    
    console.log("event after create:", event)
    console.log("event.pricing:", event.pricing)
    console.log("event.toObject():", event.toObject())
    
    return NextResponse.json({
      success: true,
      event: {
        id: event._id.toString(),
        name: event.name,
        category: event.category,
        duration: event.duration,
        maxCapacity: event.maxCapacity,
        pricing: event.pricing
      }
    })
  } catch (error) {
    console.error('Create event error:', error)
    
    if (error.code === 11000) {
      return NextResponse.json({ 
        error: 'An event with this name already exists' 
      }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}
