import { apiFetch } from "./client";
import type {
  CreateProductPayload,
  ImageUploadRequest,
  ListResponse,
  Product,
  UpdateAvailabilityPayload,
  UpdateProductPayload,
} from "./types";

export interface ListProductsParams {
  search?: string;
  category?: string;
  page?: number;
}

export function listProducts(params: ListProductsParams = {}): Promise<ListResponse<Product>> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.category) query.set("category", params.category);
  if (params.page) query.set("page", String(params.page));
  const qs = query.toString();
  return apiFetch(`/api/sourcing/products${qs ? `?${qs}` : ""}`);
}

export function createProduct(payload: CreateProductPayload): Promise<Product> {
  return apiFetch("/api/sourcing/products", { method: "POST", body: payload });
}

/** Does not touch variants — there is no variant edit/delete endpoint. */
export function updateProduct(id: string, payload: UpdateProductPayload): Promise<Product> {
  return apiFetch(`/api/sourcing/products/${id}`, { method: "PATCH", body: payload });
}

export function updateProductAvailability(
  id: string,
  payload: UpdateAvailabilityPayload,
): Promise<Product> {
  return apiFetch(`/api/sourcing/products/${id}/availability`, { method: "PATCH", body: payload });
}

/** Step 1 of 2 for product images: requests a presigned upload URL. Product.imageUrl is set optimistically as a side effect — only call this immediately before actually performing the PUT in step 2. */
export function requestProductImageUpload(
  id: string,
  fileName: string,
  contentType: "image/jpeg" | "image/png" | "image/webp",
): Promise<ImageUploadRequest> {
  return apiFetch(`/api/sourcing/products/${id}/image`, {
    method: "POST",
    body: { fileName, contentType },
  });
}

/** Step 2 of 2: PUT the raw file bytes directly to Supabase Storage — bypasses our own backend entirely. */
export async function uploadProductImageBytes(
  uploadUrl: string,
  file: File,
  contentType: string,
): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  });
  if (!res.ok) {
    throw new Error(`Image upload failed with status ${res.status}`);
  }
}

/** Convenience: runs both image-upload steps back to back so a caller never requests step 1 without immediately following through. */
export async function uploadProductImage(
  id: string,
  file: File,
): Promise<ImageUploadRequest> {
  const contentType = file.type as "image/jpeg" | "image/png" | "image/webp";
  const request = await requestProductImageUpload(id, file.name, contentType);
  await uploadProductImageBytes(request.uploadUrl, file, contentType);
  return request;
}
