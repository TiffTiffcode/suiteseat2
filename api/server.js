// api/server.js
const express = require('express');
const serverless = require('serverless-http');

const app = express();
app.use(express.json());

// --- Example routes (use /api/... paths) ---
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Your admin page already calls these:
app.get('/api/datatypes', async (req, res) => {
  // TODO: return real datatypes
  res.json([{ _id: '1', name: 'Business' }]);
});

app.post('/api/datatypes', async (req, res) => {
  // TODO: create a datatype using req.body.name
  res.status(201).json({ ok: true });
});

// Auth examples (we’ll wire real logic later)
app.post('/api/signup', async (req, res) => res.json({ ok: true }));
app.post('/api/login',  async (req, res) => res.json({ ok: true }));

// IMPORTANT: export the serverless handler (no app.listen here)
module.exports = serverless(app);
