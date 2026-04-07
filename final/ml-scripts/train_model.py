import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib
import os

def train_model():
    df = pd.read_csv('ml-scripts/healthcare_data.csv')
    X = df[['age', 'blood_pressure_sys', 'blood_pressure_dia', 'cholesterol', 'glucose']]
    y = df['disease_risk']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    os.makedirs('backend-fastapi', exist_ok=True)
    joblib.dump(model, 'backend-fastapi/risk_model.joblib')
    print(f"Model trained. Accuracy: {model.score(X_test, y_test):.2f}")

if __name__ == "__main__":
    train_model()
