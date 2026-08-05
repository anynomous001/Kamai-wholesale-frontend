import { apiFetch } from "./client";
import type { DashboardStats } from "./types";

export function getDashboardStats(): Promise<DashboardStats> {
  return apiFetch("/api/sourcing/dashboard");
}
