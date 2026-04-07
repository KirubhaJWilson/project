require('dotenv').config();
const admin = require('firebase-admin');

// 1. Check for service account JSON or environment variables
let serviceAccount;
try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else {
        serviceAccount = require('./serviceAccountKey.json');
    }
} catch (e) {
    console.warn("⚠️ Firebase credentials not found. Defaulting to local Firestore emulator or mock mode for development.");
    // In a sandbox/mock environment, we can gracefully degrade or expect a running emulator
}

if (serviceAccount) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log("🔥 Firebase Admin initialized successfully.");
} else {
    // For the sake of this demo/sandbox, we'll initialize with dummy project ID to show the architecture
    admin.initializeApp({ projectId: 'healthcare-platform-demo' });
    console.log("🏗️ Initialized in demo/mock mode.");
}

const db = admin.firestore();

module.exports = { admin, db };
