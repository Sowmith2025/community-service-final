const express = require('express');
const Attendance = require('../models/Attendance');
const Event = require('../models/Event');
const User = require('../models/User');

const router = express.Router();

// Check in to event
router.post('/check-in', async (req, res) => {
  try {
    const { userId, eventId, checkInTime } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if already checked in
    const existingCheckin = await Attendance.findOne({
      eventId,
      userId,
      checkOutTime: null
    });
    
    if (existingCheckin) {
      return res.status(400).json({ message: 'Already checked in to this event' });
    }

    const newAttendance = new Attendance({
      userId,
      eventId,
      checkInTime: checkInTime || new Date(),
      hours: 0,
      status: 'checked-in'
    });

    await newAttendance.save();

    res.json({
      message: 'Successfully checked in',
      attendance: {
        id: newAttendance._id,
        userId: newAttendance.userId,
        eventId: newAttendance.eventId,
        checkInTime: newAttendance.checkInTime,
        checkOutTime: newAttendance.checkOutTime,
        hours: newAttendance.hours,
        status: newAttendance.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check out from event
router.post('/check-out', async (req, res) => {
  try {
    const { userId, eventId, checkOutTime } = req.body;

    // Find check-in record
    const checkinRecord = await Attendance.findOne({
      eventId,
      userId,
      checkOutTime: null
    });
    
    if (!checkinRecord) {
      return res.status(400).json({ message: 'No active check-in found' });
    }

    // Calculate hours
    const checkInTime = new Date(checkinRecord.checkInTime);
    const checkoutTime = checkOutTime ? new Date(checkOutTime) : new Date();
    const hours = (checkoutTime - checkInTime) / (1000 * 60 * 60); // Convert to hours
    const roundedHours = Math.round(hours * 100) / 100; // Round to 2 decimal places

    // Update record
    checkinRecord.checkOutTime = checkoutTime;
    checkinRecord.hours = roundedHours;
    checkinRecord.status = 'completed';
    
    await checkinRecord.save();

    res.json({
      message: 'Successfully checked out',
      hours: roundedHours,
      attendance: {
        id: checkinRecord._id,
        userId: checkinRecord.userId,
        eventId: checkinRecord.eventId,
        checkInTime: checkinRecord.checkInTime,
        checkOutTime: checkinRecord.checkOutTime,
        hours: checkinRecord.hours,
        status: checkinRecord.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
