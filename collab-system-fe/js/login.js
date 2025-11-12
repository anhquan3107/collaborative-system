import { login } from "../api/auth.js"; // Use our API module

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault(); // Stop default form behavior

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const data = await login(email, password); // Call our login API function

    // Save token to localStorage for authenticated API calls
    localStorage.setItem("token", data.token);
    alert("Login successful!");
    window.location.href = "index.html"; // redirect to homepage
  } catch (err) {
    console.error("Error:", err);
    alert(err.message || "Login failed");
  }
});
