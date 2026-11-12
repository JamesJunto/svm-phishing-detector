const STORAGE_KEY = "customExemptedDomains";

export const exemptedDomains = [
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
  "colab.research.google.com",
];

export function loadCustomDomains() {
  return new Promise((resolve) => {
    chrome.storage.local.get({ [STORAGE_KEY]: [] }, (settings) => {
      resolve(sanitizeStoredDomains(settings[STORAGE_KEY]));
    });
  });
}

export function isTrustedUrl(value, customDomains) {
  const hostname = new URL(value).hostname.toLowerCase();
  return [...exemptedDomains, ...customDomains].some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
  );
}

function normalizeDomain(value) {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) {
    return "";
  }

  try {
    const parsed = new URL(
      /^[a-z][a-z\d+\-.]*:\/\//i.test(trimmed)
        ? trimmed
        : `https://${trimmed}`,
    );

    if (!parsed.hostname || parsed.username || parsed.password) {
      return "";
    }

    return parsed.hostname.replace(/\.$/, "");
  } catch {
    return "";
  }
}

function sanitizeStoredDomains(domains) {
  if (!Array.isArray(domains)) {
    return [];
  }

  return domains
    .filter((domain) => typeof domain === "string")
    .map(normalizeDomain)
    .filter(Boolean)
    .filter((domain, index, normalizedDomains) =>
      normalizedDomains.indexOf(domain) === index &&
      !exemptedDomains.includes(domain),
    );
}
