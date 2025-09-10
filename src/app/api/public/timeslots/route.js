// app/api/public/timeslots/route.js
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import TimeSlot from '@/models/TimeSlot'

export async function GET(request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const screen = searchParams.get('screen')

    if (!screen) {
      return NextResponse.json({ error: 'Screen is required' }, { status: 400 })
    }

    // If TimeSlot schema has screen, filter by it
    const filter = { isActive: true, screen }

    const timeSlots = await TimeSlot.find(filter)
      .sort({ startTime: 1 })
      .lean()

    return NextResponse.json({
      success: true,
      timeSlots: timeSlots.map(slot => ({
        id: slot._id.toString(),
        name: slot.name,
        screen: slot.screen ? String(slot.screen) : null,
        startTime: slot.startTime,
        endTime: slot.endTime,
        duration: calculateDuration(slot.startTime, slot.endTime)
      }))
    })
  } catch (error) {
    console.error('Public time slots error:', error)
    return NextResponse.json({ error: 'Failed to load time slots' }, { status: 500 })
  }
}

function calculateDuration(start, end) {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const mins = (eh * 60 + em) - (sh * 60 + sm)
  return Math.round((mins / 60) * 100) / 100
}
