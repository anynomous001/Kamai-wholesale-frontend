export type WholesalerStatus = "PENDING_ONBOARDING" | "ACTIVE" | "SUSPENDED";

export interface AuthWholesaler {
  id: string;
  email: string;
  status: WholesalerStatus;
  isNew: boolean;
}

export interface WholesalerProfile {
  id: string;
  email: string;
  status: WholesalerStatus;
  isVerified: boolean;
  businessName: string;
  businessType: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  serviceRadiusKm: number | null;
  businessHoursOpen: string | null;
  businessHoursClose: string | null;
  alwaysAvailable: boolean;
  logoUrl: string | null;
  deliveryEnabled: boolean;
  deliveryRadiusKm: number | null;
  deliveryCharge: number | null;
  minOrderAmount: number | null;
  freeDeliveryThreshold: number | null;
  expectedDeliveryTime: string | null;
  pickupEnabled: boolean;
  pickupLocation: string | null;
  advancePercentage: number;
  paymentPolicyConfigured: boolean;
  updatedAt: string;
}

/** All fields optional — send only what changed. .strict() server-side: unknown keys reject the whole request. */
export interface UpdateProfilePayload {
  businessName?: string;
  businessType?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  serviceRadiusKm?: number;
  businessHoursOpen?: string;
  businessHoursClose?: string;
  alwaysAvailable?: boolean;
  logoUrl?: string;
  deliveryEnabled?: boolean;
  deliveryRadiusKm?: number;
  deliveryCharge?: number;
  minOrderAmount?: number;
  freeDeliveryThreshold?: number;
  expectedDeliveryTime?: string;
  pickupEnabled?: boolean;
  pickupLocation?: string;
  advancePercentage?: number;
}

export interface OnboardingStatus {
  profileComplete: boolean;
  catalogueReady: boolean;
  fulfilmentRulesSet: boolean;
  paymentPolicySet: boolean;
  allComplete: boolean;
}

export type OnboardingCheck = keyof Omit<OnboardingStatus, "allComplete">;

export interface NotificationPreferences {
  newOrderEmailEnabled: boolean;
}

export interface MasterCatalogueItem {
  id: string;
  name: string;
  category: string;
  brand: string | null;
  unit: string;
  suggestedPrice: number | null;
  imageUrl: string | null;
}

export type AvailabilityState = "AVAILABLE" | "LIMITED_STOCK" | "OUT_OF_STOCK";

export interface ProductVariant {
  id: string;
  label: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string | null;
  unit: string;
  price: number;
  description: string | null;
  availabilityState: AvailabilityState;
  urgencyBadgeText: string | null;
  imageUrl: string | null;
  variants: ProductVariant[];
  updatedAt: string;
}

export interface CreateProductPayload {
  name: string;
  category: string;
  brand?: string | null;
  unit: string;
  price: number;
  availabilityState?: AvailabilityState;
  urgencyBadgeText?: string | null;
  imageUrl?: string | null;
  description?: string | null;
  variants?: { label: string; price: number }[];
}

export type UpdateProductPayload = Partial<Omit<CreateProductPayload, "variants">>;

export interface UpdateAvailabilityPayload {
  availabilityState: AvailabilityState;
  urgencyBadgeText?: string | null;
}

export interface ImageUploadRequest {
  uploadUrl: string;
  path: string;
  token: string;
  publicUrl: string;
}

export interface ListResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export type CatalogueImportMethod = "MANUAL" | "STRUCTURED_FILE" | "AI_VISION_EXTRACTION" | "MASTER_CATALOGUE";
export type CatalogueImportStatus = "PROCESSING" | "REVIEW" | "PUBLISHED" | "FAILED";

export interface CatalogueImportRow {
  id: string;
  batchId: string;
  extractedName: string | null;
  extractedPrice: number | null;
  extractedUnit: string | null;
  extractedCategory: string | null;
  extractedDescription: string | null;
  approved: boolean;
  hasMissingFields: boolean;
}

export interface CatalogueImportBatch {
  id: string;
  method: CatalogueImportMethod;
  status: CatalogueImportStatus;
  sourceFileUrl: string;
  errorMessage: string | null;
  createdAt: string;
  rows: CatalogueImportRow[];
}

export interface UpdateImportRowPayload {
  extractedName?: string | null;
  extractedPrice?: number | null;
  extractedUnit?: string | null;
  extractedCategory?: string | null;
  extractedDescription?: string | null;
  approved?: boolean;
}

export interface PublishImportResult {
  batchId: string;
  status: "PUBLISHED";
  publishedCount: number;
  skippedCount: number;
}

export interface DashboardStats {
  ordersAwaitingAcceptance: number;
  todaysRevenue: number;
  activeSkuCount: number;
  repeatBuyerPercentage: number;
}

export type OrderStatus = "RECEIVED" | "ACCEPTED" | "PACKING" | "READY" | "COLLECTED_DISPATCHED" | "CANCELLED";
export type FulfilmentMode = "PICKUP" | "DELIVERY";
export type AdvanceStatus = "PENDING" | "RECEIVED";

export interface OrderListItem {
  id: string;
  buyerName: string;
  buyerContact: string;
  status: OrderStatus;
  fulfilmentMode: FulfilmentMode;
  totalAmount: number;
  advanceRequiredPercent: number;
  advanceStatus: AdvanceStatus;
  itemCount: number;
  readyTime: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderLineItem {
  id: string;
  productId: string;
  productName: string;
  variantId: string | null;
  variantLabel: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderDetail {
  id: string;
  bakerId: string;
  buyerName: string;
  buyerContact: string;
  status: OrderStatus;
  fulfilmentMode: FulfilmentMode;
  advanceRequiredPercent: number;
  advanceStatus: AdvanceStatus;
  totalAmount: number;
  readyTime: string | null;
  notes: string | null;
  items: OrderLineItem[];
  createdAt: string;
  updatedAt: string;
}

/** Server-enforced order status transition table (§7). The UI must drive its primary action off this, never off its own heuristic. */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  RECEIVED: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["PACKING", "CANCELLED"],
  PACKING: ["READY", "CANCELLED"],
  READY: ["COLLECTED_DISPATCHED", "CANCELLED"],
  COLLECTED_DISPATCHED: [],
  CANCELLED: [],
};
