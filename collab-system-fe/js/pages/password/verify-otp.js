import { verifyOtp } from "../../../api/password.js";
import {notyf} from "../../../vendor/utils/notify.js";
document.getElementById("otpForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("btnVerifyOtp");
    btn.disabled = true;
    btn.innerText = "Verifying...";
    const otp = e.target.otp.value;

    const data = await verifyOtp(otp);
    if (data.success) {
        notyf.success("OTP verified!");
        setTimeout(() => {
        window.location.href = "reset-password.html";
    }, 1500);
} else {
    notyf.error(data.message);
    btn.disabled = false;
    btn.innerText = "Send OTP";
}
});
