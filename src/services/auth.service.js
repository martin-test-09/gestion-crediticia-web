import { apiFetch } from "./api.service.js";

export function registerUser(data) {
  return apiFetch("/auth/register", { method: "POST", body: data, auth: false });
}

export function loginUser(data) {
  return apiFetch("/auth/login", { method: "POST", body: data, auth: false });
}

export function verifyEmailToken(token) {
  return apiFetch(`/auth/verify-email?verification_token=${encodeURIComponent(token)}`, { auth: false });
}

export function resendVerification(email) {
  return apiFetch("/auth/resend-verification", { method: "POST", body: { email }, auth: false });
}
