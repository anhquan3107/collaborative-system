document.getElementById("resetForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const newPassword = e.target.newPassword.value;

    const res = await fetch("/password/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
    });

    const data = await res.json();

    if (data.success) {
        alert("Password updated!");
        window.location.href = "login.html";
    } else {
        alert(data.message);
    }
});
