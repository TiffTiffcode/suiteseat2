// api/_lib/http.js
async function readJson(req) {
  // If Vercel/Node already attached a body, use it.
  if (req.body) {
    try {
      if (typeof req.body === 'string') return JSON.parse(req.body);
      if (Buffer.isBuffer(req.body)) return JSON.parse(req.body.toString('utf8'));
      if (typeof req.body === 'object') return req.body;
    } catch {}
  }

  // Fallback: read the raw stream
  const chunks = [];
  for await (const c of req) chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c));
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

module.exports = { readJson, json };
