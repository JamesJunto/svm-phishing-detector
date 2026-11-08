
(() => {
  const overlayId = "phishguard-warning-overlay";

  document.getElementById(overlayId)?.remove();

  const overlay = document.createElement("div");
  overlay.id = overlayId;

  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    z-index: 2147483647;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 30px;
    background: #b00020;
    color: white;
    font-family: Arial, sans-serif;
    text-align: center;
  `;

  const content = document.createElement("div");
  content.style.cssText = `
    max-width: 650px;
    width: 100%;
  `;

  const icon = document.createElement("div");
  icon.textContent = "⚠";
  icon.style.cssText = `
    font-size: 80px;
    margin-bottom: 25px;
  `;

  const title = document.createElement("h1");
  title.textContent = "Dangerous Website Detected";
  title.style.cssText = `
    font-size: 38px;
    margin: 0 0 20px;
  `;

  const message = document.createElement("p");
  message.textContent =
    "This website has been identified as potentially malicious. It may be attempting to steal your passwords, financial information, or personal data.";
  message.style.cssText = `
    font-size: 18px;
    line-height: 1.6;
    margin-bottom: 25px;
  `;



  const leave = document.createElement("button");
  leave.textContent = "Leave Site";
  leave.style.cssText = `
    margin-top: 20px;
    padding: 14px 30px;
    border: none;
    border-radius: 6px;
    background: white;
    color: #b00020;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
  `;

  leave.addEventListener("click", () => {
    history.back();
  });

  const note = document.createElement("p");
  note.textContent = "Protected by PhishGuard";
  note.style.cssText = `
    margin-top: 30px;
    font-size: 13px;
    opacity: 0.8;
  `;

  content.append(icon, title, message, leave, note);
  overlay.append(content);
  document.documentElement.append(overlay);
})();
