const express = require('express');
const { db } = require('../lib/db');
const { requireAuth } = require('../lib/session');
const { checkThresholds } = require('../lib/rules');

const router = express.Router();

function serializePatient(p) {
  return {
    id: p.id, name: p.name, age: p.age, bed: p.bed, status: p.status,
    nurseId: p.nurse_id, doctorId: p.doctor_id,
    thresholds: { hrHigh: p.hr_high, hrLow: p.hr_low, spo2Low: p.spo2_low, tempHigh: p.temp_high, sysHigh: p.sys_high },
  };
}

// Lista de pacientes visível para o usuário logado, de acordo com o
// perfil (paciente vê só a si mesmo; enfermeiro/médico veem sua carteira).
router.get('/', requireAuth, (req, res) => {
  const { role, id } = req.user;
  let rows;
  if (role === 'patient') rows = db.prepare('SELECT * FROM patients WHERE id = ?').all(id);
  else if (role === 'nurse') rows = db.prepare('SELECT * FROM patients WHERE nurse_id = ?').all(id);
  else rows = db.prepare('SELECT * FROM patients WHERE doctor_id = ?').all(id);
  res.json({ patients: rows.map(serializePatient) });
});

// BUG DE SEGURANÇA (IDOR / Broken Object Level Authorization):
// esta rota exige apenas estar autenticado — não verifica se o
// usuário logado (inclusive um paciente) tem relação com o
// paciente solicitado. Qualquer :id existente retorna o registro
// completo, incluindo notas médicas privadas.
router.get('/:id', requireAuth, (req, res) => {
  const p = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Paciente não encontrado.' });

  const vitals = db.prepare('SELECT * FROM vitals WHERE patient_id = ? ORDER BY ts ASC').all(p.id);
  const alerts = db.prepare('SELECT * FROM alerts WHERE patient_id = ? ORDER BY created_at ASC').all(p.id);
  const prescriptions = db.prepare('SELECT * FROM prescriptions WHERE patient_id = ? ORDER BY ts ASC').all(p.id);

  res.json({
    patient: serializePatient(p),
    notes: p.notes,
    vitals: vitals.map(v => ({ ts: v.ts, hr: v.hr, spo2: v.spo2, temp: v.temp, sys: v.sys, dia: v.dia })),
    alerts: alerts.map(a => ({ id: a.id, severity: a.severity, message: a.message, status: a.status, createdAt: a.created_at, acknowledgedAt: a.acknowledged_at, acknowledgedBy: a.acknowledged_by })),
    prescriptions: prescriptions.map(x => ({ id: x.id, drug: x.drug, dose: x.dose, freq: x.freq, ts: x.ts })),
  });
});

// Registro de sinais vitais (perfil enfermagem). Sem validação de
// faixa no servidor — bug intencional (ex.: FC negativa é aceita).
router.post('/:id/vitals', requireAuth, (req, res) => {
  const p = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Paciente não encontrado.' });

  const { hr, spo2, temp, sys, dia } = req.body || {};
  const v = { hr: Number(hr), spo2: Number(spo2), temp: Number(temp), sys: Number(sys), dia: Number(dia) };
  const ts = Date.now();

  db.prepare('INSERT INTO vitals (patient_id, ts, hr, spo2, temp, sys, dia) VALUES (?,?,?,?,?,?,?)')
    .run(p.id, ts, v.hr, v.spo2, v.temp, v.sys, v.dia);

  const newAlerts = checkThresholds(p, v);
  res.status(201).json({ ok: true, newAlerts });
});

router.put('/:id/thresholds', requireAuth, (req, res) => {
  const p = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Paciente não encontrado.' });

  const { hrHigh, hrLow, spo2Low, tempHigh, sysHigh } = req.body || {};
  db.prepare(`
    UPDATE patients SET hr_high=?, hr_low=?, spo2_low=?, temp_high=?, sys_high=? WHERE id=?
  `).run(Number(hrHigh), Number(hrLow), Number(spo2Low), Number(tempHigh), Number(sysHigh), p.id);

  res.json({ ok: true });
});

// BUG DE FALHA SILENCIOSA: se o :id enviado não corresponder a um
// paciente existente (ex.: o front-end permite abrir a tela de
// prescrição sem um paciente selecionado), a rota ainda assim
// responde sucesso, mas nada é gravado no banco.
router.post('/:id/prescriptions', requireAuth, (req, res) => {
  const p = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
  const { drug, dose, freq } = req.body || {};

  if (p) {
    db.prepare('INSERT INTO prescriptions (patient_id, drug, dose, freq, ts) VALUES (?,?,?,?,?)')
      .run(p.id, drug, dose, freq, Date.now());
  }
  // (falta um "else" retornando erro aqui — bug intencional)

  res.status(201).json({ ok: true, message: 'Prescrição salva com sucesso.' });
});

router.post('/:id/discharge', requireAuth, (req, res) => {
  const p = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Paciente não encontrado.' });
  db.prepare("UPDATE patients SET status = 'alta' WHERE id = ?").run(p.id);
  res.json({ ok: true });
});

// Chamada de enfermagem feita pelo próprio paciente.
router.post('/:id/call-nurse', requireAuth, (req, res) => {
  const p = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Paciente não encontrado.' });
  db.prepare(`
    INSERT INTO alerts (patient_id, severity, message, status, created_at, acknowledged_at, acknowledged_by)
    VALUES (?, 'baixa', 'Paciente solicitou atendimento (chamada de enfermagem)', 'pending', ?, NULL, NULL)
  `).run(p.id, Date.now());
  res.status(201).json({ ok: true });
});

module.exports = router;
