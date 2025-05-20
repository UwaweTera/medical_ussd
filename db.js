const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Create tables
const createTables = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Sessions (
        sessionId TEXT PRIMARY KEY,
        phoneNumber TEXT,
        language TEXT,
        userInput TEXT
      );

      CREATE TABLE IF NOT EXISTS Patients (
        id SERIAL PRIMARY KEY,
        name TEXT,
        phone TEXT,
        medicine TEXT
      );

      CREATE TABLE IF NOT EXISTS Medications (
        id SERIAL PRIMARY KEY,
        name TEXT,
        info TEXT,
        sideEffects TEXT
      );
    `);
    console.log('Tables created successfully');
  } catch (err) {
    console.error('Error creating tables:', err);
  }
};

createTables();

module.exports = pool;
