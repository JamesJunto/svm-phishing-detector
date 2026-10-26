(() => {
  const overlayId = "phishguard-warning-overlay";
  const existingOverlay = document.getElementById(overlayId);
  if (existingOverlay) {
    existingOverlay.remove();
  }

  const overlay = document.createElement("div");
  overlay.id = overlayId;
  overlay.setAttribute("role", "alertdialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.style.cssText = [
    "position: fixed",
    "inset: 0",
    "z-index: 2147483647",
    "display: grid",
    "place-items: center",
    "padding: 24px",
    "background: rgba(15, 23, 42, .94)",
    "color: #f8fafc",
    "font: 16px/1.5 system-ui, sans-serif"
  ].join(";");

  const card = document.createElement("div");
  card.style.cssText = [
    "width: min(460px, 100%)",
    "padding: 32px",
    "border: 1px solid #ef4444",
    "border-radius: 16px",
    "background: #1e293b",
    "box-shadow: 0 24px 80px rgba(0, 0, 0, .45)"
  ].join(";");

  const title = document.createElement("h1");
  title.textContent = "Potential phishing site";
  title.style.cssText = "margin: 0 0 12px; color: #fca5a5; font-size: 26px;";

  const message = document.createElement("p");
  message.textContent = "PhishGuard has paused this page because its URL matched phishing indicators. Your page was not deleted.";
  message.style.cssText = "margin: 0 0 24px; color: #cbd5e1;";

  const leave = document.createElement("button");
  leave.type = "button";
  leave.textContent = "Leave site";
  leave.style.cssText = "margin-right: 10px; padding: 10px 16px; border: 0; border-radius: 8px; background: #ef4444; color: white; font-weight: 700; cursor: pointer;";
  leave.addEventListener("click", () => window.history.back());

  const continueButton = document.createElement("button");
  continueButton.type = "button";
  continueButton.textContent = "Continue anyway";
  continueButton.style.cssText = "padding: 10px 16px; border: 1px solid #64748b; border-radius: 8px; background: transparent; color: #e2e8f0; cursor: pointer;";
  continueButton.addEventListener("click", () => overlay.remove());

  card.append(title, message, leave, continueButton);
  overlay.append(card);
  document.documentElement.append(overlay);
})();