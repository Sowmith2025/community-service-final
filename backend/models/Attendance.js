const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  checkInTime: {
    type: Date,
    required: true
  },
  checkOutTime: {
    type: Date
  },
  hours: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['checked-in', 'checked-out', 'completed', 'pending'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Indexes for faster queries
attendanceSchema.index({ userId: 1 });
attendanceSchema.index({ eventId: 1 });
attendanceSchema.index({ status: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
