import { resetPassword } from "../../../api/password.js";

document.getElementById("resetForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const newPassword = e.target.newPassword.value;

     const data = await resetPassword(newPassword);

    if (data.success) {
        alert("Password updated!");
        window.location.href = "login.html";
    } else {
        alert(data.message);
    }
});
