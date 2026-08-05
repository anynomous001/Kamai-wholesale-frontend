import { apiFetch } from "./client";
import type { AdvanceStatus, ListResponse, OrderDetail, OrderListItem, OrderStatus } from "./types";

export interface ListOrdersParams {
  /** Comma-separated status list server-side; pass an array, this joins it. */
  status?: OrderStatus[];
  sort?: "newest" | "oldest";
  page?: number;
}

export function listOrders(params: ListOrdersParams = {}): Promise<ListResponse<OrderListItem>> {
  const query = new URLSearchParams();
  if (params.status && params.status.length > 0) query.set("status", params.status.join(","));
  if (params.sort) query.set("sort", params.sort);
  if (params.page) query.set("page", String(params.page));
  const qs = query.toString();
  return apiFetch(`/api/sourcing/orders${qs ? `?${qs}` : ""}`);
}

export function getOrder(id: string): Promise<OrderDetail> {
  return apiFetch(`/api/sourcing/orders/${id}`);
}

/** Server enforces the transition table (§7) — a 409 CONFLICT here is possible even with correct button logic; surface its message, which already lists the legal next states. */
export function updateOrderStatus(id: string, status: OrderStatus): Promise<OrderDetail> {
  return apiFetch(`/api/sourcing/orders/${id}/status`, { method: "PATCH", body: { status } });
}

/** Explicit target value, not a toggle. */
export function updateOrderAdvancePayment(id: string, advanceStatus: AdvanceStatus): Promise<OrderDetail> {
  return apiFetch(`/api/sourcing/orders/${id}/advance-payment`, {
    method: "PATCH",
    body: { advanceStatus },
  });
}

/** `notes` must be present even when clearing — pass null to clear. */
export function updateOrderNotes(id: string, notes: string | null): Promise<OrderDetail> {
  return apiFetch(`/api/sourcing/orders/${id}/notes`, { method: "PATCH", body: { notes } });
}
