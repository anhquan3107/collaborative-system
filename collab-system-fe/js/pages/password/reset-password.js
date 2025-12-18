import { resetPassword } from "../../../api/password.js";
import {notyf} from "../../../vendor/utils/notify.js";

document.getElementById("resetForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const newPassword = e.target.newPassword.value;

     const data = await resetPassword(newPassword);

    if (data.success) {
        notyf.success("Password updated!");
        setTimeout(() => {
        window.location.href = "login.html";
    }, 1500);
} else {
    notyf.error(data.message);
    btn.disabled = false;
    btn.innerText = "Send OTP";
}
});
