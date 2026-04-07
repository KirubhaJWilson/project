import pandas as pd
import json
import os
import firebase_admin
from firebase_admin import credentials, firestore
import bcrypt

def seed_firestore():
    print("🌱 Starting Firebase Seeding...")
    # 1. Initialize Firebase
    if os.path.exists('backend-node/serviceAccountKey.json'):
        cred = credentials.Certificate('backend-node/serviceAccountKey.json')
        firebase_admin.initialize_app(cred)
    else:
        firebase_admin.initialize_app(options={'projectId': 'healthcare-platform-demo'})

    db = firestore.client()

    # 2. Seed Default Test User (Fixes "Login Failed")
    print("Creating default test user...")
    hashed_pw = bcrypt.hashpw("password".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    db.collection('users').document('testuser').set({
        'username': 'testuser',
        'password': hashed_pw,
        'role': 'patient'
    }, merge=True)
    print("✅ Default user 'testuser' (password: 'password') created.")

    # 3. Seed Patients
    if os.path.exists('ml-scripts/healthcare_data.csv'):
        df = pd.read_csv('ml-scripts/healthcare_data.csv')
        print(f"Uploading {len(df)} patient records...")
        for _, row in df.iterrows():
            patient_id = str(row['patient_id'])
            db.collection('patients').document(patient_id).set(row.to_dict())
        print("✅ Patients seeded.")

    # 4. Seed Wearable Logs
    if os.path.exists('ml-scripts/wearable_logs.csv'):
        logs_df = pd.read_csv('ml-scripts/wearable_logs.csv')
        demo_patients = [f"P{str(i).zfill(4)}" for i in range(1, 51)]
        demo_logs = logs_df[logs_df['patient_id'].isin(demo_patients)]

        print(f"Uploading {len(demo_logs)} wearable log entries...")
        for _, row in demo_logs.iterrows():
            db.collection('wearable_logs').add(row.to_dict())
        print("✅ Wearable logs seeded.")

if __name__ == "__main__":
    try:
        seed_firestore()
        print("🚀 Firebase Seeding Complete.")
    except Exception as e:
        print(f"❌ Seeding error: {e}")
