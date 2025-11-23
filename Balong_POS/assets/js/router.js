import { updateDashboard } from "./analytics.js";

export function initRouter() {
  const navItems = document.querySelectorAll(".nav-item[data-view]");
  const views = document.querySelectorAll(".view");
  const topbarTitle = document.getElementById("topbarTitle");
  const currentDateLabel = document.getElementById("currentDate");

  currentDateLabel.textContent = new Date().toLocaleDateString();

  const titles = {
    dashboard: "Dashboard – Today’s Overview",
    pos: "Point of Sale",
    customers: "Customers",
    appointments: "Appointments",
    services: "Services",
    inventory: "Inventory – Manage your product inventory",
    barbers: "Barbers",
    analytics: "Analytics",
    reports: "Reports",
    settings: "Settings",
  };

  navItems.forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = btn.dataset.view;

      navItems.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      views.forEach((v) => {
        v.classList.toggle("hidden", v.id !== `view-${view}`);
      });

      topbarTitle.textContent = titles[view] || "BALONG POS";

      if (view === "dashboard") {
        updateDashboard();
      }
    });
  });

  // initial
  updateDashboard();
}

export function applyRolePermissions(role) {
  const navItems = document.querySelectorAll(".nav-item[data-view]");
  const allowedByRole = {
    admin: [
      "dashboard",
      "pos",
      "customers",
      "appointments",
      "services",
      "inventory",
      "barbers",
      "analytics",
      "reports",
      "settings",
    ],
    cashier: ["dashboard", "pos", "customers", "appointments", "reports"],
    barber: ["dashboard", "pos", "appointments"],
  };

  const allowed = allowedByRole[role] || allowedByRole.admin;

  navItems.forEach((btn) => {
    const view = btn.dataset.view;
    btn.classList.toggle("hidden", !allowed.includes(view));
  });
}
