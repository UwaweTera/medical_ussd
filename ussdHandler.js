const db = require('./db');

module.exports = async function ussdHandler(req, res) {
  const { sessionId, phoneNumber, text } = req.body;
  const inputs = text.split('*');
  const level = inputs.length;

  // Language selection screen
  if (text === '') {
    return res.send(`CON Welcome / Murakaza neza\n1. English\n2. Kinyarwanda`);
  }

  // Handle language selection
  if (level === 1) {
    const lang = inputs[0] === '1' ? 'EN' : 'RW';
    db.run(`INSERT OR REPLACE INTO Sessions(sessionId, phoneNumber, language, userInput)
            VALUES (?, ?, ?, ?)`, [sessionId, phoneNumber, lang, text]);
    const menu = lang === 'EN'
      ? `CON Main Menu\n1. Register\n2. Medicine Info\n0. Exit`
      : `CON Menyu Nyamukuru\n1. Kwiyandikisha\n2. Amakuru ya ubuzima\n0. Sohoka`;
    return res.send(menu);
  }

  const session = await new Promise((resolve, reject) => {
    db.get(`SELECT * FROM Sessions WHERE sessionId = ?`, [sessionId], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

  const lang = session.language;

  // Main menu navigation
  if (level === 2) {
    const choice = inputs[1];
    if (choice === '1') {
      return res.send(lang === 'EN'
        ? `CON Enter your name:`
        : `CON Andika izina ryawe:`);
    } else if (choice === '2') {
      return res.send(lang === 'EN'
        ? `CON Enter medicine name:`
        : `CON Andika izina rya ubuzima:`);
    } else {
      return res.send(lang === 'EN'
        ? `END Thank you!`
        : `END Murakoze!`);
    }
  }

  // Registration input: medicine
  if (level === 3 && inputs[1] === '1') {
    return res.send(lang === 'EN'
      ? `CON Enter your medicine:`
      : `CON Andika izina rya ubuzima ukoresha:`);
  }

  // Save registration
  if (level === 4 && inputs[1] === '1') {
    const name = inputs[2];
    const medicine = inputs[3];
    db.run(`INSERT INTO Patients(name, phone, medicine) VALUES (?, ?, ?)`,
      [name, phoneNumber, medicine]);
    return res.send(lang === 'EN'
      ? `END Registered successfully!`
      : `END Kwiyandikisha byagenze neza!`);
  }

  // Medicine info lookup
  if (level === 3 && inputs[1] === '2') {
    const medName = inputs[2];
    db.get(`SELECT * FROM Medications WHERE name = ?`, [medName], (err, row) => {
      if (err || !row) {
        return res.send(lang === 'EN'
          ? `END No info found.`
          : `END Nta makuru abonetse.`);
      }
      const response = lang === 'EN'
        ? `END Info: ${row.info}\nSide Effects: ${row.sideEffects}`
        : `END Amakuru: ${row.info}\nIngaruka: ${row.sideEffects}`;
      return res.send(response);
    });
  }
};
