// ------------------------------
// 🌐 Community Service Backend
// ------------------------------

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/database');

// Import models
const Event = require('./models/Event');

// Optional: load Organizer model safely
let Organizer;
const organizerModelCandidates = [
  path.join(__dirname, 'models', 'Organizer'),
  path.join(__dirname, 'models', 'organizer')
];
for (const candidate of organizerModelCandidates) {
  try {
    Organizer = require(candidate);
    break;
  } catch (err) {
    // Continue trying
  }
}
if (!Organizer) {
  console.warn('Organizer model not found. Inline DELETE /api/organizer/:id route will be skipped.');
}

// Import routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const userRoutes = require('./routes/users');
const attendanceRoutes = require('./routes/attendance');
const organizerRoutes = require('./routes/organizer');

// Optional authentication middleware (uncomment if you want role protection)
// const auth = require('./middleware/auth');

const app = express();

// --------------------------------------
// 🧩 Database Connection
// --------------------------------------
connectDB();

// --------------------------------------
// ⚙️ Middleware
// --------------------------------------
app.use(cors());
app.use(express.json());

// --------------------------------------
// 🚦 API Routes
// --------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/organizer', organizerRoutes);

// --------------------------------------
// 🗑️ Inline DELETE Routes
// --------------------------------------

// Delete an Organizer
if (Organizer) {
  app.delete('/api/organizer/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const deleted = await Organizer.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Organizer not found' });
      }
      return res.json({ message: 'Organizer deleted successfully', organizer: deleted });
    } catch (err) {
      console.error('Error deleting organizer:', err);
      return res.status(500).json({ error: 'Server error' });
    }
  });
}

// Delete an Event (by organizer)
app.delete('/api/events/:id', async (req, res) => {
  try {
    const eventId = req.params.id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Uncomment if using JWT auth to restrict deletion to creator:
    /*
    if (event.organizerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can delete only your own events.' });
    }
    */

    await event.deleteOne();
    return res.status(200).json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Error deleting event:', err);
    return res.status(500).json({ message: 'Server error while deleting event' });
  }
});

// --------------------------------------
// 🩺 Health Check Route
// --------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Community Service API is running!',
    timestamp: new Date().toISOString(),
  });
});

// --------------------------------------
// 🌐 Serve Frontend (Angular or React)
// --------------------------------------
if (process.env.NODE_ENV === 'production') {
  const angularDistDir = path.join(__dirname, '../frontend-angular/dist/frontend-angular');
  const reactBuildDir = path.join(__dirname, '../frontend/build');

  const useAngular = fs.existsSync(angularDistDir);
  const staticDir = useAngular ? angularDistDir : reactBuildDir;

  app.use(express.static(staticDir));

  app.get('*', (req, res) => {
    const indexFile = useAngular
      ? path.join(angularDistDir, 'index.html')
      : path.join(reactBuildDir, 'index.html');
    res.sendFile(indexFile);
  });
}

// --------------------------------------
// 🚀 Start Server
// --------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
