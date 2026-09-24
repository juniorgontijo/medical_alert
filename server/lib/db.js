const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'medalert.db');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      age INTEGER,
      bed TEXT,
      nurse_id TEXT,
      doctor_id TEXT,
      status TEXT DEFAULT 'internado',
      hr_high INTEGER, hr_low INTEGER,
      spo2_low INTEGER,
      temp_high REAL,
      sys_high INTEGER,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS vitals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id TEXT,
      ts INTEGER,
      hr INTEGER, spo2 INTEGER, temp REAL, sys INTEGER, dia INTEGER
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id TEXT,
      severity TEXT,
      message TEXT,
      status TEXT,
      created_at INTEGER,
      acknowledged_at INTEGER,
      acknowledged_by TEXT
    );

    CREATE TABLE IF NOT EXISTS prescriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id TEXT,
      drug TEXT, dose TEXT, freq TEXT, ts INTEGER
    );
  `);
}

initSchema();

module.exports = { db, DB_PATH, DATA_DIR };
