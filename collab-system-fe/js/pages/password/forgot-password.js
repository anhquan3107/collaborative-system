import { forgotPassword } from "../../../api/password.js";
import {notyf} from "../../../vendor/utils/notify.js";


document.getElementById("forgotForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("btnSendOtp");
    btn.disabled = true;
    btn.innerText = "Sending...";

    const email = e.target.email.value;

    const data = await forgotPassword(email);

    if (data.success) {
        notyf.success("OTP sent to your email!");
       setTimeout(() => {
        window.location.href = "verify-otp.html";
    }, 1500);
} else {
    notyf.error(data.message);
    btn.disabled = false;
    btn.innerText = "Send OTP";
}
});
