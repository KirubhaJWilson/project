import requests
import json
import time

def test_integration():
    # 1. Register a user
    base_url = "http://localhost:5000"
    reg_data = {"username": "testuser_int", "password": "password", "role": "patient"}
    r = requests.post(f"{base_url}/register", json=reg_data)
    assert r.status_code == 201
    print("Registration OK")

    # 2. Login
    login_data = {"username": "testuser_int", "password": "password"}
    r = requests.post(f"{base_url}/login", json=login_data)
    assert r.status_code == 200
    token = r.json()["token"]
    print("Login OK")

    # 3. Predict via Node.js
    headers = {"Authorization": f"Bearer {token}"}
    pred_data = {"age": 65, "blood_pressure_sys": 150, "blood_pressure_dia": 95, "cholesterol": 250, "glucose": 160}
    r = requests.post(f"{base_url}/predict", json=pred_data, headers=headers)
    assert r.status_code == 200
    assert "prediction" in r.json()
    print("AI Prediction via Node.js OK")

    # 4. Fetch Patients
    r = requests.get(f"{base_url}/patients", headers=headers)
    assert r.status_code == 200
    assert len(r.json()) > 0
    print("Patient fetch OK")

if __name__ == "__main__":
    try:
        test_integration()
        print("ALL TESTS PASSED")
    except Exception as e:
        print(f"TEST FAILED: {e}")
