import { apiFetch } from "./client";
import type { OnboardingStatus } from "./types";

export function getOnboardingStatus(): Promise<OnboardingStatus> {
  return apiFetch("/api/sourcing/onboarding-status");
}

export function goLive(): Promise<{ status: "ACTIVE"; message: string }> {
  return apiFetch("/api/sourcing/go-live", { method: "POST" });
}
