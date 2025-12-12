document.getElementById("forgotForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("btnSendOtp");
    btn.disabled = true;
    btn.innerText = "Sending...";

    const email = e.target.email.value;

    const res = await fetch("/password/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (data.success) {
        alert("OTP sent to your email!");
        window.location.href = "verify-otp.html";
    } else {
        alert(data.message);
    }
});
