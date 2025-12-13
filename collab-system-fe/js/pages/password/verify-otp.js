import { verifyOtp } from "../../../api/password.js";
document.getElementById("otpForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("btnVerifyOtp");
    btn.disabled = true;
    btn.innerText = "Verifying...";
    const otp = e.target.otp.value;

    const data = await verifyOtp(otp);
    if (data.success) {
        window.location.href = "reset-password.html";
    } else {
        alert(data.message);
    }
});
