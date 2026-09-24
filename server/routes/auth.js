const express = require('express');
const { db } = require('../lib/db');
const { SESSION_COOKIE, createSession, destroySession, requireAuth } = require('../lib/session');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Lista pública de usuários (sem senha) para popular um seletor de
// login rápido no front-end — não é um problema de segurança por si só,
// mas é bom o aluno observar o que uma rota "pública" está expondo.
router.get('/directory', (req, res) => {
  const users = db.prepare('SELECT id, name, role, email FROM users ORDER BY role, name').all();
  res.json({ users });
});

router.get('/me', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });
  res.json({ user: req.user });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Informe o e-mail.' });

  const user = db.prepare('SELECT * FROM users WHERE lower(email) = lower(?)').get(email);
  if (!user) return res.status(401).json({ error: 'Usuário não encontrado.' });

  // BUG DE AUTENTICAÇÃO: a senha enviada não é comparada com a senha
  // cadastrada — qualquer valor não vazio é aceito como válido.
  if (!password || password.length === 0) {
    return res.status(400).json({ error: 'Informe uma senha.' });
  }

  const sid = createSession(user.id);
  res.cookie(SESSION_COOKIE, sid, { httpOnly: true, sameSite: 'lax' });
  res.json({ user: { id: user.id, role: user.role, name: user.name, email: user.email } });
});

router.post('/logout', (req, res) => {
  const sid = req.cookies ? req.cookies[SESSION_COOKIE] : null;
  if (sid) destroySession(sid);
  res.clearCookie(SESSION_COOKIE);
  res.json({ ok: true });
});

router.post('/register', (req, res) => {
  const { name, email, role, password, confirmPassword } = req.body || {};

  if (!name || !name.trim()) return res.status(400).json({ error: 'Informe o nome completo.' });
  if (!EMAIL_RE.test(email || '')) return res.status(400).json({ error: 'Informe um e-mail válido.' });
  if (!['patient', 'nurse', 'doctor'].includes(role)) return res.status(400).json({ error: 'Perfil inválido.' });
  if (!password || password.length < 6) return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
  if (password !== confirmPassword) return res.status(400).json({ error: 'As senhas não coincidem.' });

  const existing = db.prepare('SELECT id FROM users WHERE lower(email) = lower(?)').get(email);
  if (existing) return res.status(409).json({ error: 'Já existe uma conta com este e-mail.' });

  const id = 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  db.prepare('INSERT INTO users (id, role, name, email, password) VALUES (?,?,?,?,?)')
    .run(id, role, name.trim(), email.trim(), password);

  if (role === 'patient') {
    const defaultNurse = db.prepare("SELECT id FROM users WHERE role = 'nurse' LIMIT 1").get();
    const defaultDoctor = db.prepare("SELECT id FROM users WHERE role = 'doctor' LIMIT 1").get();
    db.prepare(`
      INSERT INTO patients (id, name, age, bed, nurse_id, doctor_id, status, hr_high, hr_low, spo2_low, temp_high, sys_high, notes)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(id, name.trim(), null, '—', defaultNurse ? defaultNurse.id : null, defaultDoctor ? defaultDoctor.id : null,
      'internado', 100, 50, 95, 37.8, 140, '');
  }

  res.status(201).json({ ok: true });
});

module.exports = router;
