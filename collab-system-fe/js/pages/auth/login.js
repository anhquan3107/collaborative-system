import { login } from "../../../api/auth.js";
import { notyf } from "../../../vendor/utils/notify.js";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const data = await login(email, password);

    localStorage.setItem("token", data.token);
    
    // 1. Show success message
    notyf.success("Login successful! Redirecting...");

    // 2. Wait 1.5 seconds before redirecting so user sees the message
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);

  } catch (err) {
    console.error("Error:", err);
    // Show error message
    notyf.error(err.message || "Login failed");
  }
});