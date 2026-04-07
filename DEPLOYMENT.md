# 🚀 Vercel Deployment Guide

To deploy this Healthcare AI Platform to Vercel, use the following settings in your Vercel Dashboard.

## 🏗️ Build and Output Settings
Based on your project structure, configure these in **Project Settings > Build & Development Settings**:

- **Framework Preset**: `Other` (Vercel will detect the root monorepo)
- **Build Command**: `npm run build`
- **Output Directory**: `.` (The `vercel.json` file handles routing to subdirectories)
- **Install Command**: `npm install`

## 🔐 Environment Variables
In **Project Settings > Environment Variables**, add the following keys from your screenshots:

| Key | Value |
| :--- | :--- |
| `JWT_SECRET` | (Your secure secret string) |
| `FIREBASE_SERVICE_ACCOUNT` | (The complete JSON string of your Firebase Service Account) |
| `REACT_APP_API_URL` | (The URL of your deployed backend, e.g., `https://your-project.vercel.app/api/node`) |

## 📁 Monorepo Structure
The included `vercel.json` handles the following routing:
- **React Frontend**: Root and non-API paths.
- **Node.js Backend**: Proxied via `/api/node/`
- **FastAPI AI Backend**: Proxied via `/api/ml/`

## 🛠️ Pre-Deployment Step
Before pushing to GitHub, ensure you have run:
1. `python3 setup.py` (To generate the initial model file)
2. Ensure `risk_model.joblib` is uploaded to your `backend-fastapi/` folder.
