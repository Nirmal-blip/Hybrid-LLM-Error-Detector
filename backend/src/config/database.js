/**
 * MongoDB Atlas Database Connection Module
 */

import mongoose from 'mongoose';

let isConnected = false;

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.trim() === '') {
    console.log('ℹ️ MONGODB_URI not provided; using local disk JSON database.');
    return false;
  }

  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(uri, {
      dbName: 'cpp_error_detector',
      serverSelectionTimeoutMS: 5000
    });

    isConnected = true;
    console.log(`✓ MongoDB Atlas Connected: ${conn.connection.host} (Database: cpp_error_detector)`);
    return true;
  } catch (err) {
    console.warn(`⚠️ MongoDB Atlas Connection warning: ${err.message}`);
    console.log('ℹ️ Falling back to persistent local disk database (backend/data/history.json).');
    isConnected = false;
    return false;
  }
}

export function isDbConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}
