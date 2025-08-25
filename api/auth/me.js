const dbConnect = require('../../db');
const AuthUser  = require('../../models/AuthUser');
const { getSession } = require('../_lib/session');
const { json } = require('../_lib/http');

module.exports = async (req, res) => {
  try {
    await dbConnect();
    const session = await getSession(req, res);
    if (!session.userId) return json(res, 401, { ok: false, error: 'Not logged in' });
    const me = await AuthUser.findById(session.userId).select('_id email firstName lastName roles').lean();
    if (!me) return json(res, 404, { ok: false, error: 'User not found' });
    return json(res, 200, { ok: true, user: { _id: String(me._id), email: me.email || '', firstName: me.firstName || '', lastName: me.lastName || '', roles: me.roles || [] } });
  } catch (e) { return json(res, 500, { ok: false, error: e.message }); }
};
