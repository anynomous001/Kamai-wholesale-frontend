import { apiFetch } from "./client";
import type {
  CatalogueImportBatch,
  MasterCatalogueItem,
  Product,
  PublishImportResult,
  UpdateImportRowPayload,
} from "./types";

export function searchMasterCatalogue(q: string, limit = 20): Promise<{ items: MasterCatalogueItem[] }> {
  const query = new URLSearchParams({ q, limit: String(limit) });
  return apiFetch(`/api/sourcing/master-catalogue/search?${query.toString()}`);
}

/**
 * If `price` is omitted and the master item has no suggestedPrice, the server rejects
 * with VALIDATION_ERROR — callers should catch that and prompt for a price rather than
 * showing a generic error.
 */
export function createProductFromMaster(masterItemId: string, price?: number): Promise<Product> {
  return apiFetch("/api/sourcing/products/from-master", {
    method: "POST",
    body: price !== undefined ? { masterItemId, price } : { masterItemId },
  });
}

/**
 * multipart upload. Response shape differs by detected file type:
 * .xlsx/.csv come back already status: "REVIEW" with rows populated (no polling needed).
 * .jpg/.png/.pdf come back status: "PROCESSING" with empty rows — poll getCatalogueImportBatch.
 */
export function uploadCatalogueImport(file: File): Promise<CatalogueImportBatch> {
  const form = new FormData();
  form.append("file", file);
  return apiFetch("/api/sourcing/catalogue-import", { method: "POST", body: form });
}

export function getCatalogueImportBatch(batchId: string): Promise<CatalogueImportBatch> {
  return apiFetch(`/api/sourcing/catalogue-import/${batchId}`);
}

export function updateCatalogueImportRow(
  batchId: string,
  rowId: string,
  payload: UpdateImportRowPayload,
): Promise<CatalogueImportBatch["rows"][number]> {
  return apiFetch(`/api/sourcing/catalogue-import/${batchId}/rows/${rowId}`, {
    method: "PATCH",
    body: payload,
  });
}

export function publishCatalogueImport(batchId: string): Promise<PublishImportResult> {
  return apiFetch(`/api/sourcing/catalogue-import/${batchId}/publish`, { method: "POST" });
}
