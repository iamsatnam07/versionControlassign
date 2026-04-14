const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;
const BACKEND_URL = 'http://localhost:8000'; // Flask server

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/signup', async (req, res) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/signup`, req.body);
    res.send("Data submitted successfully to backend.");
  } catch (err) {
    res.status(500).send("Error sending data to backend.");
  }
});

app.listen(PORT, () => {
  console.log(`Frontend running at http://localhost:${PORT}`);
});
