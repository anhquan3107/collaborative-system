document.getElementById("otpForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("btnVerifyOtp");
    btn.disabled = true;
    btn.innerText = "Verifying...";
    const otp = e.target.otp.value;

    const res = await fetch("/password/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
    });

    const data = await res.json();

    if (data.success) {
        window.location.href = "reset-password.html";
    } else {
        alert(data.message);
    }
});
