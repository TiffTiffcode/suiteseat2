const { getIronSession } = require('iron-session');

const sessionOptions = {
  cookieName: 'ssess',
  password: process.env.SESSION_PASSWORD, // we'll set this in Vercel later
  cookieOptions: {
    secure: true,      // HTTPS on Vercel
    sameSite: 'lax',
    path: '/'
  }
};

async function getSession(req, res) {
  return getIronSession(req, res, sessionOptions);
}

module.exports = { getSession };
