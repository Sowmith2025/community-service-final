const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ MONGODB_URI is not defined in environment variables for production.');
      console.error('   Please set MONGODB_URI in your deployment environment.');
      process.exit(1);
    } else {
      const localMongoUri = 'mongodb://localhost:27017/community-service';
      console.warn(`⚠️ MONGODB_URI not set, using local fallback: ${localMongoUri}`);
      try {
        const conn = await mongoose.connect(localMongoUri);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📁 Database: ${conn.connection.name}`);
      } catch (error) {
        console.error(`❌ Error connecting to local MongoDB: ${error.message}`);
        process.exit(1);
      }
      return;
    }
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📁 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
