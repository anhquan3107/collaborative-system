// --- Base API client for all fetch calls ---
const API_BASE = "/api"; // relative to backend

// Helper to get token
function getToken() {
  return localStorage.getItem("token");
}

// Generic GET request with auth header
export async function apiGet(path) {
  const token = getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (res.status === 401) {
    // Token invalid/expired — redirect to login
    localStorage.removeItem("token");
    window.location.href = "login.html";
    return;
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "API error");
  return data;
}

// Generic POST request (with body)
export async function apiPost(path, body) {
  const token = getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "API error");
  return data;
}
