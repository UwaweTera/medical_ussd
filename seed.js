// seed.js
const db = require('./db');

db.run(`INSERT INTO Medications(name, info, sideEffects)
VALUES (?, ?, ?)`,
['Paracetamol', 'Used to treat pain and fever', 'Nausea, allergic reactions'], function(err) {
  if (err) {
    return console.log("Error inserting:", err.message);
  }
  console.log("Sample medication inserted.");
});
