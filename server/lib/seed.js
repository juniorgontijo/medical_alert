const { db } = require('./db');

const ESCALATION_REQUIRED_MINUTES = 15;

function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function minutesAgo(m) {
  return Date.now() - m * 60 * 1000;
}

function clearAll() {
  db.exec(`
    DELETE FROM prescriptions;
    DELETE FROM alerts;
    DELETE FROM vitals;
    DELETE FROM patients;
    DELETE FROM users;
  `);
}

function seedDatabase() {
  clearAll();

  const insertUser = db.prepare('INSERT INTO users (id, role, name, email, password) VALUES (?,?,?,?,?)');
  const users = [
    ['pac1', 'patient', 'Marina Souza', 'marina@medalert.test', 'senha123'],
    ['pac2', 'patient', 'Roberto Lima', 'roberto@medalert.test', 'senha123'],
    ['enf1', 'nurse', 'Camila Duarte', 'camila@medalert.test', 'senha123'],
    ['enf2', 'nurse', 'Paulo Ferreira', 'paulo@medalert.test', 'senha123'],
    ['med1', 'doctor', 'Dra. Helena Prado', 'helena@medalert.test', 'senha123'],
  ];
  users.forEach(u => insertUser.run(...u));

  const insertPatient = db.prepare(`
    INSERT INTO patients (id, name, age, bed, nurse_id, doctor_id, status, hr_high, hr_low, spo2_low, temp_high, sys_high, notes)
    VALUES (@id, @name, @age, @bed, @nurse_id, @doctor_id, @status, @hr_high, @hr_low, @spo2_low, @temp_high, @sys_high, @notes)
  `);
  insertPatient.run({
    id: 'pac1', name: 'Marina Souza', age: 54, bed: '204A',
    nurse_id: 'enf1', doctor_id: 'med1', status: 'internado',
    hr_high: 100, hr_low: 50, spo2_low: 95, temp_high: 37.8, sys_high: 140,
    notes: 'Paciente em recuperação de cirurgia abdominal. Histórico de hipertensão controlada.'
  });
  insertPatient.run({
    id: 'pac2', name: 'Roberto Lima', age: 67, bed: '210B',
    nurse_id: 'enf2', doctor_id: 'med1', status: 'internado',
    hr_high: 100, hr_low: 50, spo2_low: 95, temp_high: 37.8, sys_high: 140,
    notes: 'DPOC em acompanhamento. Uso de oxigênio suplementar intermitente. Alergia a penicilina.'
  });

  const insertVitals = db.prepare('INSERT INTO vitals (patient_id, ts, hr, spo2, temp, sys, dia) VALUES (?,?,?,?,?,?,?)');
  insertVitals.run('pac1', minutesAgo(240), 76, 97, 36.6, 118, 76);
  insertVitals.run('pac1', minutesAgo(120), 80, 96, 36.8, 122, 78);
  insertVitals.run('pac2', minutesAgo(90), 94, 91, 37.1, 135, 85);

  const insertAlert = db.prepare(`
    INSERT INTO alerts (patient_id, severity, message, status, created_at, acknowledged_at, acknowledged_by)
    VALUES (?,?,?,?,?,?,?)
  `);
  // Alerta crítico pendente há mais de 30 min: reproduz o bug de
  // escalonamento automático sem precisar esperar.
  insertAlert.run('pac2', 'critica', 'Saturação de oxigênio abaixo do limite (91%)', 'pending', minutesAgo(35), null, null);

  const insertRx = db.prepare('INSERT INTO prescriptions (patient_id, drug, dose, freq, ts) VALUES (?,?,?,?,?)');
  insertRx.run('pac1', 'Dipirona', '500mg', '8/8h', minutesAgo(200));

  db.prepare('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)').run('reset_date', todayStr());
}

function ensureFreshForToday() {
  const row = db.prepare('SELECT value FROM meta WHERE key = ?').get('reset_date');
  if (!row || row.value !== todayStr()) {
    seedDatabase();
    return true;
  }
  return false;
}

module.exports = { seedDatabase, ensureFreshForToday, todayStr, ESCALATION_REQUIRED_MINUTES };
