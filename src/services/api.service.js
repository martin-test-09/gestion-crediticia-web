const API_URL = import.meta.env.VITE_API_URL?.trim();

let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

function getApiUrl() {
  if (!API_URL) {
    throw new Error("Falta configurar VITE_API_URL. Definí la URL base de la API, por ejemplo http://localhost:3000/api.");
  }

  return API_URL.replace(/\/+$/, "");
}

async function parseResponse(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (_error) {
    return null;
  }
}

export async function apiFetch(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = localStorage.getItem("access_token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${getApiUrl()}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const payload = await parseResponse(response);

  if (response.status === 401 && auth) {
    localStorage.removeItem("access_token");
    if (unauthorizedHandler) {
      unauthorizedHandler();
    } else if (window.location.pathname !== "/login") {
      window.location.assign("/login");
    }
  }

  if (!response.ok || payload?.ok === false) {
    const error = new Error(payload?.message || "No se pudo completar la operación");
    error.status = response.status;
    throw error;
  }

  return payload;
}
