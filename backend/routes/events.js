const express = require('express');
const Event = require('../models/Event');
const User = require('../models/User');
const Registration = require('../models/Registration');

const router = express.Router();

// Get all events
router.get('/', async (req, res) => {
  try {
    console.log('📍 GET /api/events - Fetching all events');
    
    const events = await Event.find().populate('organizerId', 'name email');
    console.log(`✅ Found ${events.length} events`);
    
    // Get registration counts for each event
    const eventsWithDetails = await Promise.all(events.map(async (event) => {
      try {
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
          organizerId: event.organizerId?._id,
          organizer: event.organizerId?.name || 'Unknown',
          registeredCount,
          isFull: registeredCount >= event.maxVolunteers,
          createdAt: event.createdAt
        };
      } catch (eventError) {
        console.error(`⚠️ Error processing event ${event._id}:`, eventError.message);
        throw eventError;
      }
    }));
    
    res.json({ data: eventsWithDetails });
  } catch (error) {
    console.error('❌ Error fetching events:', error);
    console.error('   Stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error while fetching events', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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
      date: new Date(date), // Convert string to Date object
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
    console.error('❌ Create error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update event
router.put('/:id', async (req, res) => {
  try {
    const { title, description, date, time, location, maxVolunteers, category, status } = req.body;
    
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Update fields if provided
    if (title) event.title = title;
    if (description) event.description = description;
    if (date) event.date = new Date(date); // Convert string to Date object
    if (time) event.time = time;
    if (location) event.location = location;
    if (maxVolunteers) event.maxVolunteers = maxVolunteers;
    if (category) event.category = category;
    if (status) event.status = status;
    
    await event.save();
    
    res.json({
      message: 'Event updated successfully',
      event: {
        id: event._id,
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        maxVolunteers: event.maxVolunteers,
        organizerId: event.organizerId,
        category: event.category,
        status: event.status,
        createdAt: event.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete event
router.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Delete associated registrations
    await Registration.deleteMany({ eventId: req.params.id });
    
    // Delete associated attendance records
    await require('../models/Attendance').deleteMany({ eventId: req.params.id });
    
    // Delete the event
    await Event.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all registrations for an event
router.get('/:id/registrations', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const registrations = await Registration.find({ eventId: req.params.id })
      .populate('userId', 'name email');
    
    const registrationList = registrations.map(reg => ({
      id: reg._id,
      userId: reg.userId._id,
      userName: reg.userId.name,
      userEmail: reg.userId.email,
      status: reg.status,
      registeredAt: reg.registeredAt
    }));

    res.json({ data: registrationList });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel registration (unregister from event)
router.delete('/:id/register/:userId', async (req, res) => {
  try {
    const { id: eventId, userId } = req.params;

    const registration = await Registration.findOne({ eventId, userId });
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    await Registration.findByIdAndDelete(registration._id);

    res.json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update registration status
router.put('/:id/register/:userId', async (req, res) => {
  try {
    const { id: eventId, userId } = req.params;
    const { status } = req.body;

    const registration = await Registration.findOne({ eventId, userId });
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

module.exports = router;
