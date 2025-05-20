// seed.js
const pool = require('./db');

async function seed() {
  try {
    await pool.query(
      `INSERT INTO Medications(name, info, sideeffects)
       VALUES ($1, $2, $3)`,
      ['Paracetamol', 'Used to treat pain and fever', 'Nausea, allergic reactions']
    );
    console.log("Sample medication inserted.");
  } catch (err) {
    console.error("Error inserting:", err.message);
  } finally {
    await pool.end();
  }
}

seed();
