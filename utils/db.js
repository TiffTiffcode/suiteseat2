// utils/db.js
const mongoose = require('mongoose');

let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    if (!process.env.MONGODB_URI) throw new Error('Missing MONGODB_URI');
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB || 'suiteseat'
    }).then(m => m.connection);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = { connectDB };
