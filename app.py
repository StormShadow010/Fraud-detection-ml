"""
Fraud Detection API — Backend Flask
Expone /predict con análisis de contribución por feature
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import pandas as pd
import json
import os

app = Flask(__name__)
CORS(app)

# ─── Cargar modelo ────────────────────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")
with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

FEATURES = [
    "amount", "hour", "day_of_week",
    "transactions_last_24h", "avg_amount_user",
    "distance_from_home", "is_international"
]

FEATURE_LABELS = {
    "amount":                "Monto de la transacción",
    "hour":                  "Hora del día",
    "day_of_week":           "Día de la semana",
    "transactions_last_24h": "Transacciones últimas 24h",
    "avg_amount_user":       "Monto promedio del usuario",
    "distance_from_home":    "Distancia desde casa",
    "is_international":      "Transacción internacional",
}

# Importancias globales del modelo
GLOBAL_IMPORTANCES = dict(zip(FEATURES, model.feature_importances_))


def compute_feature_contributions(input_data: dict, fraud_prob: float) -> list:
    """
    Aproxima la contribución de cada feature a la probabilidad de fraude
    usando permutation-style: cuánto cambia la prob si ese feature toma
    su valor 'seguro' (mediana legítima).
    """
    # Valores de referencia legítimos (baseline)
    SAFE_VALUES = {
        "amount": 85.0,
        "hour": 14,
        "day_of_week": 2,
        "transactions_last_24h": 1,
        "avg_amount_user": 100.0,
        "distance_from_home": 5.0,
        "is_international": 0,
    }

    base_df = pd.DataFrame([input_data])[FEATURES]
    base_prob = model.predict_proba(base_df)[0][1]

    contributions = []
    for feat in FEATURES:
        # Temporalmente reemplazar con valor seguro
        modified = dict(input_data)
        modified[feat] = SAFE_VALUES[feat]
        mod_df = pd.DataFrame([modified])[FEATURES]
        mod_prob = model.predict_proba(mod_df)[0][1]

        # Contribución = cuánto baja la prob si este feature fuera "normal"
        delta = base_prob - mod_prob  # positivo → impulsa fraude; negativo → mitiga

        contributions.append({
            "feature": feat,
            "label": FEATURE_LABELS[feat],
            "value": input_data[feat],
            "contribution": round(float(delta), 4),
            "global_importance": round(float(GLOBAL_IMPORTANCES[feat]), 4),
            "safe_value": SAFE_VALUES[feat],
        })

    # Ordenar por magnitud absoluta descendente
    contributions.sort(key=lambda x: abs(x["contribution"]), reverse=True)
    return contributions


@app.route("/predict", methods=["POST"])
def predict():
    try:
        body = request.get_json(force=True)

        # Validación mínima
        missing = [f for f in FEATURES if f not in body]
        if missing:
            return jsonify({"error": f"Faltan campos: {missing}"}), 400

        input_data = {f: float(body[f]) for f in FEATURES}
        df_input = pd.DataFrame([input_data])[FEATURES]

        prediction = int(model.predict(df_input)[0])
        proba = model.predict_proba(df_input)[0]
        fraud_prob = float(proba[1])
        legit_prob  = float(proba[0])

        contributions = compute_feature_contributions(input_data, fraud_prob)

        # Nivel de riesgo
        if fraud_prob >= 0.70:
            risk_level = "ALTO"
        elif fraud_prob >= 0.35:
            risk_level = "MEDIO"
        else:
            risk_level = "BAJO"

        return jsonify({
            "prediction": prediction,
            "is_fraud": prediction == 1,
            "fraud_probability": round(fraud_prob * 100, 2),
            "legit_probability": round(legit_prob * 100, 2),
            "risk_level": risk_level,
            "feature_contributions": contributions,
            "input": input_data,
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": "RandomForestClassifier", "features": FEATURES})


if __name__ == "__main__":
    print("🚀 Fraud Detection API corriendo en http://localhost:5000")
    app.run(debug=True, port=5000)
