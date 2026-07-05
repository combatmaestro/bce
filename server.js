const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 5501;
const dataPath = path.join(__dirname, 'data.json');

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get('/api/data', (req, res) => {
  fs.readFile(dataPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to read data file' });
    }
    try {
      return res.json(JSON.parse(data));
    } catch (parseErr) {
      return res.status(500).json({ error: 'Invalid JSON data' });
    }
  });
});

app.post('/api/save', (req, res) => {
  const payload = req.body;
  if (!payload || typeof payload !== 'object') {
    return res.status(400).json({ error: 'Invalid payload' });
  }
  fs.writeFile(dataPath, JSON.stringify(payload, null, 2), 'utf8', err => {
    if (err) {
      return res.status(500).json({ error: 'Unable to save data' });
    }
    return res.json({ success: true });
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
