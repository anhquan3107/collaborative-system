// main.js (root entry)
import { getCurrentUser } from "../../../api/user.js";
import { 
  initProjectManager, 
  clearRecentProject, 
  openProject,
  loadProjectStats
} from "./projectManager.js";
import { loadInvitations } from "./invitationManager.js";
import { notyf } from "../../../vendor/utils/notify.js";
import { initMessageManager } from "./messageManager.js";


window.reloadDashboard = reloadDashboard;
window.openProject = openProject;
(async () => {

  const token = localStorage.getItem("token");

  if (!token) {
    console.log("Viewing as guest");
    setupGuestUI();
    return;
  }

  try {
    const data = await getCurrentUser();

    setupUserUI(data.user);

    //  Load dashboard only after user is authenticated
    initProjectManager();
    initMessageManager();
    reloadDashboard();
    setInterval(loadInvitations, 30000);
    
  } catch (err) {
    console.log("Invalid token → reset", err);

    localStorage.removeItem("token");
    setupGuestUI();
  }
})();

// ------------------------------
// UI functions
// ------------------------------
function setupGuestUI() {
  document.getElementById("navUserEmail").textContent = "Guest";
  document.getElementById("guestMenu").classList.remove("d-none");
  document.getElementById("guestMenu2")?.classList.remove("d-none");
  document.getElementById("userMenu").classList.add("d-none");
}

function setupUserUI(user) {
  document.getElementById("navUserEmail").textContent = user.username;
  document.getElementById("guestMenu").classList.add("d-none");
  document.getElementById("guestMenu2")?.classList.add("d-none");
  document.getElementById("userMenu").classList.remove("d-none");
}

// ------------------------------
// LOGOUT HANDLER
// ------------------------------
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("token");
  clearRecentProject(); // 
  window.location.href = "index.html";
});

// ------------------------------
// Chat protection
// ------------------------------
document.getElementById("navChatLink")?.addEventListener("click", (e) => {
  if (!localStorage.getItem("token")) {
    e.preventDefault();
    notyf.error("Please login first to access Chat");
  }
});

export async function reloadDashboard() {
  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("Reload skipped: no token");
    return;
  }

  console.log("🔄 Reloading dashboard…");

  try {
    await Promise.all([
      loadProjectStats(),
      loadInvitations()
    ]);
  } catch (err) {
    console.error("Dashboard reload failed:", err);
    notyf.error("Failed to reload dashboard");
  }
}



