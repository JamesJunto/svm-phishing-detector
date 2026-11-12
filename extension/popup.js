const API_URL = "http://127.0.0.1:5000/predict";
const form = document.getElementById("scan-form");
const input = document.getElementById("url-input");
const button = document.getElementById("scan-button");
const buttonLabel = document.getElementById("button-label");
const message = document.getElementById("form-message");
const result = document.getElementById("result");
const blockingToggle = document.getElementById("blocking-toggle");
let blockingEnabled = true;

const exemptedDomains = [
  "youtube.com",
  "reddit.com",
  "twitter.com",
  "facebook.com",
  "instagram.com",
  "linkedin.com",
  "tiktok.com",
  "snapchat.com",
  "pinterest.com",
  "whatsapp.com",
  "telegram.org",
  "signal.org",
  "messenger.com",
  "discord.com",
  "slack.com",
  "skype.com",
  "zoom.us",
  "twitch.tv",
  "viber.com",
  "line.me",
  "github.com",
  "classroom.google.com",
  "learn.quipper.com",
  "umtc.umindanao.edu.ph",  
];

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get({ blockingEnabled: true }, (settings) => {
    blockingEnabled = settings.blockingEnabled;
    blockingToggle.checked = blockingEnabled;
  });

  blockingToggle.addEventListener("change", () => {
    blockingEnabled = blockingToggle.checked;
    chrome.storage.local.set({ blockingEnabled });
  });

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

  showError("");
  result.classList.add("is-hidden");

  if (isExemptedUrl(url)) {
    renderResult({ url, phishing: false, exempted: true });
    return;
  }

  setLoading(true);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    const text = await response.text();
    console.log(text);

    const data = JSON.parse(text);

    if (!response.ok) {
      throw new Error(
        data.error || `The detector returned ${response.status}.`,
      );
    }

    const shouldBlock = renderResult(data);

    if (shouldBlock) {
      blockCurrentTab();
    }

  } catch (error) {
    showError(
      `${error.message} Start the local server with: py .\\backend\\server.py`,
    );
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

function isExemptedUrl(value) {
  const hostname = new URL(value).hostname.toLowerCase();
  return exemptedDomains.some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
  );
}



function renderResult(data) {
  const svmPhishing = data.phishing;
  const phishTankMatch =
    data.phishtank_response?.results?.in_database;
  const shouldBlock = blockingEnabled && (svmPhishing || phishTankMatch === true);

  let title;
  let description;
  let phishing = false;

  if (svmPhishing && phishTankMatch === true) {
    title = "Malicious Website Detected";
    description = "This website has been identified as a phishing threat.";
    phishing = true;

  } else if (svmPhishing && phishTankMatch === false) {
    title = "Suspicious Website";
    description = "This website exhibits characteristics commonly associated with phishing.";
    phishing = true;

  } else if (!svmPhishing && phishTankMatch === true) {
    title = "Malicious Website Detected";
    description = "This website has been identified as a reported phishing threat.";
    phishing = true;

  } else if (!svmPhishing && phishTankMatch === false) {
    title = "Website Appears Safe";
    description = "No known phishing indicators were detected.";

  } else if (svmPhishing) {
    title = "Suspicious Website";
    description = "This website exhibits potentially harmful characteristics.";
    phishing = true;

  } else {
    title = "Website Reputation Unavailable";
    description = "No suspicious URL patterns were detected, but the website's reputation could not be verified.";
  }

  result.classList.remove("is-hidden", "is-danger");
  result.classList.toggle("is-danger", phishing);

  document.getElementById("result-icon").textContent =
    phishing ? "!" : "✓";

  document.getElementById("result-title").textContent = title;
  document.getElementById("result-description").textContent = description;
  document.getElementById("checked-url").textContent = data.url;

  return shouldBlock;
}



function blockCurrentTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0]?.id;

    if (tabId === undefined) {
      showError("Unable to display the security warning.");
      return;
    }

    chrome.scripting.executeScript({
      target: { tabId },
      files: ["block.js"],
    }).catch(() => {
      showError("Unable to display the security warning on this page.");
    });
  });
}

function setLoading(loading) {
  button.disabled = loading;
  button.classList.toggle("is-loading", loading);
  buttonLabel.textContent = loading ? "Checking..." : "Analyze website";
}

function showError(text) {
  message.textContent = text;
}
