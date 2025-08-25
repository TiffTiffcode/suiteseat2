const dbConnect = require('../../db');
const AuthUser  = require('../../models/AuthUser');
const bcrypt    = require('bcryptjs');
const { getSession } = require('../_lib/session');
const { readJson, json } = require('../_lib/http');

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return json(res, 405, { message: 'Method Not Allowed' }); }
  try {
    await dbConnect();
    const { firstName, lastName, email, password, phone } = await readJson(req);
    if (!firstName || !lastName || !email || !password) return json(res, 400, { message: 'Missing required fields' });

    const lowerEmail = (email || '').toLowerCase().trim();
    const exists = await AuthUser.findOne({ email: lowerEmail });
    if (exists) return json(res, 409, { message: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 10);
    const name = [firstName, lastName].filter(Boolean).join(' ').trim() || undefined;

    const user = await AuthUser.create({
      email: lowerEmail, passwordHash,
      roles: ['pro'], firstName: firstName.trim(), lastName: lastName.trim(),
      name, phone: phone || ''
    });

    const session = await getSession(req, res);
    session.userId = String(user._id);
    session.roles  = user.roles || [];
    await session.save();

    return json(res, 200, { redirect: '/accept-appointments' });
  } catch (e) {
    console.error('pro signup error', e);
    return json(res, 500, { message: e.message || 'Signup failed' });
  }
};
