import { apiFetch } from "./client";
import type { NotificationPreferences } from "./types";

/**
 * No GET exists for this resource (confirmed backend gap) — callers must track
 * the last-written value themselves (or default to true on first load).
 */
export function updateNotificationPreferences(
  newOrderEmailEnabled: boolean,
): Promise<NotificationPreferences> {
  return apiFetch("/api/sourcing/notification-preferences", {
    method: "PATCH",
    body: { newOrderEmailEnabled },
  });
}
