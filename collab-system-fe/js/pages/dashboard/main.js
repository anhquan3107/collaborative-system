// main.js (root entry)
import { getCurrentUser } from "../../../api/user.js";
import { 
  initProjectManager, 
  clearRecentProject, 
  openProject
} from "./projectManager.js";
import "./invitationManager.js";
import { notyf } from "../../../vendor/utils/notify.js";
import { initMessageManager, resetUnreadMessages } from "./messageManager.js";



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

