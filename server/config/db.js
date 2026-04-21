const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(
      `[db] MongoDB connected: ${connection.connection.host}/${connection.connection.name}`
    );

    return connection;
  } catch (error) {
    console.error('[db] MongoDB connection failed:', error.message);
    throw error;
  }
};

module.exports = connectDB;
