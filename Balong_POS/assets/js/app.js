import { loadState, getState } from "./storage.js";
import { initAuth } from "./auth.js";
import { initRouter } from "./router.js";
import { initReports } from "./reports.js";
import { initPOS } from "./pos.js";
import { initInventory } from "./inventory.js";
import { initBarbers } from "./barbers.js";
import { initCustomers } from "./customers.js";
import { initServices } from "./services.js";
import { initAppointments } from "./appointments.js";
import { initAnalytics } from "./analytics.js";
import { initSettings, applyTheme } from "./settings.js";


document.addEventListener("DOMContentLoaded", () => {
  loadState();
  applyTheme(getState().settings);

  initAuth();
  initRouter();
  initPOS();
  initInventory();
  initBarbers();
  initCustomers();
  initServices();
  initAppointments();
  initAnalytics();
  initSettings();
  initReports(); 
});
