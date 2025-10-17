const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth'); // if you use JWT authentication

// DELETE: Organizer can delete their event
router.delete('/:id', auth, async (req, res) => {
  try {
    // Find the event by ID
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Ensure only the organizer who created the event can delete it
    if (event.organizerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can delete only your own events.' });
    }

    await event.deleteOne();
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while deleting event' });
  }
});

module.exports = router;
