const STORAGE_KEY = "customExemptedDomains";

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
  "colab.research.google.com",
];

export function createDomainManager({
  form,
  input,
  message,
  list,
}) {
  let customDomains = [];

  chrome.storage.local.get({ [STORAGE_KEY]: [] }, (settings) => {
    customDomains = sanitizeStoredDomains(settings[STORAGE_KEY]);
    renderCustomDomains(list, customDomains);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const domain = normalizeDomain(input.value);
    if (!domain) {
      showMessage(message, "Enter a valid domain, such as example.com.");
      return;
    }

    if ([...exemptedDomains, ...customDomains].includes(domain)) {
      showMessage(message, "That domain is already trusted.");
      return;
    }

    customDomains = [...customDomains, domain];
    saveDomains(customDomains);
    input.value = "";
    showMessage(message, "");
    renderCustomDomains(list, customDomains);
  });

  list.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove-domain]");
    if (!removeButton) {
      return;
    }

    customDomains = customDomains.filter(
      (domain) => domain !== removeButton.dataset.removeDomain,
    );
    saveDomains(customDomains);
    renderCustomDomains(list, customDomains);
  });

  return {
    isExemptedUrl(value) {
      const hostname = new URL(value).hostname.toLowerCase();
      return [...exemptedDomains, ...customDomains].some(
        (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
      );
    },
  };
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
    .filter(Boolean);
}

function saveDomains(domains) {
  chrome.storage.local.set({ [STORAGE_KEY]: domains });
}

function renderCustomDomains(list, domains) {
  list.replaceChildren();

  for (const domain of domains) {
    const item = document.createElement("li");
    item.className = "custom-domain";

    const label = document.createElement("span");
    label.textContent = domain;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.textContent = "Remove";
    removeButton.dataset.removeDomain = domain;

    item.append(label, removeButton);
    list.append(item);
  }
}

function showMessage(element, text) {
  element.textContent = text;
}
