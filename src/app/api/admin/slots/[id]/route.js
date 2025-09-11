// app/api/admin/slots/[id]/route.js
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { requireAuth } from '@/lib/adminAuth'
import TimeSlot from '@/models/TimeSlot'

export async function PUT(request, ctx) {
  try {
    const user = await requireAuth(request)
    await dbConnect()

    const { id } = await ctx.params // Next 15 dynamic APIs are async

    const { screen, name, startTime, endTime } = await request.json()

    if (!screen || !name || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Screen, name, start time, and end time are required' }, 
        { status: 400 }
      )
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json({ error: 'Invalid time format. Use HH:MM' }, { status: 400 })
    }

    const update = {
      screen,
      name: String(name).trim(),
      startTime,
      endTime
    }

    const updated = await TimeSlot.findByIdAndUpdate(
      id,
      update,
      { new: true, runValidators: true, context: 'query' }
    ).lean()

    if (!updated) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      slot: {
        id: updated._id.toString(),
        screen: updated.screen?.toString?.() || String(updated.screen),
        name: updated.name,
        startTime: updated.startTime,
        endTime: updated.endTime,
        isActive: updated.isActive,
        createdAt: updated.createdAt
      }
    })
  } catch (error) {
    console.error('Update slot error:', error)
    if (error?.code === 11000) {
      return NextResponse.json({ error: 'A slot with the same time already exists for this screen' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(request, ctx) {
  try {
    await dbConnect()

    const { id } = await ctx.params

    const deleted = await TimeSlot.findByIdAndDelete(id)
    if (!deleted) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, id: deleted._id.toString() })
  } catch (error) {
    console.error('Delete slot error:', error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
