import { login } from "../../../api/auth.js";
import { notyf } from "../../../vendor/utils/notify.js";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  // Get submit button and store original state
  const submitBtn = document.querySelector('#loginForm button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  //disable button & show loading state
  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    Signing in...
  `;
  try {
    const data = await login(email, password);

    localStorage.setItem("token", data.token);
    //successful login (keep button disabled with loading state)
    // 1. Show success message
    notyf.success("Login successful! Redirecting...");

    // 2. Wait 1.5 seconds before redirecting so user sees the message
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);
  } catch (err) {
    console.error("Error:", err);
    // Show error message
    //error - re-enable button & restore text
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
    notyf.error(err.message || "Login failed");
  }
});
