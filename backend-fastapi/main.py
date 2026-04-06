from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import shap
import numpy as np

app = FastAPI()
model = joblib.load('risk_model.joblib')
explainer = shap.TreeExplainer(model)

class PredictionInput(BaseModel):
    age: int
    blood_pressure_sys: int
    blood_pressure_dia: int
    cholesterol: int
    glucose: int

@app.post("/predict")
def predict_risk(data: PredictionInput):
    input_df = pd.DataFrame([data.model_dump()])
    prediction = int(model.predict(input_df)[0])
    probability = float(model.predict_proba(input_df)[0][1])
    shap_values = explainer.shap_values(input_df)
    if isinstance(shap_values, list):
        shap_vals = shap_values[1][0]
    else:
        shap_vals = shap_values[0] if len(shap_values.shape) == 2 else shap_values[0, :, 1]
    return {
        "prediction": prediction,
        "probability": probability,
        "shap_values": shap_vals.tolist(),
        "feature_names": input_df.columns.tolist()
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}
