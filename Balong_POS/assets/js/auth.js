import { applyRolePermissions } from "./router.js";

let currentUser = null;

export function initAuth() {
  const loginForm = document.getElementById("loginForm");
  const loginScreen = document.getElementById("loginScreen");
  const appShell = document.getElementById("appShell");
  const logoutBtn = document.getElementById("logoutBtn");
  const loginRole = document.getElementById("loginRole");

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("loginUsername").value || "demo";
    const role = loginRole.value || "admin";

    currentUser = { username, role };

    loginScreen.classList.add("hidden");
    appShell.classList.remove("hidden");
    applyRolePermissions(role);
  });

  logoutBtn.addEventListener("click", () => {
    currentUser = null;
    appShell.classList.add("hidden");
    loginScreen.classList.remove("hidden");
  });
}

export function getCurrentUser() {
  return currentUser;
}
