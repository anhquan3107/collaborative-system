import { getCurrentUser } from "../api/user.js";

(async () => {
  const token = localStorage.getItem("token");
  const navUserEmail = document.getElementById("navUserEmail");

  if (token) {
    try {
      // Fetch current user info if logged in
      const data = await getCurrentUser();

      if (navUserEmail) {
        const nameToShow = data.user.username || data.user.email;
        navUserEmail.textContent = nameToShow;
      }

      console.log("✅ Logged in as:", data.user);
    } catch (err) {
      console.error("⚠️ Invalid or expired token, clearing it...");
      localStorage.removeItem("token");
      if (navUserEmail) navUserEmail.textContent = "Guest";
    }
  } else {
    // No token — just show guest mode
    if (navUserEmail) navUserEmail.textContent = "Guest";
    console.log("Viewing as Guest (not logged in)");
  }
})();

// Logout handler
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "index.html"; // stay on homepage after logout
});
