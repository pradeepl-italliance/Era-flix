// app/api/admin/slots/route.js
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { requireAuth } from '@/lib/adminAuth'
import TimeSlot from '@/models/TimeSlot'

export async function GET(request) {
  try {
    const user = await requireAuth(request)
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const screen = searchParams.get('screen')

    const filter = {}
    if (screen) filter.screen = screen

    const slots = await TimeSlot.find(filter)
      .sort({ startTime: 1 })
      .lean()

    return NextResponse.json({
      success: true,
      slots: slots.map(slot => ({
        id: slot._id.toString(),
        screen: slot.screen?.toString?.() || String(slot.screen),
        name: slot.name,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isActive: slot.isActive,
        createdAt: slot.createdAt
      }))
    })
  } catch (error) {
    console.error('Get slots error:', error)
    const code = error.message?.includes('Authentication') ? 401 : 500
    return NextResponse.json({ error: error.message || 'Failed to load time slots' }, { status: code })
  }
}

// app/api/admin/slots/route.js (POST)
export async function POST(request) {
  try {
    const user = await requireAuth(request)
    await dbConnect()

    const { screen, name, startTime, endTime } = await request.json()

    console.log('screen:', screen)
    console.log('name:', name)
    console.log('startTime:', startTime)
    console.log('endTime:', endTime);
    

    if (!screen || !name || !startTime || !endTime) {
      return NextResponse.json({ error: 'Screen, name, start time, and end time are required' }, { status: 400 })
    }

    const objectIdRegex = /^[a-fA-F0-9]{24}$/
    if (!objectIdRegex.test(String(screen))) {
      return NextResponse.json({ error: 'Invalid screen id' }, { status: 400 })
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json({ error: 'Invalid time format. Use HH:MM' }, { status: 400 })
    }

    const slot = await TimeSlot.create({
      screen,
      name: String(name).trim(),
      startTime,
      endTime,
      createdBy: user._id
    })
    console.log('Created slot:', slot);
    

    return NextResponse.json({
      success: true,
      slot: {
        id: slot._id.toString(),
        screen: slot.screen ? String(slot.screen) : null,
        name: slot.name,
        startTime: slot.startTime,
        endTime: slot.endTime
      }
    })
  } catch (error) {
    console.error('Create slot error:', error)
    if (error?.code === 11000) {
      return NextResponse.json({ error: 'A slot with the same time already exists for this screen' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create time slot' }, { status: 500 })
  }
}