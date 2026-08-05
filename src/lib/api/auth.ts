import { apiFetch } from "./client";
import type { AuthWholesaler } from "./types";

export function sendOtp(email: string): Promise<{ message: string; expiresInSec: number }> {
  return apiFetch("/api/auth/send-otp", { method: "POST", body: { email } });
}

export function verifyOtp(email: string, otp: string): Promise<{ wholesaler: AuthWholesaler }> {
  return apiFetch("/api/auth/verify-otp", { method: "POST", body: { email, otp } });
}

export function logout(): Promise<{ message: string }> {
  return apiFetch("/api/auth/logout", { method: "POST" });
}
