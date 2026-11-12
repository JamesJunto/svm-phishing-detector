(() => {
  const overlayId = "phishguard-trusted-domains-overlay";
  const storageKey = "customExemptedDomains";
  const builtInDomains = [
    "youtube.com", "reddit.com", "twitter.com", "facebook.com",
    "instagram.com", "linkedin.com", "tiktok.com", "snapchat.com",
    "pinterest.com", "whatsapp.com", "telegram.org", "signal.org",
    "messenger.com", "discord.com", "slack.com", "skype.com",
    "zoom.us", "twitch.tv", "viber.com", "line.me", "github.com",
    "classroom.google.com", "learn.quipper.com", "umtc.umindanao.edu.ph",
    "colab.research.google.com",
  ];

  document.getElementById(overlayId)?.remove();

  const overlay = document.createElement("div");
  overlay.id = overlayId;
  overlay.style.cssText = [
    "position:fixed", "inset:0", "z-index:2147483647",
    "display:flex", "align-items:center", "justify-content:center",
    "padding:24px", "background:rgba(15,23,42,.62)",
    "font:16px/1.5 system-ui,sans-serif", "color:#172033",
  ].join(";");

  const panel = document.createElement("section");
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-labelledby", "phishguard-trusted-title");
  panel.style.cssText = [
    "width:min(720px,100%)", "max-height:min(760px,100%)",
    "overflow:hidden", "padding:28px", "border-radius:16px",
    "background:#fff", "box-shadow:0 24px 80px rgba(15,23,42,.35)",
  ].join(";");

  const header = document.createElement("header");
  header.style.cssText = "display:flex;align-items:center;justify-content:space-between;gap:16px;";

  const title = document.createElement("h1");
  title.id = "phishguard-trusted-title";
  title.textContent = "Trusted domains";
  title.style.cssText = "margin:0;font-size:26px;";

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.textContent = "Close";
  closeButton.style.cssText = buttonStyle("#eef2ff", "#3730a3");
  header.append(title, closeButton);

  const description = document.createElement("p");
  description.textContent = "These domains are treated as trusted and are not sent to the detector.";
  description.style.cssText = "margin:8px 0 20px;color:#68738a;";

  const form = document.createElement("form");
  form.style.cssText = "display:flex;gap:10px;margin-bottom:8px;";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "example.com";
  input.style.cssText = "flex:1;min-width:0;padding:12px;border:1px solid #e5e9f1;border-radius:9px;font:inherit;";

  const addButton = document.createElement("button");
  addButton.type = "submit";
  addButton.textContent = "Add domain";
  addButton.style.cssText = buttonStyle("#4f46e5", "#fff");
  form.append(input, addButton);

  const message = document.createElement("p");
  message.style.cssText = "min-height:22px;margin:0 0 8px;color:#c24145;font-size:13px;";

  const list = document.createElement("ul");
  list.style.cssText = [
    "display:grid", "grid-template-columns:repeat(auto-fill,minmax(230px,1fr))",
    "gap:8px", "max-height:460px", "overflow:auto", "padding:0 4px 0 0",
    "margin:0", "list-style:none",
  ].join(";");

  panel.append(header, description, form, message, list);
  overlay.append(panel);
  document.documentElement.append(overlay);

  let customDomains = [];

  chrome.storage.local.get({ [storageKey]: [] }, (settings) => {
    customDomains = sanitize(settings[storageKey]);
    render();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const domain = normalizeDomain(input.value);

    if (!domain) {
      message.textContent = "Enter a valid domain, such as example.com.";
      return;
    }
    if ([...builtInDomains, ...customDomains].includes(domain)) {
      message.textContent = "That domain is already trusted.";
      return;
    }

    customDomains = [...customDomains, domain];
    chrome.storage.local.set({ [storageKey]: customDomains });
    input.value = "";
    message.textContent = "";
    render();
  });

  list.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-domain]");
    if (!button) return;

    customDomains = customDomains.filter(
      (domain) => domain !== button.dataset.removeDomain,
    );
    chrome.storage.local.set({ [storageKey]: customDomains });
    render();
  });

  closeButton.addEventListener("click", () => overlay.remove());
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) overlay.remove();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") overlay.remove();
  }, { once: true });

  function render() {
    list.replaceChildren();
    for (const domain of builtInDomains) appendDomain(domain, false);
    for (const domain of customDomains) appendDomain(domain, true);
  }

  function appendDomain(domain, removable) {
    const item = document.createElement("li");
    item.style.cssText = "display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;border-radius:8px;background:#f5f7fb;color:#455168;";
    const label = document.createElement("span");
    label.textContent = domain;
    item.append(label);

    if (removable) {
      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.textContent = "Remove";
      removeButton.dataset.removeDomain = domain;
      removeButton.style.cssText = "border:0;background:transparent;color:#c24145;cursor:pointer;";
      item.append(removeButton);
    } else {
      const builtInLabel = document.createElement("small");
      builtInLabel.textContent = "Built-in";
      builtInLabel.style.cssText = "color:#68738a;font-size:11px;";
      item.append(builtInLabel);
    }
    list.append(item);
  }

  function normalizeDomain(value) {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) return "";
    try {
      const parsed = new URL(
        /^[a-z][a-z\d+\-.]*:\/\//i.test(trimmed)
          ? trimmed
          : `https://${trimmed}`,
      );
      return parsed.hostname ? parsed.hostname.replace(/\.$/, "") : "";
    } catch {
      return "";
    }
  }

  function sanitize(domains) {
    if (!Array.isArray(domains)) return [];
    return domains.map(normalizeDomain).filter(Boolean).filter(
      (domain, index, values) =>
        values.indexOf(domain) === index && !builtInDomains.includes(domain),
    );
  }

  function buttonStyle(background, color) {
    return `padding:11px 16px;border:0;border-radius:9px;background:${background};color:${color};font:700 14px system-ui,sans-serif;cursor:pointer;`;
  }
})();
