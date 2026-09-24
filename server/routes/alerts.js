const express = require('express');
const { db } = require('../lib/db');
const { requireAuth } = require('../lib/session');

const router = express.Router();

// BUG: não verifica se o alerta já está reconhecido — pode ser
// "reconhecido" novamente, sobrescrevendo quem reconheceu e quando.
router.post('/:id/acknowledge', requireAuth, (req, res) => {
  const alert = db.prepare('SELECT * FROM alerts WHERE id = ?').get(req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alerta não encontrado.' });

  db.prepare(`
    UPDATE alerts SET status='acknowledged', acknowledged_at=?, acknowledged_by=? WHERE id=?
  `).run(Date.now(), req.user.name, alert.id);

  res.json({ ok: true });
});

router.post('/:id/escalate', requireAuth, (req, res) => {
  const alert = db.prepare('SELECT * FROM alerts WHERE id = ?').get(req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alerta não encontrado.' });

  db.prepare("UPDATE alerts SET status='escalated' WHERE id=?").run(alert.id);
  res.json({ ok: true });
});

module.exports = router;
