const express = require('express');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');

const router = express.Router();

// Get all registrations
router.get('/', async (req, res) => {
  try {
    const { userId, eventId, status } = req.query;
    
    // Build query object
    const query = {};
    if (userId) query.userId = userId;
    if (eventId) query.eventId = eventId;
    if (status) query.status = status;
    
    const registrations = await Registration.find(query)
      .populate('userId', 'name email')
      .populate('eventId', 'title date location');
    
    const formattedRegistrations = registrations.map(reg => ({
      id: reg._id,
      userId: reg.userId._id,
      userName: reg.userId.name,
      userEmail: reg.userId.email,
      eventId: reg.eventId._id,
      eventTitle: reg.eventId.title,
      eventDate: reg.eventId.date,
      eventLocation: reg.eventId.location,
      status: reg.status,
      registeredAt: reg.registeredAt
    }));
    
    res.json({ data: formattedRegistrations });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single registration
router.get('/:id', async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('eventId', 'title date location');
    
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    
    res.json({
      data: {
        id: registration._id,
        userId: registration.userId._id,
        userName: registration.userId.name,
        userEmail: registration.userId.email,
        userPhone: registration.userId.phone,
        eventId: registration.eventId._id,
        eventTitle: registration.eventId.title,
        eventDate: registration.eventId.date,
        eventLocation: registration.eventId.location,
        status: registration.status,
        registeredAt: registration.registeredAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new registration
router.post('/', async (req, res) => {
  try {
    const { userId, eventId } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already registered
    const existingRegistration = await Registration.findOne({ eventId, userId });
    if (existingRegistration) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Check if event is full
    const registeredCount = await Registration.countDocuments({ eventId });
    if (registeredCount >= event.maxVolunteers) {
      return res.status(400).json({ message: 'Event is full' });
    }

    const newRegistration = new Registration({
      eventId,
      userId,
      status: 'registered'
    });

    await newRegistration.save();

    res.status(201).json({
      message: 'Successfully registered for event',
      registration: {
        id: newRegistration._id,
        eventId: newRegistration.eventId,
        userId: newRegistration.userId,
        status: newRegistration.status,
        registeredAt: newRegistration.registeredAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update registration
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    
    if (status) {
      registration.status = status;
      await registration.save();
    }
    
    res.json({
      message: 'Registration updated successfully',
      registration: {
        id: registration._id,
        eventId: registration.eventId,
        userId: registration.userId,
        status: registration.status,
        registeredAt: registration.registeredAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete registration
router.delete('/:id', async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    
    await Registration.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
