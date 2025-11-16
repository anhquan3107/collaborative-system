import { register as apiRegister } from "../../../api/auth.js"; // rename to avoid name clash

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevent reload

  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await apiRegister(username, email, password); // Call our register API function
    alert("✅ Registration successful! You can now login.");
    window.location.href = "login.html"; // redirect to login page
  } catch (err) {
    console.error("Error:", err);
    alert(err.message || "Registration failed");
  }
});
