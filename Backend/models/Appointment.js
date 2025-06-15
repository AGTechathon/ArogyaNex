const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  consultationType: {
    type: String,
    enum: ['online', 'in-person'],
    required: true
  },
  symptoms: {
    type: String,
    required: true
  },
  notes: String,
  meetingLink: String, // For online consultations
  cancellationReason: String,
  isNotified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for faster queries
appointmentSchema.index({ doctor: 1, date: 1 });
appointmentSchema.index({ patient: 1, date: 1 });
appointmentSchema.index({ status: 1 });

// Pre-save middleware to ensure appointment time is in the future
appointmentSchema.pre('save', function(next) {
  const appointmentDate = new Date(this.date);
  if (appointmentDate < new Date()) {
    next(new Error('Appointment date must be in the future'));
  }
  next();
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment; 