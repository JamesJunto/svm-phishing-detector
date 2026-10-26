const API_URL = "http://127.0.0.1:5000/predict";
const form = document.getElementById("scan-form");
const input = document.getElementById("url-input");
const button = document.getElementById("scan-button");
const buttonLabel = document.getElementById("button-label");
const message = document.getElementById("form-message");
const result = document.getElementById("result");

document.addEventListener("DOMContentLoaded", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs[0]?.url;
    if (url && /^https?:\/\//i.test(url)) input.value = url;
  });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const url = input.value.trim();
  if (!isHttpUrl(url)) {
    showError("Enter a complete http or https website address.");
    return;
  }

  setLoading(true);
  showError("");
  result.classList.add("is-hidden");
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `The detector returned ${response.status}.`);
    renderResult(data);
  } catch (error) {
    showError(`${error.message} Start the local server with: py .\\backend\\server.py`);
  } finally {
    setLoading(false);
  }
});

function isHttpUrl(value) {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function renderResult(data) {
  const phishing = Boolean(data.phishing);
  result.classList.remove("is-hidden", "is-danger");
  result.classList.toggle("is-danger", phishing);
  document.getElementById("result-icon").textContent = phishing ? "!" : "✓";
  document.getElementById("result-title").textContent = phishing
    ? "Potential phishing site"
    : "This site looks safe";
  document.getElementById("result-description").textContent = phishing
    ? "Avoid entering passwords or payment details on this website."
    : "The model did not detect common phishing signals in this URL.";
  document.getElementById("checked-url").textContent = data.url;
}

function setLoading(loading) {
  button.disabled = loading;
  button.classList.toggle("is-loading", loading);
  buttonLabel.textContent = loading ? "Checking..." : "Analyze website";
}

function showError(text) {
  message.textContent = text;
}