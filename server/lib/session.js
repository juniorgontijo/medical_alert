const crypto = require('crypto');
const { db } = require('./db');

const SESSION_COOKIE = 'medalert_sid';
const sessions = new Map(); // sessionId -> userId

function createSession(userId) {
  const sid = crypto.randomBytes(24).toString('hex');
  sessions.set(sid, userId);
  return sid;
}

function destroySession(sid) {
  sessions.delete(sid);
}

function attachUser(req, res, next) {
  const sid = req.cookies ? req.cookies[SESSION_COOKIE] : null;
  req.user = null;
  if (sid && sessions.has(sid)) {
    const userId = sessions.get(sid);
    const user = db.prepare('SELECT id, role, name, email FROM users WHERE id = ?').get(userId);
    req.user = user || null;
  }
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado. Faça login novamente.' });
  next();
}

module.exports = { SESSION_COOKIE, createSession, destroySession, attachUser, requireAuth };
