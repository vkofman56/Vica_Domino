/**
 * Vica Domino - Server
 *
 * Simple Express server that:
 * 1. Serves the static front-end files
 * 2. Provides a REST API so every user's data is stored on disk
 *    (instead of only in the browser's localStorage)
 *
 * Data is kept in  data/<userId>.json  — one file per user.
 */

const express = require('express');
const fs      = require('fs');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');

// Ensure the data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ---- Middleware ----
app.use(express.json({ limit: '10mb' }));          // games can carry SVG markup
app.use(express.static(path.join(__dirname)));      // serve index.html, js/, css/, etc.

// ---- Helpers ----

function sanitizeUserId(id) {
    // Allow only alphanumeric, dash, underscore (max 40 chars)
    return String(id).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40);
}

function userFile(userId) {
    return path.join(DATA_DIR, sanitizeUserId(userId) + '.json');
}

// ---- API routes ----

/**
 * GET /api/sync/:userId
 * Returns all stored key-value pairs for the given user.
 */
app.get('/api/sync/:userId', (req, res) => {
    const userId = sanitizeUserId(req.params.userId);
    if (!userId) return res.status(400).json({ error: 'Invalid user id' });

    const file = userFile(userId);
    if (!fs.existsSync(file)) {
        return res.json({ data: {} });
    }
    try {
        const raw = fs.readFileSync(file, 'utf8');
        return res.json({ data: JSON.parse(raw) });
    } catch (e) {
        return res.json({ data: {} });
    }
});

/**
 * POST /api/sync
 * Body: { userId: string, data: { key: value, ... } }
 * Overwrites the user's data file with the supplied object.
 */
app.post('/api/sync', (req, res) => {
    const userId = sanitizeUserId(req.body && req.body.userId);
    if (!userId) return res.status(400).json({ error: 'Invalid user id' });

    const data = req.body.data;
    if (typeof data !== 'object' || data === null) {
        return res.status(400).json({ error: 'Invalid data' });
    }

    try {
        fs.writeFileSync(userFile(userId), JSON.stringify(data, null, 2), 'utf8');
        return res.json({ ok: true });
    } catch (e) {
        return res.status(500).json({ error: 'Write failed' });
    }
});

/**
 * GET /api/users
 * Returns the list of existing user ids (file names minus .json).
 * Useful for the login screen's user picker.
 */
app.get('/api/users', (_req, res) => {
    try {
        const files = fs.readdirSync(DATA_DIR)
            .filter(f => f.endsWith('.json'))
            .map(f => f.replace(/\.json$/, ''));
        return res.json({ users: files });
    } catch (e) {
        return res.json({ users: [] });
    }
});

// ---- Start ----
app.listen(PORT, () => {
    console.log('Vica Domino server running on http://localhost:' + PORT);
});
