// api/server.js  ← place this file here
require('dotenv').config();
const express = require('express');
const serverless = require('serverless-http');
const mongoose = require('mongoose');
// const cors = require('cors'); // optional; usually not needed when same origin


const DataType = require('../models/DataType'); // correct relative path from /api

const app = express();
app.use(express.json());

// If you actually need CORS (e.g., calling from another origin), uncomment:
// const allowed = [
//   'http://localhost:3000',
//   'https://YOUR-VERCEL-PROJECT.vercel.app',
//   'https://suiteseat.io',
//   'https://www.suiteseat.io'
// ];
// app.use(cors({
//   origin: (origin, cb) => {
//     if (!origin || allowed.includes(origin)) return cb(null, true);
//     return cb(new Error('Not allowed by CORS: ' + origin));
//   },
//   credentials: true
// }));

// ---- Mongo connect (cached for serverless) ----
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

// ---------- Routes (all under /api/...) ----------

// Health (useful for quick checks)
app.get('/api/health', async (req, res) => {
  try { await connectDB(); res.json({ ok: true }); }
  catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Admin: DataTypes
app.get('/api/datatypes', async (req, res) => {
  await connectDB();
  const list = await DataType.find({}).sort({ createdAt: 1 }).lean();
  res.json(list.map(dt => ({
    _id: dt._id,
    name: dt.name,
    description: dt.description
  })));
});

app.post('/api/datatypes', async (req, res) => {
  await connectDB();
  const { name, description = '' } = req.body || {};
  if (!name) return res.status(400).json({ error: 'Name required' });
  try {
    const doc = await DataType.create({ name, description });
    res.status(201).json({ _id: doc._id, name: doc.name, description: doc.description });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: 'Name already exists' });
    console.error(e);
    res.status(500).json({ error: 'Failed to create data type' });
  }
});

// Auth (prefix with /api/)
app.post('/api/signup',     async (req, res) => res.json({ ok: true, message: 'signup placeholder' }));
app.post('/api/signup/pro', async (req, res) => res.json({ ok: true, message: 'pro signup placeholder' }));
app.post('/api/login',      async (req, res) => res.json({ ok: true, message: 'login placeholder' }));

// Example other routes (also under /api/)
app.get('/api/public/records', async (req, res) => {
  await connectDB();
  res.json([]); // TODO
});

// IMPORTANT: export serverless handler; DO NOT app.listen() on Vercel
module.exports = serverless(app);
