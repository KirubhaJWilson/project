const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 5000;
// In production, this should be an environment variable
const SECRET_KEY = process.env.JWT_SECRET || 'healthcare_secret_fallback';
const DB_PATH = path.resolve(__dirname, '../healthcare.db');

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) console.error('Database connection error:', err.message);
    else console.log('Connected to healthcare database.');
});

// Auth Tables
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT
    )`);
});

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

app.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`,
            [username, hashedPassword, role || 'patient'],
            (err) => {
                if (err) return res.status(400).json({ error: 'Username already exists' });
                res.status(201).json({ message: 'User registered' });
            }
        );
    } catch (e) { res.status(500).send(); }
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
        if (err || !user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY);
        res.json({ token, role: user.role });
    });
});

app.get('/patients', authenticateToken, (req, res) => {
    db.all(`SELECT * FROM patients LIMIT 50`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/patients/:id', authenticateToken, (req, res) => {
    db.get(`SELECT * FROM patients WHERE patient_id = ?`, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
});

app.get('/logs/:patient_id', authenticateToken, (req, res) => {
    db.all(`SELECT * FROM wearable_logs WHERE patient_id = ?`, [req.params.patient_id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/predict', authenticateToken, async (req, res) => {
    try {
        const response = await axios.post('http://localhost:8000/predict', req.body);
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: 'ML service error' });
    }
});

// FHIR / HL7 Interoperability Module
app.get('/fhir/Patient/:id', authenticateToken, (req, res) => {
    db.get(`SELECT * FROM patients WHERE patient_id = ?`, [req.params.id], (err, row) => {
        if (err || !row) return res.status(404).json({ error: 'Not found' });
        res.json({
            resourceType: "Patient",
            id: row.patient_id,
            name: [{ text: row.name }],
            gender: row.gender.toLowerCase(),
            birthDate: new Date(new Date().getFullYear() - row.age, 0, 1).toISOString().split('T')[0]
        });
    });
});

app.listen(PORT, () => console.log(`Node backend running on port ${PORT}`));
