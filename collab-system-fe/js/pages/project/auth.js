// frontend/js/pages/project/document/auth.js
export function checkAuth() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please log in first");
        window.location.href = "/login.html";
        return false;
    }
    return true;
}