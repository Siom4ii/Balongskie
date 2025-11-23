import { getState, updateState } from "./storage.js";

export function initSettings() {
  const s = getState().settings;
  document.getElementById("settingsShopName").value = s.shopName || "";
  document.getElementById("settingsShopAddress").value = s.shopAddress || "";
  document.getElementById("settingsShopPhone").value = s.shopPhone || "";
  document.getElementById("settingsTaxRate").value = s.taxRate || 0;
  document.getElementById("settingsReceiptHeader").value =
    s.receiptHeader || "";
  document.getElementById("settingsReceiptFooter").value =
    s.receiptFooter || "";
  document.getElementById("settingsDarkMode").checked = !!s.darkMode;

  document
    .getElementById("saveSettingsBtn")
    .addEventListener("click", handleSaveSettings);

  applyTheme(s);
}

function handleSaveSettings() {
  const shopName = document.getElementById("settingsShopName").value;
  const shopAddress = document.getElementById("settingsShopAddress").value;
  const shopPhone = document.getElementById("settingsShopPhone").value;
  const taxRate = parseFloat(
    document.getElementById("settingsTaxRate").value || "0"
  );
  const receiptHeader =
    document.getElementById("settingsReceiptHeader").value || shopName;
  const receiptFooter =
    document.getElementById("settingsReceiptFooter").value ||
    "Thank you for visiting!";
  const darkMode = document.getElementById("settingsDarkMode").checked;

  updateState((prev) => ({
    ...prev,
    settings: {
      ...prev.settings,
      shopName,
      shopAddress,
      shopPhone,
      taxRate: isNaN(taxRate) ? 0 : taxRate,
      receiptHeader,
      receiptFooter,
      darkMode,
    },
  }));

  applyTheme(getState().settings);

  alert("Settings saved.");
}

export function applyTheme(settings) {
  const body = document.body;
  if (settings.darkMode) {
    body.style.setProperty("--bg-body", "#020617");
    body.style.setProperty("--bg-card", "#020617");
    body.style.setProperty("--text-main", "#f9fafb");
  } else {
    body.style.setProperty("--bg-body", "#f5f5f7");
    body.style.setProperty("--bg-card", "#ffffff");
    body.style.setProperty("--text-main", "#111827");
  }
}
