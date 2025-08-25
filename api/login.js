const dbConnect = require('../db');
const AuthUser  = require('../models/AuthUser');
const bcrypt    = require('bcryptjs');
const { getSession } = require('./_lib/session');
const { readJson, json } = require('./_lib/http');

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return json(res, 405, { message: 'Method Not Allowed' }); }
  try {
    await dbConnect();
    const { email, password } = await readJson(req);
    const e = (email || '').toLowerCase().trim();
    if (!e || !password) return json(res, 400, { message: 'email and password required' });

    const user = await AuthUser.findOne({ email: e });
    if (!user) return json(res, 401, { message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash || '');
    if (!ok) return json(res, 401, { message: 'Invalid credentials' });

    const session = await getSession(req, res);
    session.userId = String(user._id);
    session.roles  = user.roles || [];
    await session.save();

    const roles = user.roles || [];
    const redirect =
      roles.includes('pro')    ? '/accept-appointments' :
      roles.includes('client') ? '/client-dashboard' : '/';

    return json(res, 200, { ok: true, user: { _id: user._id, email: user.email, roles }, redirect });
  } catch (e) {
    console.error('login error', e);
    return json(res, 500, { message: e.message || 'Login failed' });
  }
};
