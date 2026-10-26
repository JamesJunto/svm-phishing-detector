from pathlib import Path
from urllib.parse import urlparse

import joblib
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS

from feature_extractor import extract_url_features_csv_compatible

app = Flask(__name__)
CORS(app)

BASE_DIR = Path(__file__).resolve().parent


def load_model():
    loaded_model = joblib.load(BASE_DIR / "phishing_model.joblib")
    for _, step in loaded_model.steps:
        if hasattr(step, "_fit_dtype") and not hasattr(step, "_fill_dtype"):
            step._fill_dtype = step._fit_dtype
    return loaded_model


model = load_model()
feature_names = joblib.load(BASE_DIR / "url_features.joblib")


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


@app.post("/predict")
def predict():
    body = request.get_json(silent=True) or {}
    url = str(body.get("url", "")).strip()

    if not url:
        return jsonify({"error": "URL is required"}), 400

    parsed_url = urlparse(url)
    if parsed_url.scheme not in {"http", "https"} or not parsed_url.netloc:
        return jsonify({"error": "A valid http or https URL is required"}), 400

    features = extract_url_features_csv_compatible(url)
    features_df = pd.DataFrame([features])[feature_names]
    prediction = int(model.predict(features_df)[0])

    return jsonify({
        "url": url,
        "prediction": prediction,
        "phishing": prediction == 0,
        "label": "Phishing" if prediction == 0 else "Legitimate"
    })


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000)