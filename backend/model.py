from flask import Flask, request, jsonify
import joblib
import pandas as pd

from feature_extractor import extract_url_features_csv_compatible

app = Flask(__name__)

model = joblib.load("phishing_model.joblib")
feature_names = joblib.load("url_features.joblib")


@app.post("/predict")
def predict():
    body = request.get_json()
    url = body.get("url", "").strip()

    if not url:
        return jsonify({"error": "URL is required"}), 400

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