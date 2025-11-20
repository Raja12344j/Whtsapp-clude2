require('dotenv').config();
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const ACCESS_TOKEN = process.env.ACCESS_TOKEN || '';
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || '';
const PORT = process.env.PORT || 3000;

let currentJob = null;
let logs = [];

function log(text) {
  const ts = new Date().toISOString();
  const entry = `[${ts}] ${text}`;
  console.log(entry);
  logs.push(entry);
  if (logs.length > 200) logs.shift();
}

async function sendWhatsAppMessage(to, message) {
  // If the target is a group id (endsWith @g.us) we use the 'to' as provided
  // For normal numbers using Cloud API we POST to /{PHONE_NUMBER_ID}/messages
  if (!ACCESS_TOKEN) {
    throw new Error('ACCESS_TOKEN not set in environment');
  }
  const url = `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`;
  const payload = {
    messaging_product: "whatsapp",
    to: to,
    type: "text",
    text: { body: message }
  };
  const headers = {
    Authorization: `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  };
  // Note: this will attempt to call the real WhatsApp Cloud API.
  const res = await axios.post(url, payload, { headers });
  return res.data;
}

app.post('/start', upload.single('messagesFile'), async (req, res) => {
  try {
    if (currentJob && currentJob.running) {
      return res.status(400).json({ error: 'Already running' });
    }
    const { targetType, targetId, intervalSeconds } = req.body;
    const interval = Number(intervalSeconds) || 10;
    if (!targetId) return res.status(400).json({ error: 'targetId required' });
    if (!req.file) return res.status(400).json({ error: 'messagesFile required' });

    // read file lines
    const filePath = path.resolve(req.file.path);
    const raw = fs.readFileSync(filePath, 'utf8');
    const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return res.status(400).json({ error: 'file contains no messages' });

    log(`Starting job. TargetType=${targetType}, Target=${targetId}, messages=${lines.length}, interval=${interval}s`);
    currentJob = { running: true, stopRequested: false };

    // Async loop: send messages in order, wait interval, repeat until stopped
    (async () => {
      try {
        while (!currentJob.stopRequested) {
          for (let i = 0; i < lines.length; i++) {
            if (currentJob.stopRequested) break;
            const message = lines[i];
            try {
              await sendWhatsAppMessage(targetId, message);
              log(`Sent to ${targetId}: "${message}"`);
            } catch (err) {
              log(`Error sending to ${targetId}: ${err.message || err}`);
            }
            // wait for interval seconds
            await new Promise(r => setTimeout(r, interval * 1000));
          }
        }
      } finally {
        log('Job stopped.');
        currentJob = null;
      }
    })();

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});

app.post('/stop', (req, res) => {
  if (!currentJob || !currentJob.running) {
    return res.status(400).json({ error: 'No running job' });
  }
  currentJob.stopRequested = true;
  return res.json({ success: true });
});

app.get('/logs', (req, res) => {
  res.json({ logs });
});

app.listen(PORT, () => {
  console.log('Server running on port', PORT);
  log('Server started');
});
