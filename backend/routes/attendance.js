const express = require('express');
const Attendance = require('../models/Attendance');
const Event = require('../models/Event');
const User = require('../models/User');

const router = express.Router();

// Get all attendance records
router.get('/', async (req, res) => {
  try {
    const { userId, eventId, status } = req.query;
    
    // Build query object
    const query = {};
    if (userId) query.userId = userId;
    if (eventId) query.eventId = eventId;
    if (status) query.status = status;
    
    const attendanceRecords = await Attendance.find(query)
      .populate('userId', 'name email')
      .populate('eventId', 'title date location');
    
    const formattedRecords = attendanceRecords.map(att => ({
      id: att._id,
      userId: att.userId._id,
      userName: att.userId.name,
      userEmail: att.userId.email,
      eventId: att.eventId._id,
      eventTitle: att.eventId.title,
      eventDate: att.eventId.date,
      eventLocation: att.eventId.location,
      checkInTime: att.checkInTime,
      checkOutTime: att.checkOutTime,
      hours: att.hours,
      status: att.status
    }));
    
    res.json({ data: formattedRecords });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single attendance record
router.get('/:id', async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('eventId', 'title date location');
    
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    
    res.json({
      data: {
        id: attendance._id,
        userId: attendance.userId._id,
        userName: attendance.userId.name,
        userEmail: attendance.userId.email,
        eventId: attendance.eventId._id,
        eventTitle: attendance.eventId.title,
        eventDate: attendance.eventId.date,
        eventLocation: attendance.eventId.location,
        checkInTime: attendance.checkInTime,
        checkOutTime: attendance.checkOutTime,
        hours: attendance.hours,
        status: attendance.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

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

// Update attendance record
router.put('/:id', async (req, res) => {
  try {
    const { checkInTime, checkOutTime, hours, status } = req.body;
    
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    
    // Update fields if provided
    if (checkInTime) attendance.checkInTime = new Date(checkInTime);
    if (checkOutTime) attendance.checkOutTime = new Date(checkOutTime);
    if (status) attendance.status = status;
    
    // Recalculate hours if both check-in and check-out times are present
    if (attendance.checkInTime && attendance.checkOutTime) {
      const calculatedHours = (new Date(attendance.checkOutTime) - new Date(attendance.checkInTime)) / (1000 * 60 * 60);
      attendance.hours = Math.round(calculatedHours * 100) / 100;
    } else if (hours !== undefined) {
      attendance.hours = hours;
    }
    
    await attendance.save();
    
    res.json({
      message: 'Attendance record updated successfully',
      attendance: {
        id: attendance._id,
        userId: attendance.userId,
        eventId: attendance.eventId,
        checkInTime: attendance.checkInTime,
        checkOutTime: attendance.checkOutTime,
        hours: attendance.hours,
        status: attendance.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete attendance record
router.delete('/:id', async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    
    await Attendance.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
