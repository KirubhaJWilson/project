import os
import subprocess
import time
import sys

def run_setup():
    print("🏥 Starting Healthcare AI Platform Setup...")

    # 1. Generate local data and train model
    print("Generating synthetic data and training AI model...")
    subprocess.run([sys.executable, "setup.py"], check=True)

    # 2. Seed Firebase (Optional, requires serviceAccountKey.json)
    if os.path.exists("backend-node/serviceAccountKey.json"):
        print("Detected serviceAccountKey.json. Seeding data to Firebase...")
        subprocess.run([sys.executable, "ml-scripts/seed_firebase.py"], check=True)
    else:
        print("⚠️ No serviceAccountKey.json found. Backend will run in demo/mock mode.")
        print("To use a real Firebase project, place your service account key in backend-node/")

    # 3. Start all services
    print("\n🚀 Launching All Services...")

    # Start FastAPI
    fastapi_proc = subprocess.Popen(
        ["uvicorn", "main:app", "--port", "8000", "--host", "0.0.0.0"],
        cwd="backend-fastapi",
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )

    # Start Node.js
    node_proc = subprocess.Popen(
        ["node", "server.js"],
        cwd="backend-node",
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )

    # Start React
    env = os.environ.copy()
    env["PORT"] = "3000"
    env["BROWSER"] = "none"
    react_proc = subprocess.Popen(
        ["npm", "start"],
        cwd="frontend",
        env=env,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )

    print("\n✅ Platform is live!")
    print("- Dashboard: http://localhost:3000")
    print("- Firebase API: http://localhost:5000")
    print("- AI Engine: http://localhost:8000")
    print("\nPress Ctrl+C to shut down.")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Shutting down...")
        fastapi_proc.terminate()
        node_proc.terminate()
        react_proc.terminate()
        print("Goodbye!")

if __name__ == "__main__":
    run_setup()
