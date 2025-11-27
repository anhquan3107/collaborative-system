import { register as apiRegister } from "../../../api/auth.js";
import { notyf } from "../../../vendor/utils/notify.js";

document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    // Get submit button and store original state
    const submitBtn = document.querySelector(
      '#registerForm button[type="submit"]'
    );
    const originalText = submitBtn.innerHTML;
    // Basic validation for password match before sending to API
    if (password !== confirmPassword) {
      notyf.error("Passwords do not match");
      return;
    }
    //disable button and show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    Creating account...
  `;
    try {
      await apiRegister(username, email, password);
      //successful registration(keep button disabled during redirect)
      // 1. Show success message
      notyf.success("Registration successful! Please login.");

      // 2. Wait 1.5 seconds before redirecting
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);
    } catch (err) {
      console.error("Error:", err);
      //error during registration, re-enable button & restore text
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      // Show error message
      notyf.error(err.message || "Registration failed");
    }
  });
