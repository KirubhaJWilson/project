import sqlite3
import pandas as pd

def import_data():
    conn = sqlite3.connect('healthcare.db')
    cursor = conn.cursor()
    cursor.execute("DROP TABLE IF EXISTS patients")
    cursor.execute("""
        CREATE TABLE patients (
            patient_id TEXT PRIMARY KEY,
            name TEXT,
            age INTEGER,
            gender TEXT,
            blood_pressure_sys INTEGER,
            blood_pressure_dia INTEGER,
            cholesterol INTEGER,
            glucose INTEGER,
            disease_risk INTEGER
        )
    """)
    df = pd.read_csv('ml-scripts/healthcare_data.csv')
    df.to_sql('patients', conn, if_exists='append', index=False)
    cursor.execute("DROP TABLE IF EXISTS wearable_logs")
    cursor.execute("""
        CREATE TABLE wearable_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id TEXT,
            timestamp TEXT,
            heart_rate INTEGER,
            steps INTEGER,
            sleep_hours REAL,
            FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
        )
    """)
    logs_df = pd.read_csv('ml-scripts/wearable_logs.csv')
    logs_df.to_sql('wearable_logs', conn, if_exists='append', index=False)
    conn.commit()
    conn.close()
    print("Data imported")

if __name__ == "__main__":
    import_data()
