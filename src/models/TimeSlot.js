// models/TimeSlot.ts
import mongoose from 'mongoose'

const timeSlotSchema = new mongoose.Schema({
  screen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Screen',
    required: true
  },
  name: { type: String, required: true, trim: true },
  startTime: {
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format']
  },
  endTime: {
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format']
  },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Duration virtual (hours, 2 decimals)
timeSlotSchema.virtual('durationHours').get(function() {
  const [sh, sm] = this.startTime.split(':').map(Number)
  const [eh, em] = this.endTime.split(':').map(Number)
  const mins = (eh * 60 + em) - (sh * 60 + sm)
  return Math.round((mins / 60) * 100) / 100
})

// Uniqueness per screen + times
timeSlotSchema.index({ screen: 1, startTime: 1, endTime: 1 }, { unique: true })
timeSlotSchema.index({ screen: 1, isActive: 1 }) // helpful filter

const TimeSlot = mongoose.models.TimeSlot || mongoose.model('TimeSlot', timeSlotSchema)
export default TimeSlot
