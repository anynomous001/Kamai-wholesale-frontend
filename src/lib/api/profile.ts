import { apiFetch } from "./client";
import type { UpdateProfilePayload, WholesalerProfile } from "./types";

export function getProfile(): Promise<WholesalerProfile> {
  return apiFetch("/api/sourcing/profile");
}

/** Partial update — pass only changed fields. Server is .strict(): unknown keys reject the whole request. */
export function updateProfile(payload: UpdateProfilePayload): Promise<WholesalerProfile> {
  return apiFetch("/api/sourcing/profile", { method: "PATCH", body: payload });
}
