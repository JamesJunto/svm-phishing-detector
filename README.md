# PhishGuard

PhishGuard is a browser extension backed by a Python machine-learning API. It analyzes URL features with a saved Linear SVM model and warns the user when a URL is classified as phishing.

## Project structure

```text
backend/
  feature_extractor.py       Converts URLs into model features
  server.py                  Flask API
  phishing_model.joblib      Trained scikit-learn pipeline
  url_features.joblib        Feature names and ordering

extension/
  manifest.json              Chrome/Edge extension configuration
  popup.html                 Extension popup
  popup.js                   Popup and API behavior
  block.js                   Reversible warning overlay
  style.css                  Popup styles

requirements.txt             Python dependencies
phishing_detector(10).ipynb  Model training notebook
```

## Requirements

- Python 3
- Google Chrome or Microsoft Edge
- The Python packages listed in `requirements.txt`

## Install dependencies

From the project root:

```powershell
py -m pip install -r requirements.txt
```

If `py` is not available, use the Python command configured by your local installation:

```powershell
python -m pip install -r requirements.txt
```

## Start the backend

From the project root:

```powershell
py .\backend\server.py
```

The API runs at:

```text
http://127.0.0.1:5000
```

Keep this terminal running while using the extension.

### Check that the API is running

Open this URL in a browser:

```text
http://127.0.0.1:5000/health
```

Expected response:

```json
{"status":"ok"}
```

### Test a prediction directly

In PowerShell:

```powershell
$body = @{ url = "https://example.com" } | ConvertTo-Json
Invoke-RestMethod `
  -Uri "http://127.0.0.1:5000/predict" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

The response contains:

```json
{
  "url": "https://example.com",
  "prediction": 0,
  "phishing": true,
  "label": "Phishing"
}
```

The saved model currently uses:

- `0` = Phishing
- `1` = Legitimate

## Load the browser extension

1. Start the backend using the instructions above.
2. Open `chrome://extensions` in Chrome, or `edge://extensions` in Edge.
3. Enable **Developer mode**.
4. Select **Load unpacked**.
5. Choose the project’s `extension` folder:

   ```text
   C:\Projects\phishing detector\svm-phishing-detector\extension
   ```

6. Pin the PhishGuard extension to the browser toolbar.
7. Open a webpage and click the PhishGuard icon.

After changing extension files, return to the extensions page and click **Reload** for PhishGuard.

## How to use it

1. Open a website.
2. Open the PhishGuard popup.
3. Confirm or edit the URL.
4. Click **Analyze website**.
5. Review the result.

If the model classifies the URL as phishing, the extension injects a reversible warning overlay into the current page. The overlay provides:

- **Leave site** — navigates back to the previous page.
- **Continue anyway** — removes the overlay and restores access to the page.

The extension does not delete or overwrite the page’s HTML.

## Trusted domains

Some well-known domains are exempted in `extension/popup.js`, including YouTube, Reddit, GitHub, Discord, Twitch, and others. URLs under those domains are shown as trusted and are not sent to the model.

For example:

```text
https://www.youtube.com/watch?v=example
```

is treated as trusted because `www.youtube.com` is a subdomain of `youtube.com`.

Only exact domains and their subdomains match. A domain such as `fakeyoutube.com` is not trusted.

## How predictions work

The notebook trains a `LinearSVC` pipeline using URL-only features. The backend:

1. Validates the submitted URL.
2. Extracts the same features used during training.
3. Orders them using `url_features.joblib`.
4. Runs the saved pipeline from `phishing_model.joblib`.
5. Returns a JSON prediction to the extension.

The detector only analyzes the URL. It does not inspect page content, forms, redirects, certificates, or domain reputation.

## Troubleshooting

### The popup says the local server cannot be reached

Make sure the backend is running:

```powershell
py .\backend\server.py
```

Then verify:

```text
http://127.0.0.1:5000/health
```

### The extension does not update

Open the browser’s extensions page and click **Reload** after changing files.

### The model gives unexpected results

The model is trained from URL features only. A legitimate site may still be classified as phishing. Retrain and evaluate the model with representative phishing and legitimate URLs before relying on it for real-world protection.

