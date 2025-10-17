const express = require('express');
const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Attendance = require('../models/Attendance');

const router = express.Router();

// Update user profile
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, department } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (typeof name === 'string' && name.trim().length > 0) {
      user.name = name.trim();
    }
    if (typeof phone === 'string') {
      user.phone = phone.trim();
    }
    if (typeof department === 'string') {
      user.department = department.trim();
    }
    
    await user.save();
    
    return res.json({
      message: 'Profile updated',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        department: user.department
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's registered events
    const userRegistrations = await Registration.find({ userId: req.params.id })
      .populate('eventId');
    
    const registeredEvents = userRegistrations.map(reg => ({
      id: reg.eventId._id,
      title: reg.eventId.title,
      description: reg.eventId.description,
      date: reg.eventId.date,
      time: reg.eventId.time,
      location: reg.eventId.location,
      category: reg.eventId.category,
      status: reg.eventId.status,
      registeredAt: reg.registeredAt,
      registrationStatus: reg.status
    }));

    // Get attendance records
    const userAttendance = await Attendance.find({ userId: req.params.id })
      .populate('eventId', 'title date');

    const attendanceRecords = userAttendance.map(att => ({
      id: att._id,
      eventId: att.eventId._id,
      eventTitle: att.eventId.title,
      eventDate: att.eventId.date,
      checkInTime: att.checkInTime,
      checkOutTime: att.checkOutTime,
      hours: att.hours,
      status: att.status
    }));

    // Calculate stats
    const totalHours = userAttendance.reduce((sum, record) => sum + record.hours, 0);
    const eventsAttended = userAttendance.filter(a => a.status === 'completed').length;

    res.json({
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          hoursCompleted: totalHours,
          eventsAttended: eventsAttended,
          joinedAt: user.joinedAt
        },
        registeredEvents,
        attendance: attendanceRecords
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get leaderboard
router.get('/leaderboard/top', async (req, res) => {
  try {
    // Get all users
    const users = await User.find();
    
    // Calculate hours for each user
    const userHoursPromises = users.map(async (user) => {
      const userAttendance = await Attendance.find({ userId: user._id });
      const totalHours = userAttendance.reduce((sum, record) => sum + record.hours, 0);
      const completedEvents = userAttendance.filter(a => a.status === 'completed').length;
      
      return {
        id: user._id,
        name: user.name,
        hoursCompleted: totalHours,
        eventsAttended: completedEvents,
        role: user.role
      };
    });

    const userHours = await Promise.all(userHoursPromises);

    // Sort by hours completed
    const leaderboard = userHours
      .sort((a, b) => b.hoursCompleted - a.hoursCompleted)
      .slice(0, 10);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
