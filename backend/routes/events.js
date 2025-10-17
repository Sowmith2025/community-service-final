const express = require('express');
const Event = require('../models/Event');
const User = require('../models/User');
const Registration = require('../models/Registration');

const router = express.Router();

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().populate('organizerId', 'name email');
    
    // Get registration counts for each event
    const eventsWithDetails = await Promise.all(events.map(async (event) => {
      const registeredCount = await Registration.countDocuments({ eventId: event._id });
      return {
        id: event._id,
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        maxVolunteers: event.maxVolunteers,
        category: event.category,
        status: event.status,
        organizerId: event.organizerId._id,
        organizer: event.organizerId.name,
        registeredCount,
        isFull: registeredCount >= event.maxVolunteers,
        createdAt: event.createdAt
      };
    }));
    
    res.json({ data: eventsWithDetails });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizerId', 'name email');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const eventRegistrations = await Registration.find({ eventId: req.params.id })
      .populate('userId', 'name email hoursCompleted');
    
    const registeredUsers = eventRegistrations.map(reg => ({
      id: reg.userId._id,
      name: reg.userId.name,
      email: reg.userId.email,
      hoursCompleted: reg.userId.hoursCompleted,
      registeredAt: reg.registeredAt,
      status: reg.status
    }));

    res.json({
      data: {
        id: event._id,
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        maxVolunteers: event.maxVolunteers,
        category: event.category,
        status: event.status,
        organizerId: event.organizerId._id,
        organizer: event.organizerId,
        registeredUsers,
        registeredCount: eventRegistrations.length,
        isFull: eventRegistrations.length >= event.maxVolunteers,
        createdAt: event.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Register for event
router.post('/:id/register', async (req, res) => {
  try {
    const { userId } = req.body;
    const eventId = req.params.id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if already registered
    const existingRegistration = await Registration.findOne({
      eventId,
      userId
    });
    if (existingRegistration) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Check if event is full
    const registeredCount = await Registration.countDocuments({ eventId });
    if (registeredCount >= event.maxVolunteers) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Register
    const newRegistration = new Registration({
      eventId,
      userId,
      status: 'registered'
    });

    await newRegistration.save();

    res.json({ 
      message: 'Successfully registered for event',
      registration: {
        id: newRegistration._id,
        eventId: newRegistration.eventId,
        userId: newRegistration.userId,
        registeredAt: newRegistration.registeredAt,
        status: newRegistration.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new event
router.post('/', async (req, res) => {
  try {
    const { title, description, date, time, location, maxVolunteers, organizerId, category } = req.body;

    const newEvent = new Event({
      title,
      description,
      date,
      time,
      location,
      maxVolunteers: maxVolunteers || 20,
      organizerId,
      category: category || 'other',
      status: 'upcoming'
    });

    await newEvent.save();

    res.status(201).json({
      message: 'Event created successfully',
      event: {
        id: newEvent._id,
        title: newEvent.title,
        description: newEvent.description,
        date: newEvent.date,
        time: newEvent.time,
        location: newEvent.location,
        maxVolunteers: newEvent.maxVolunteers,
        organizerId: newEvent.organizerId,
        category: newEvent.category,
        status: newEvent.status,
        createdAt: newEvent.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
