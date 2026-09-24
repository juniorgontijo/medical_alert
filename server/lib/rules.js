const { db } = require('./db');
const { ESCALATION_REQUIRED_MINUTES } = require('./seed');

const insertAlert = db.prepare(`
  INSERT INTO alerts (patient_id, severity, message, status, created_at, acknowledged_at, acknowledged_by)
  VALUES (?,?,?, 'pending', ?, NULL, NULL)
`);

function checkThresholds(patient, v) {
  const now = Date.now();
  const found = [];

  // BUG DE LIMITE (boundary): a especificação diz "FC >= 100 gera alerta
  // ALTA". A implementação usa ">" (estritamente maior), então FC == 100
  // não dispara alerta.
  if (v.hr > patient.hr_high) found.push(['alta', `Frequência cardíaca elevada (${v.hr} bpm)`]);
  if (v.hr < patient.hr_low) found.push(['alta', `Frequência cardíaca baixa (${v.hr} bpm)`]);
  if (v.spo2 < patient.spo2_low) found.push(['critica', `Saturação de oxigênio abaixo do limite (${v.spo2}%)`]);
  if (v.temp >= patient.temp_high) found.push(['alta', `Febre — temperatura elevada (${v.temp}°C)`]);
  if (v.sys >= patient.sys_high) found.push(['media', `Pressão sistólica elevada (${v.sys} mmHg)`]);

  // Sem verificação de duplicidade: registrar os mesmos sinais vitais
  // duas vezes seguidas gera alertas repetidos — bug intencional.
  found.forEach(([severity, message]) => insertAlert.run(patient.id, severity, message, now));

  return found.length;
}

// Escalonamento automático de alertas críticos: especificado (ver
// documento do aluno) mas esta função nunca é chamada em nenhuma rota
// nem em nenhum agendador — bug intencional (código morto).
function checkAutoEscalation() {
  const limitMs = ESCALATION_REQUIRED_MINUTES * 60 * 1000;
  const cutoff = Date.now() - limitMs;
  const stmt = db.prepare(`
    UPDATE alerts SET status = 'escalated'
    WHERE severity = 'critica' AND status = 'pending' AND created_at < ?
  `);
  stmt.run(cutoff);
}
// (checkAutoEscalation nunca é invocada — ver bug "Escalonamento automático nunca acontece")

module.exports = { checkThresholds, checkAutoEscalation };
