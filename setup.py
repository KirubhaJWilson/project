import pandas as pd
import numpy as np
import random
import os
import sqlite3
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib

def run_setup():
    print("Initializing healthcare environment...")
    np.random.seed(42)
    random.seed(42)
    num_records = 1000

    # 1. Generate Patients
    patient_ids = [f"P{str(i).zfill(4)}" for i in range(1, num_records + 1)]
    names = [f"Patient_{i}" for i in range(1, num_records + 1)]
    ages = np.random.randint(18, 90, size=num_records)
    genders = [random.choice(['Male', 'Female']) for _ in range(num_records)]
    blood_pressure_sys = np.random.randint(90, 180, size=num_records)
    blood_pressure_dia = np.random.randint(60, 110, size=num_records)
    cholesterol = np.random.randint(150, 300, size=num_records)
    glucose = np.random.randint(70, 200, size=num_records)

    disease_risk = []
    for i in range(num_records):
        risk_score = 0
        if blood_pressure_sys[i] > 140 or blood_pressure_dia[i] > 90: risk_score += 1
        if glucose[i] > 140: risk_score += 1
        if cholesterol[i] > 240: risk_score += 1
        if ages[i] > 60: risk_score += 0.5
        disease_risk.append(1 if risk_score >= 2 else 0)

    df = pd.DataFrame({
        'patient_id': patient_ids, 'name': names, 'age': ages, 'gender': genders,
        'blood_pressure_sys': blood_pressure_sys, 'blood_pressure_dia': blood_pressure_dia,
        'cholesterol': cholesterol, 'glucose': glucose, 'disease_risk': disease_risk
    })

    # 2. Generate Logs
    logs = []
    for pid in patient_ids:
        for j in range(5):
            logs.append({'patient_id': pid, 'timestamp': f"2023-10-01 {random.randint(0, 23)}:{random.randint(0, 59)}", 'heart_rate': random.randint(60, 110), 'steps': random.randint(0, 10000), 'sleep_hours': round(random.uniform(4, 9), 1)})
    logs_df = pd.DataFrame(logs)

    # 3. Import to SQLite
    conn = sqlite3.connect('healthcare.db')
    df.to_sql('patients', conn, if_exists='replace', index=False)
    logs_df.to_sql('wearable_logs', conn, if_exists='replace', index=False)
    conn.close()

    # 4. Train Model
    X = df[['age', 'blood_pressure_sys', 'blood_pressure_dia', 'cholesterol', 'glucose']]
    y = df['disease_risk']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    os.makedirs('backend-fastapi', exist_ok=True)
    joblib.dump(model, 'backend-fastapi/risk_model.joblib')
    print("Setup complete. Database ready and AI model trained.")

if __name__ == "__main__":
    run_setup()
