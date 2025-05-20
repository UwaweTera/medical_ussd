const express = require('express');
const bodyParser = require('body-parser');
const ussdHandler = require('./ussdHandler');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/ussd', ussdHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`USSD app listening on port ${PORT}`);
});
