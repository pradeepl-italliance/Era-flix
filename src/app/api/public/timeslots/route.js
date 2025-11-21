// app/api/public/timeslots/route.js
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import TimeSlot from '@/models/TimeSlot'
import Booking from '@/models/Booking'

export async function GET(request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const screen = searchParams.get('screen')
    const bookingDate = searchParams.get('date')

    if (!screen) {
      return NextResponse.json({ error: 'Screen is required' }, { status: 400 })
    }

    if (!bookingDate) {
      return NextResponse.json({ error: 'Booking date is required' }, { status: 400 })
    }

    // Step 0: Base filter for active screen
    const filter = { isActive: true, screen }

    // Step 1: Get all confirmed bookings for this screen and date
    const start = new Date(bookingDate)
    start.setHours(0, 0, 0, 0)
    const end = new Date(bookingDate)
    end.setHours(23, 59, 59, 999)

    const bookedSlots = await Booking.find({
      screen,
      bookingStatus: 'confirmed',
      bookingDate: { $gte: start, $lte: end }
    }).lean()

// Step 3: Fetch all time slots and filter out booked ones
const allTimeSlots = await TimeSlot.find(filter).sort({ startTime: 1 }).lean();

const availableTimeSlots = allTimeSlots.filter(
  slot => !bookedSlots.some(
    b => b.timeSlot.startTime === slot.startTime && b.timeSlot.endTime === slot.endTime
  )
);



    // Step 4: Return only available slots
    return NextResponse.json({
      success: true,
      timeSlots: availableTimeSlots.map(slot => ({
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
