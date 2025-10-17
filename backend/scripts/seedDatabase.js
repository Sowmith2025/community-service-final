require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Attendance = require('../models/Attendance');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/community-service');
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Event.deleteMany({});
    await Registration.deleteMany({});
    await Attendance.deleteMany({});

    // Create users
    console.log('👥 Creating users...');
    const hashedPassword = await bcrypt.hash('password', 10);
    
    const user1 = await User.create({
      name: 'Arjun Kumar',
      email: 'arjun@college.edu',
      password: hashedPassword,
      role: 'student',
      phone: '+91-90000-00001',
      department: 'Computer Science',
      hoursCompleted: 15,
      joinedAt: new Date('2024-01-15')
    });

    const user2 = await User.create({
      name: 'Priya Sharma',
      email: 'priya@college.edu',
      password: hashedPassword,
      role: 'organizer',
      phone: '+91-90000-00002',
      department: 'Social Work',
      hoursCompleted: 8,
      joinedAt: new Date('2024-02-01')
    });

    console.log(`✅ Created ${2} users`);

    // Create events
    console.log('📅 Creating events...');
    const events = await Event.create([
      {
        title: 'Hussain Sagar Lake Cleanup',
        description: 'Swachhata drive to remove litter along the lakeside and protect urban wildlife.',
        date: '2025-10-18',
        time: '09:00',
        location: 'Necklace Road, Hyderabad',
        maxVolunteers: 25,
        organizerId: user2._id,
        category: 'environment',
        status: 'upcoming',
        createdAt: new Date('2025-09-20')
      },
      {
        title: 'Annadanam Food Distribution',
        description: 'Collect, pack and distribute meal packets to underprivileged families.',
        date: '2025-11-02',
        time: '13:00',
        location: 'Community Hall, Secunderabad',
        maxVolunteers: 30,
        organizerId: user1._id,
        category: 'community',
        status: 'upcoming',
        createdAt: new Date('2025-09-25')
      },
      {
        title: 'Urban Tree Planting',
        description: 'Plant native trees along neighborhood streets to increase shade and biodiversity.',
        date: '2025-11-15',
        time: '10:00',
        location: 'KBR Park, Hyderabad',
        maxVolunteers: 35,
        organizerId: user2._id,
        category: 'environment',
        status: 'upcoming',
        createdAt: new Date('2025-10-01')
      },
      {
        title: 'Winter Coat Drive',
        description: 'Sort and distribute donated jackets to families ahead of winter.',
        date: '2025-12-06',
        time: '11:00',
        location: 'Jubilee Hills Community Center, Hyderabad',
        maxVolunteers: 20,
        organizerId: user1._id,
        category: 'community',
        status: 'upcoming',
        createdAt: new Date('2025-10-05')
      },
      {
        title: 'NSS Blood Donation Camp',
        description: 'Volunteer coordination for donor registration and post-donation care.',
        date: '2025-10-25',
        time: '10:00',
        location: 'College Auditorium, Hyderabad',
        maxVolunteers: 40,
        organizerId: user2._id,
        category: 'nss',
        status: 'upcoming',
        createdAt: new Date('2025-10-05')
      },
      {
        title: 'NSS Swachh Bharat Drive',
        description: 'Community cleanliness drive in nearby neighborhoods and public spaces.',
        date: '2025-11-08',
        time: '08:00',
        location: 'Charminar – Laad Bazaar, Hyderabad',
        maxVolunteers: 50,
        organizerId: user2._id,
        category: 'nss',
        status: 'upcoming',
        createdAt: new Date('2025-10-10')
      },
      {
        title: 'NSS Tree Plantation Drive',
        description: 'Plant saplings and set up watering schedule with local residents.',
        date: '2025-11-22',
        time: '09:30',
        location: 'Durgam Cheruvu Park, Hyderabad',
        maxVolunteers: 60,
        organizerId: user1._id,
        category: 'nss',
        status: 'upcoming',
        createdAt: new Date('2025-10-12')
      },
      {
        title: 'NSS Rural Literacy Program',
        description: 'Weekend teaching sessions and activity kits for children in nearby villages.',
        date: '2025-12-13',
        time: '10:00',
        location: 'Kondapur Village School, Hyderabad',
        maxVolunteers: 30,
        organizerId: user1._id,
        category: 'nss',
        status: 'upcoming',
        createdAt: new Date('2025-10-15')
      }
    ]);

    console.log(`✅ Created ${events.length} events`);

    // Update user's eventsAttended
    await User.findByIdAndUpdate(user1._id, {
      eventsAttended: [events[0]._id, events[1]._id]
    });

    // Create registrations
    console.log('📝 Creating registrations...');
    await Registration.create([
      {
        eventId: events[0]._id,
        userId: user1._id,
        status: 'registered',
        registeredAt: new Date('2025-09-25')
      },
      {
        eventId: events[1]._id,
        userId: user1._id,
        status: 'registered',
        registeredAt: new Date('2025-10-01')
      },
      {
        eventId: events[4]._id,
        userId: user1._id,
        status: 'registered',
        registeredAt: new Date('2025-10-10')
      },
      {
        eventId: events[5]._id,
        userId: user1._id,
        status: 'registered',
        registeredAt: new Date('2025-10-12')
      }
    ]);

    console.log(`✅ Created 4 registrations`);

    // Create attendance record
    console.log('✅ Creating attendance records...');
    await Attendance.create({
      userId: user1._id,
      eventId: events[2]._id,
      checkInTime: new Date('2025-04-15T09:00:00.000Z'),
      checkOutTime: new Date('2025-04-15T12:00:00.000Z'),
      hours: 3,
      status: 'completed'
    });

    console.log(`✅ Created 1 attendance record`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('📧 Test credentials:');
    console.log('   Email: arjun@college.edu');
    console.log('   Email: priya@college.edu');
    console.log('   Password: password');
    
  } catch (error) {
    console.error(`❌ Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

const run = async () => {
  await connectDB();
  await seedDatabase();
  await mongoose.connection.close();
  console.log('✅ Database connection closed');
  process.exit(0);
};

run();
