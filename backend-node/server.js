const express = require('express');
const { db, admin } = require('./firebaseConfig');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 5000;
const SECRET_KEY = process.env.JWT_SECRET || 'healthcare_secret_fallback';

app.use(cors());
app.use(express.json());

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

// --- Auth with Firebase ---
app.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        // Using Firestore for user storage
        const userRef = db.collection('users').doc(username);
        const doc = await userRef.get();
        if (doc.exists) return res.status(400).json({ error: 'Username exists' });

        await userRef.set({ username, password: hashedPassword, role: role || 'patient' });
        res.status(201).json({ message: 'User registered' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userRef = db.collection('users').doc(username);
        const doc = await userRef.get();
        if (!doc.exists) return res.status(401).json({ error: 'Invalid credentials' });

        const user = doc.data();
        if (!(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: username, username: user.username, role: user.role }, SECRET_KEY);
        res.json({ token, role: user.role });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- Patient CRUD (Firebase) ---
app.get('/patients', authenticateToken, async (req, res) => {
    try {
        const snapshot = await db.collection('patients').limit(50).get();
        const patients = snapshot.docs.map(doc => doc.data());
        res.json(patients);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/patients/:id', authenticateToken, async (req, res) => {
    try {
        const doc = await db.collection('patients').doc(req.params.id).get();
        if (!doc.exists) return res.status(404).json({ error: 'Not found' });
        res.json(doc.data());
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/logs/:patient_id', authenticateToken, async (req, res) => {
    try {
        const snapshot = await db.collection('wearable_logs')
            .where('patient_id', '==', req.params.patient_id)
            .get();
        const logs = snapshot.docs.map(doc => doc.data());
        res.json(logs);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- ML Proxy ---
app.post('/predict', authenticateToken, async (req, res) => {
    try {
        const ml_url = process.env.ML_SERVICE_URL || 'http://localhost:8000';
        const response = await axios.post(`${ml_url}/predict`, req.body);
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: 'ML service error' });
    }
});

// --- FHIR / HL7 Interoperability Module ---
app.get('/fhir/Patient/:id', authenticateToken, async (req, res) => {
    try {
        const doc = await db.collection('patients').doc(req.params.id).get();
        if (!doc.exists) return res.status(404).json({ error: 'Not found' });
        const row = doc.data();
        res.json({
            resourceType: "Patient",
            id: row.patient_id,
            name: [{ text: row.name }],
            gender: row.gender.toLowerCase(),
            birthDate: new Date(new Date().getFullYear() - row.age, 0, 1).toISOString().split('T')[0]
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(PORT, () => console.log(`Firebase-Node backend running on port ${PORT}`));
