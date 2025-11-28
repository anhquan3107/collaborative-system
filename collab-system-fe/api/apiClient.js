const API_BASE = "/api";

// Helper to read token
function getToken() {
  return localStorage.getItem("token");
}

// --- Generic GET Request ---
export async function apiGet(path) {
  const token = getToken();
  console.log("🔍 API GET Debug:", {
    path: `${API_BASE}${path}`,
    hasToken: !!token,
    token: token ? "***" + token.slice(-10) : "none",
  });

  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (res.status === 401) {
    localStorage.removeItem("token");
    return;
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "API GET Error");
  return data;
}

// --- Generic POST Request ---
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
  if (!res.ok) throw new Error(data.message || "API POST Error");
  return data;
}

// --- Generic DELETE Request ---
export async function apiDelete(path) {
  const token = getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "API DELETE Error");
  return data;
}

export async function apiPut(path, body) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "API PUT Error");
  return data;
}
