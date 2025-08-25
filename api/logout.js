const { getSession } = require('./_lib/session');
const { json } = require('./_lib/http');

module.exports = async (req, res) => {
  const session = await getSession(req, res);
  await session.destroy();
  return json(res, 200, { ok: true });
};
