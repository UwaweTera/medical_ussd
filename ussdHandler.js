const pool = require('./db');

module.exports = async function ussdHandler(req, res) {
  try {
    const { sessionId, phoneNumber, text } = req.body;

    // Validate required fields
    if (!sessionId || !phoneNumber) {
      return res.send('END Invalid request. Missing required fields.');
    }

    const inputs = text ? text.split('*') : [];
    const level = inputs.length;

    // Language selection screen
    if (!text) {
      return res.send(`CON Welcome / Murakaza neza\n1. English\n2. Kinyarwanda`);
    }

    // Handle language selection
    if (level === 1) {
      const lang = inputs[0] === '1' ? 'EN' : 'RW';
      await pool.query(
        `INSERT INTO Sessions(sessionId, phoneNumber, language, userInput)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (sessionId) DO UPDATE
         SET phoneNumber = $2, language = $3, userInput = $4`,
        [sessionId, phoneNumber, lang, text]
      );
      const menu = lang === 'EN'
        ? `CON Main Menu\n1. Register\n2. Medicine Info\n0. Exit`
        : `CON Menyu Nyamukuru\n1. Kwiyandikisha\n2. Amakuru ya ubuzima\n0. Sohoka`;
      return res.send(menu);
    }

    const session = await pool.query(
      'SELECT * FROM Sessions WHERE sessionId = $1',
      [sessionId]
    ).then(result => result.rows[0]);

    if (!session) {
      return res.send('END Session expired. Please start again.');
    }

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
      
      if (!name || !medicine) {
        return res.send(lang === 'EN'
          ? `END Invalid input. Please try again.`
          : `END Andika neza. Ongera ugerageze.`);
      }

      await pool.query(
        `INSERT INTO Patients(name, phone, medicine) VALUES ($1, $2, $3)`,
        [name, phoneNumber, medicine]
      );
      return res.send(lang === 'EN'
        ? `END Registered successfully!`
        : `END Kwiyandikisha byagenze neza!`);
    }

    // Medicine info lookup
    if (level === 3 && inputs[1] === '2') {
      const medName = inputs[2];
      
      if (!medName) {
        return res.send(lang === 'EN'
          ? `END Please enter a medicine name.`
          : `END Andika izina rya ubuzima.`);
      }

      const result = await pool.query(
        'SELECT * FROM Medications WHERE name = $1',
        [medName]
      );
      
      if (result.rows.length === 0) {
        return res.send(lang === 'EN'
          ? `END No info found.`
          : `END Nta makuru abonetse.`);
      }

      const row = result.rows[0];
      const response = lang === 'EN'
        ? `END Info: ${row.info}\nSide Effects: ${row.sideeffects}`
        : `END Amakuru: ${row.info}\nIngaruka: ${row.sideeffects}`;
      return res.send(response);
    }

    // Handle invalid input
    return res.send(lang === 'EN'
      ? `END Invalid input. Please try again.`
      : `END Andika neza. Ongera ugerageze.`);

  } catch (error) {
    console.error('USSD Handler Error:', error);
    return res.send('END An error occurred. Please try again later.');
  }
};
