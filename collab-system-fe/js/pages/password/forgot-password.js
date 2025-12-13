import { forgotPassword } from "../../../api/password.js";

document.getElementById("forgotForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("btnSendOtp");
    btn.disabled = true;
    btn.innerText = "Sending...";

    const email = e.target.email.value;

    const data = await forgotPassword(email);

    if (data.success) {
        alert("OTP sent to your email!");
        window.location.href = "verify-otp.html";
    } else {
        alert(data.message);
    }
});
