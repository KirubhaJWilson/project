import pandas as pd
import json
import os
import firebase_admin
from firebase_admin import credentials, firestore

def seed_firestore():
    print("🌱 Starting Firebase Seeding...")
    # 1. Initialize Firebase
    # Use environment variable or default to project ID for emulator/demo mode
    if os.path.exists('backend-node/serviceAccountKey.json'):
        cred = credentials.Certificate('backend-node/serviceAccountKey.json')
        firebase_admin.initialize_app(cred)
    else:
        # Emulator/demo fallback
        firebase_admin.initialize_app(options={'projectId': 'healthcare-platform-demo'})

    db = firestore.client()

    # 2. Seed Patients
    if os.path.exists('ml-scripts/healthcare_data.csv'):
        df = pd.read_csv('ml-scripts/healthcare_data.csv')
        print(f"Uploading {len(df)} patient records...")
        for _, row in df.iterrows():
            patient_id = str(row['patient_id'])
            db.collection('patients').document(patient_id).set(row.to_dict())
        print("✅ Patients seeded.")

    # 3. Seed Wearable Logs
    if os.path.exists('ml-scripts/wearable_logs.csv'):
        logs_df = pd.read_csv('ml-scripts/wearable_logs.csv')
        # Limit seeding for wearable logs to avoid quotas in trial/demo mode if needed
        # But here we'll seed for all P0001-P0050 for a robust demo
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
        print("Note: If you don't have a real Firebase project yet, this script illustrates the seeding logic.")
