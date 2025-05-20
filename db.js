const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/med.db');

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS Sessions (
    sessionId TEXT PRIMARY KEY,
    phoneNumber TEXT,
    language TEXT,
    userInput TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    phone TEXT,
    medicine TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Medications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    info TEXT,
    sideEffects TEXT
  )`);
});

module.exports = db;
