import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cafe_delivery';

async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB at:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connection successful!');
    console.log('Connection details:', mongoose.connection.host, mongoose.connection.port);
    return true;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    return false;
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Connection closed');
  }
}

testConnection();