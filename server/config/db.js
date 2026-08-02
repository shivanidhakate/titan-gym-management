const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Set low timeout to fail fast if MongoDB is not running locally
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gym-management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 3000, 
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    global.dbConnected = true;

    // Check if database needs seeding
    const User = require('../models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('MongoDB is empty. Auto-seeding default demo accounts & records...');
      const seedData = require('../utils/seed');
      await seedData(true);
    }
  } catch (error) {
    console.warn(`\n=============================================================`);
    console.warn(`WARNING: MongoDB connection failed: ${error.message}`);
    console.warn(`The server will run in MOCK IN-MEMORY DATABASE mode.`);
    console.warn(`Ensure MongoDB is started, or specify MONGO_URI in .env to use a database.`);
    console.warn(`=============================================================\n`);
    global.dbConnected = false;
  }
};

module.exports = connectDB;
