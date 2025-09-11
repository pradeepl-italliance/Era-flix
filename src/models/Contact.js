import mongoose from 'mongoose'

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian phone number']
  },
  source: {
    type: String,
    enum: ['google', 'social', 'friend', 'unknown'],
    default: 'unknown'
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'completed', 'spam'],
    default: 'new'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
})

// Compound index to prevent duplicate submissions
contactSchema.index({ email: 1, phone: 1 }, { unique: true })

const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema)

export default Contact