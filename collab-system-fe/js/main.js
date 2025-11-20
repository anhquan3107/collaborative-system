import { getCurrentUser } from "../api/user.js";
import './pages/invitation/invitationManager.js';

(async () => {
  const token = localStorage.getItem("token");

  const navUserEmail = document.getElementById("navUserEmail");
  const userMenu = document.getElementById("userMenu");
  const guestMenu = document.getElementById("guestMenu");
  const guestMenu2 = document.getElementById("guestMenu2");

  // -----------------------------
  // CASE 1: No token → Guest user
  // -----------------------------
  if (!token) {
    console.log("Viewing as Guest");

    if (navUserEmail) navUserEmail.textContent = "Guest";

    // Show: Login + Register
    guestMenu?.classList.remove("d-none");
    guestMenu2?.classList.remove("d-none");

    // Hide: user dropdown
    userMenu?.classList.add("d-none");

    return;
  }

  // -----------------------------
  // CASE 2: Has token → load user
  // -----------------------------
  try {
    const data = await getCurrentUser();
    console.log("✅ Logged in as:", data.user);

    // Update username
    if (navUserEmail) {
      navUserEmail.textContent = data.user.username || data.user.email;
    }

    // Show user menu, hide guest menu
    userMenu?.classList.remove("d-none");
    guestMenu?.classList.add("d-none");
    guestMenu2?.classList.add("d-none");

  } catch (err) {
    console.error("⚠️ Invalid or expired token, clearing it...", err);

    // Reset to guest mode
    localStorage.removeItem("token");

    if (navUserEmail) navUserEmail.textContent = "Guest";

    guestMenu?.classList.remove("d-none");
    guestMenu2?.classList.remove("d-none");
    userMenu?.classList.add("d-none");
  }
})();

// --------------------------------
// LOGOUT HANDLER
// --------------------------------
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "index.html"; // reload homepage
});
