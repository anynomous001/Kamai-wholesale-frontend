# Kamai Wholesale — Sourcing API Reference

Wholesaler-facing backend for the Sourcing module. This document describes every endpoint that exists in the running code as of Chunks 2–5 (Auth, Onboarding, Profile/Fulfilment/Payment, Notification Preferences, Catalogue, Orders/Dashboard). It is generated from the actual Zod schemas, route handlers, and live `/docs/json` OpenAPI output — not from the original planning prompts, which diverged from the final implementation in several confirmed, deliberate ways (noted inline where relevant).

There is **no baker-facing/Marketplace API yet** and **no order-creation endpoint** — see [Known Gaps](#known-gaps).

---

## 1. Conventions

### Base URL / prefix

All endpoints are mounted under two prefixes:

- `/api/auth/*` — Auth module
- `/api/sourcing/*` — everything else (Onboarding, Profile, Notification Preferences, Catalogue, Products, Orders, Dashboard)

There is also an unauthenticated `GET /health` → `{ "status": "ok" }` for liveness checks, not otherwise documented here.

### Authentication

**All session state lives in HttpOnly cookies. There is no bearer token anywhere — not in a response body, not in a header you're expected to send.** The frontend never reads, stores, or manually attaches a token. The browser handles this automatically as long as requests are made with credentials included (e.g. `fetch(url, { credentials: "include" })`).

Two cookies are set together by `POST /api/auth/verify-otp` and `POST /api/auth/refresh`:

| Cookie | Contents | Path | Lifetime | Notes |
|---|---|---|---|---|
| `wholesaler_access_token` | Signed JWT (HS256) | `/` | 15 minutes | Sent on every request; required by every endpoint marked "Requires session" below |
| `wholesaler_refresh_token` | Opaque random token | `/api/auth` | 7 days | Only ever sent back to `/api/auth/*` routes — scoped narrower on purpose |

Both are `httpOnly`, `sameSite=lax`, and `secure` in production only. `sameSite=lax` works for same-registrable-domain deployments (e.g. `app.kamai.com` calling `api.kamai.com`); a fully cross-site frontend/API split will need `SameSite=None; Secure` — not currently configured.

**"Requires session" below means**: the access-token cookie must be present and valid, or you get a `401 UNAUTHORIZED`. There is no separate API-key or header-based auth path.

**Refresh token rotation**: every successful `POST /api/auth/refresh` invalidates the presented refresh token and issues a new one (rotation). If a refresh token that was already rotated away is presented again, the backend treats it as reuse/compromise and **revokes every active session for that wholesaler**, not just the one being used — the next request from every other logged-in device/tab will also get `401`. See the Auth section for the exact error code.

### Standard error envelope

Every error response (validation failure, business-rule rejection, auth failure, or unhandled server error) has the same shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description",
    "details": { }
  }
}
```

`details` is optional and its shape depends on the source of the error:

- **Errors thrown by application code** (`AppError`) carry a `code` from a fixed set (below) and, sometimes, a small structured `details` object specific to that error — e.g. `ONBOARDING_INCOMPLETE` includes `{ "failedChecks": [...] }`.
- **Zod request validation failures** (bad body/query/params) always use `code: "VALIDATION_ERROR"` and `details` is an array of issue objects in this shape:
  ```json
  {
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Request failed validation",
      "details": [
        {
          "keyword": "too_big",
          "instancePath": "/advancePercentage",
          "schemaPath": "#/advancePercentage/too_big",
          "message": "advancePercentage must be between 0 and 100",
          "params": { "origin": "number", "maximum": 100, "inclusive": true }
        }
      ]
    }
  }
  ```
  `instancePath` tells you which field failed — use this to highlight the right form field, don't just show `message` generically.
- **Infrastructure-level errors** (e.g. the multipart plugin's own file-size rejection) fall back to a generic shape with no `details` key at all, e.g. `{"error":{"code":"VALIDATION_ERROR","message":"request file too large"}}`.

The complete `ErrorCode` union used across the whole API:

| Code | Typical status | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 400 (occasionally 413/404 for infra-level errors) | Request body/query/params failed validation, or a business-rule input check failed |
| `UNAUTHORIZED` | 401 | Missing/invalid/expired access token, or missing refresh token |
| `FORBIDDEN` | — | Defined but not currently thrown anywhere in this module |
| `NOT_FOUND` | 404 | Resource doesn't exist, or exists but belongs to a different wholesaler (tenant isolation — you get the same 404 either way, never a 403, so existence isn't leaked) |
| `CONFLICT` | 409 | The request is well-formed but illegal given the resource's current state (e.g. an out-of-order status transition, editing a published catalogue batch) |
| `RATE_LIMITED` | 429 | OTP request cooldown or hourly cap exceeded |
| `OTP_INVALID` | 400 | Wrong OTP submitted |
| `OTP_EXPIRED` | 400 | No active (unconsumed, unexpired) OTP exists for that email |
| `OTP_MAX_ATTEMPTS` | 400 | 5 wrong attempts against the current OTP; a new OTP must be requested |
| `REFRESH_TOKEN_INVALID` | 401 | Refresh token not found, or found but expired |
| `REFRESH_TOKEN_REUSED` | 401 | An already-rotated refresh token was presented again — every session for the wholesaler has just been revoked |
| `ONBOARDING_INCOMPLETE` | 400 | Go-live attempted before all 4 onboarding checks pass |
| `INTERNAL_ERROR` | 500 | Unhandled server error |

### Success envelope

**There is no wrapper.** A successful response body is the raw resource (or list envelope) itself — no `{ data: ... }` or `{ success: true, ... }` wrapping anywhere. List endpoints return `{ items: [...], page, pageSize, totalCount, totalPages }` directly at the top level.

### Rate limiting

- **Global**: every route (including public ones) is subject to a blanket 200 requests/minute per IP address, enforced by `@fastify/rate-limit`. Exceeding it returns `429`.
- **OTP-specific** (`POST /api/auth/send-otp`, business logic, not the global limiter): max **5 requests/hour per email**, and a **60-second cooldown** between consecutive requests for the same email. Both return `429 RATE_LIMITED` with a message telling you how long to wait.

### Decimal and date fields

Every currency/decimal field (`price`, `totalAmount`, `unitPrice`, `lineTotal`, `deliveryCharge`, `minOrderAmount`, `freeDeliveryThreshold`, `suggestedPrice`) is serialized as a plain JSON `number`, converted server-side from a Postgres `Decimal`. Every timestamp (`createdAt`, `updatedAt`, `readyTime`, etc.) is an ISO 8601 datetime string, e.g. `"2026-08-02T02:35:33.909Z"`.

### Audit logging

Every mutating endpoint documented below writes a row to an internal audit log (action name, entity id, and a small metadata object — e.g. which fields changed, or a status transition's `from`/`to`). This is **not exposed via any API** in this chunk range — it's mentioned per-endpoint below only because it's a real side effect worth knowing exists, not because you can query it yet.

---

## 2. Auth

Base path: `/api/auth`. All four endpoints are **public** (no session required) — they're how a session is established or ended in the first place.

### POST /api/auth/send-otp

Generates and "sends" (see caveat below) a 6-digit OTP to an email address.

**Auth:** Public

**Request body:**
```json
{ "email": "wholesaler@example.com" }
```
| Field | Type | Required | Constraints |
|---|---|---|---|
| `email` | string | yes | Must be a valid email; trimmed and lowercased server-side before use |

**Success response:** `200`
```json
{ "message": "OTP sent", "expiresInSec": 300 }
```
The OTP itself is never in the response. It expires in 5 minutes.

**Error cases:**
| Status | Code | Condition |
|---|---|---|
| 400 | `VALIDATION_ERROR` | `email` missing or not a valid email format |
| 429 | `RATE_LIMITED` | Called again within 60 seconds of the last request for this email — message includes exact seconds remaining |
| 429 | `RATE_LIMITED` | 5th+ request for this email within the trailing hour |

**Side effects:**
- Creates a new OTP record; any previously issued (still-valid) OTP for this email keeps working independently until it expires or is consumed.
- **Email delivery caveat**: in any environment other than production, the OTP is written to the server console/log, not actually emailed (`ConsoleMailer`). Production uses Resend. If you're testing against a non-production deployment, you will not receive a real email — check server logs.

---

### POST /api/auth/verify-otp

Verifies the OTP and establishes a session. On the **first-ever successful verification for a new email**, silently provisions a new Wholesaler account (`status: "PENDING_ONBOARDING"`, blank `businessName`/`businessType`) — there is no separate signup step.

**Auth:** Public

**Request body:**
```json
{ "email": "wholesaler@example.com", "otp": "482913" }
```
| Field | Type | Required | Constraints |
|---|---|---|---|
| `email` | string | yes | Valid email |
| `otp` | string | yes | Exactly 6 digits (`^\d{6}$`) |

**Success response:** `200`
```json
{
  "wholesaler": {
    "id": "b20b7d28-b735-4f89-8d07-ae785d2d1241",
    "email": "wholesaler@example.com",
    "status": "PENDING_ONBOARDING",
    "isNew": true
  }
}
```
`status` is one of `PENDING_ONBOARDING | ACTIVE | SUSPENDED`. Note there is **no token in this body** — the two cookies described in §1 are set on the response instead.

**Error cases:**
| Status | Code | Condition |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Malformed email or non-6-digit OTP |
| 400 | `OTP_EXPIRED` | No active (unconsumed, unexpired) OTP exists for this email — either none was ever requested, it already expired, or it was already used |
| 400 | `OTP_MAX_ATTEMPTS` | 5 incorrect attempts already made against the current OTP — request a new one via send-otp |
| 400 | `OTP_INVALID` | Wrong code (increments the attempt counter on that OTP record) |

**Side effects:**
- Sets both auth cookies.
- If a new account was just provisioned, writes an audit log entry (`WHOLESALER_SIGNED_UP`).
- The OTP record is marked consumed and cannot be reused even if it hasn't expired yet.

---

### POST /api/auth/refresh

Rotates the session: issues a new access + refresh token pair, invalidating the old refresh token.

**Auth:** Requires the `wholesaler_refresh_token` cookie (not the access token — this is how you get a *new* access token after it expires).

**Request body:** none

**Success response:** `200`
```json
{ "message": "Session refreshed" }
```
New cookies are set on the response, same as verify-otp.

**Error cases:**
| Status | Code | Condition |
|---|---|---|
| 401 | `UNAUTHORIZED` | No refresh token cookie present at all |
| 401 | `REFRESH_TOKEN_INVALID` | Token not recognized (never existed), or recognized but past its 7-day expiry |
| 401 | `REFRESH_TOKEN_REUSED` | Token was already rotated away once before and is being presented again — **this revokes every active session for the wholesaler**, including the one that just legitimately rotated it. All devices must re-authenticate via OTP. |

**Side effects:** Old refresh token is marked revoked (not deleted) regardless of outcome.

---

### POST /api/auth/logout

Ends the current session.

**Auth:** Public (works with or without cookies present — logging out twice is not an error)

**Request body:** none

**Success response:** `200`
```json
{ "message": "Logged out" }
```

**Error cases:** none — always succeeds.

**Side effects:** Clears both cookies; if a valid refresh token was present, revokes it server-side (so it can't be replayed even if somehow retained by a client).

---

## 3. Onboarding

Base path: `/api/sourcing`. Both endpoints **require a session**.

### GET /api/sourcing/onboarding-status

Computes, server-side, whether the wholesaler has completed the 4 checks required to go live. The frontend must not infer this itself from raw profile data — always call this endpoint.

**Auth:** Requires session

**Success response:** `200`
```json
{
  "profileComplete": false,
  "catalogueReady": false,
  "fulfilmentRulesSet": false,
  "paymentPolicySet": false,
  "allComplete": false
}
```

| Field | True when |
|---|---|
| `profileComplete` | `businessName`, `businessType`, and `address` are all non-empty, both `latitude`/`longitude` are set, **and** either `alwaysAvailable` is true or both `businessHoursOpen`/`businessHoursClose` are set |
| `catalogueReady` | At least 1 `Product` row exists for this wholesaler |
| `fulfilmentRulesSet` | Either pickup is fully configured (`pickupEnabled` + non-empty `pickupLocation`) **or** delivery is fully configured (`deliveryEnabled` + `deliveryRadiusKm` + `deliveryCharge` all set) |
| `paymentPolicySet` | `paymentPolicyConfigured` is `true` — set the first time the payment-policy fields are saved via `PATCH /profile`, **including an explicit 0%** advance |
| `allComplete` | All four of the above |

**Error cases:** only the generic session ones (401).

---

### POST /api/sourcing/go-live

Flips `Wholesaler.status` from `PENDING_ONBOARDING` (or `SUSPENDED`) to `ACTIVE` — the moment the wholesaler becomes marketplace-visible to bakers. Re-validates all 4 checks server-side; does not trust that the frontend already checked.

**Auth:** Requires session

**Request body:** none

**Success response:** `200`
```json
{ "status": "ACTIVE", "message": "Wholesaler is now live on the marketplace" }
```

**Error cases:**
| Status | Code | Condition |
|---|---|---|
| 400 | `ONBOARDING_INCOMPLETE` | One or more checks still fail. `details.failedChecks` lists exactly which ones, e.g. `{"failedChecks":["catalogueReady","paymentPolicySet"]}` |

**Side effects:** Writes an audit log entry (`WHOLESALER_GO_LIVE`) recording the previous and new status — this is treated as a meaningful business event, not routine.

---

## 4. Profile, Fulfilment & Payment Policy

Base path: `/api/sourcing`. Both endpoints **require a session**. This single resource backs the Business Profile, Fulfilment Settings, and Payment Policy screens — they all edit the same `Wholesaler` record.

### GET /api/sourcing/profile

**Auth:** Requires session

**Success response:** `200`
```json
{
  "id": "b20b7d28-b735-4f89-8d07-ae785d2d1241",
  "email": "wholesaler@example.com",
  "status": "PENDING_ONBOARDING",
  "isVerified": false,
  "businessName": "Chunk3 Wholesaler",
  "businessType": "Dairy",
  "address": "55 Test Ave",
  "latitude": 12.9,
  "longitude": 77.5,
  "serviceRadiusKm": null,
  "businessHoursOpen": null,
  "businessHoursClose": null,
  "alwaysAvailable": true,
  "logoUrl": null,
  "deliveryEnabled": true,
  "deliveryRadiusKm": 10,
  "deliveryCharge": 50,
  "minOrderAmount": null,
  "freeDeliveryThreshold": null,
  "expectedDeliveryTime": null,
  "pickupEnabled": true,
  "pickupLocation": "Dock 3",
  "advancePercentage": 0,
  "paymentPolicyConfigured": true,
  "updatedAt": "2026-08-02T00:52:52.961Z"
}
```
Every field is always present; unset optional fields are `null`, never omitted.

**Error cases:** only the generic session ones (401), plus a theoretical 404 if the wholesaler row itself is missing (not reachable in practice — the JWT is only issued for wholesalers that exist).

---

### PATCH /api/sourcing/profile

Partial update — send only the fields you're changing. Internally the accepted fields are grouped into three logical sub-schemas (business profile / fulfilment / payment policy), but **they all share this one route and one request body** — don't call three different endpoints.

**Auth:** Requires session

**Request body:** All fields optional, but **at least one must be present** and **unknown keys are rejected** (`.strict()` — a typo'd field name fails the whole request, it does not silently no-op).

| Field | Group | Type | Constraints |
|---|---|---|---|
| `businessName` | Business | string | 1–255 chars, trimmed |
| `businessType` | Business | string | 1–255 chars, trimmed |
| `address` | Business | string | 1–500 chars, trimmed |
| `latitude` | Business | number | -90 to 90 |
| `longitude` | Business | number | -180 to 180 |
| `serviceRadiusKm` | Business | number | must be > 0 |
| `businessHoursOpen` | Business | string | 24h `HH:MM` format |
| `businessHoursClose` | Business | string | 24h `HH:MM` format |
| `alwaysAvailable` | Business | boolean | — |
| `logoUrl` | Business | string | valid URL, max 2048 chars |
| `deliveryEnabled` | Fulfilment | boolean | — |
| `deliveryRadiusKm` | Fulfilment | number | must be > 0 |
| `deliveryCharge` | Fulfilment | number | ≥ 0 |
| `minOrderAmount` | Fulfilment | number | ≥ 0 |
| `freeDeliveryThreshold` | Fulfilment | number | ≥ 0 |
| `expectedDeliveryTime` | Fulfilment | string | 1–100 chars, free text (e.g. `"30–45 mins"`) |
| `pickupEnabled` | Fulfilment | boolean | — |
| `pickupLocation` | Fulfilment | string | 1–500 chars |
| `advancePercentage` | Payment | integer | 0–100 inclusive |

**Success response:** `200` — same full shape as `GET /profile`, reflecting the update.

**Error cases:**
| Status | Code | Condition |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Any field fails its constraint (field-scoped via `instancePath`, e.g. `advancePercentage: 150` → `"instancePath":"/advancePercentage"`) |
| 400 | `VALIDATION_ERROR` | Empty body `{}` — "At least one field must be provided" |
| 400 | `VALIDATION_ERROR` | Unrecognized key in body, e.g. `{"foo":"bar"}` — "Unrecognized key: \"foo\"" |

**Side effects:**
- **Sending `advancePercentage` at all** — including `0` — sets `paymentPolicyConfigured: true` permanently. This is the only way that flag ever becomes true, and it cannot be unset via this endpoint. This is what `onboarding-status`'s `paymentPolicySet` reads.
- Writes an audit log entry (`WHOLESALER_PROFILE_UPDATED`) listing which field names changed (not their values).

---

## 5. Notification Preferences

Base path: `/api/sourcing`. **Settings-screen concern, intentionally separate from the profile object above** — different endpoint, different schema, even though both ultimately live on the same `Wholesaler` row.

### PATCH /api/sourcing/notification-preferences

**Auth:** Requires session

**Request body:**
```json
{ "newOrderEmailEnabled": false }
```
| Field | Type | Required |
|---|---|---|
| `newOrderEmailEnabled` | boolean | optional, but it's currently the *only* field in this schema — so in practice you must send it |

`.strict()` body — unknown keys rejected, same as profile.

**Success response:** `200`
```json
{ "newOrderEmailEnabled": false }
```

**Error cases:**
| Status | Code | Condition |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Empty body, or an unrecognized key |

**Side effects:** Writes an audit log entry (`WHOLESALER_NOTIFICATION_PREFERENCES_UPDATED`).

> **Note on scope**: a `lowStockAlertEmailEnabled` toggle existed in an earlier build pass and has been **removed** (schema, migration, and this endpoint) — no feature exists anywhere in the backend that could ever trigger a low-stock alert email, so it was dead weight. Do not build UI for it. Similarly, be aware `newOrderEmailEnabled` itself has nothing wired to it yet either — see [Known Gaps](#known-gaps).

---

## 6. Catalogue

Three sub-areas: Master Catalogue (read-only reference data), Catalogue Import (bulk ingestion), and Products (the wholesaler's own live catalogue). All endpoints in this section **require a session**.

### GET /api/sourcing/master-catalogue/search

Searches Kamai's pre-seeded reference catalogue (not the wholesaler's own products).

**Query parameters:**
| Param | Type | Required | Constraints |
|---|---|---|---|
| `q` | string | yes | 1–255 chars, case-insensitive substring match against item name |
| `limit` | integer | no | 1–50, default `20` |

**Success response:** `200`
```json
{
  "items": [
    {
      "id": "452caee8-223a-43c9-8896-6354565d593f",
      "name": "Refined Sunflower Oil 15L",
      "category": "Oils",
      "brand": "Fortune",
      "unit": "tin",
      "suggestedPrice": 2200,
      "imageUrl": null
    }
  ]
}
```

**Error cases:**
| Status | Code | Condition |
|---|---|---|
| 400 | `VALIDATION_ERROR` | `q` missing/empty, or `limit` out of 1–50 range |

**Side effects:** none (read-only).

---

### POST /api/sourcing/products/from-master

Copies a master-catalogue item into the wholesaler's own `Product` table. This is a direct create, not a review/approval flow.

**Request body:**
```json
{ "masterItemId": "452caee8-223a-43c9-8896-6354565d593f" }
```
| Field | Type | Required | Notes |
|---|---|---|---|
| `masterItemId` | string (UUID) | yes | |
| `price` | number | no | ≥ 0. If omitted, falls back to the master item's `suggestedPrice`. If the master item *also* has no `suggestedPrice`, the request is rejected — see below. |

**Success response:** `201` — full `Product` shape (see [Products](#products) response format below).

**Error cases:**
| Status | Code | Condition |
|---|---|---|
| 400 | `VALIDATION_ERROR` | `masterItemId` not a UUID, or `price` negative |
| 404 | `NOT_FOUND` | No master catalogue item with that id |
| 400 | `VALIDATION_ERROR` | `price` omitted **and** the master item has no `suggestedPrice` — "This master item has no suggested price — provide one explicitly" |

**Side effects:** Writes an audit log entry (`PRODUCT_CREATED_FROM_MASTER`). The new product's `availabilityState` defaults to `AVAILABLE`; it has no variants and no image regardless of what the master item had.

---

### Catalogue Import

Four endpoints implementing an upload → review → publish pipeline. **Read this whole subsection before building the upload UI** — the behavior branches by actual file content in a way that materially changes how the frontend must poll.

#### File-type branching (read this first)

`POST /catalogue-import` inspects the **actual bytes** of the uploaded file (magic-byte sniffing, not the filename or the client-declared MIME type — those are never trusted) and routes to one of two completely different pipelines:

| Detected file | Path | Cost | Batch lifecycle |
|---|---|---|---|
| `.xlsx` | **STRUCTURED_FILE** | Free, no external API call | Parsed synchronously in the request. Batch is created **already in `REVIEW` status** with rows populated. **No polling needed** — the `POST` response already has everything. |
| `.csv` | **STRUCTURED_FILE** | Free | Same as above. Note: CSV has no magic-byte signature to sniff (it's plain text), so detection falls back to file extension + a binary-content sanity check — a `.csv`-named file containing actual binary garbage is rejected as unsupported. |
| `.jpg` / `.png` | **AI_VISION_EXTRACTION** | Gemini API call (small, non-zero cost) | Batch is created and returned **immediately in `PROCESSING` status with an empty `rows` array**. Extraction happens in the background after the response is sent. **The frontend must poll** `GET /catalogue-import/:batchId` until `status` becomes `REVIEW` (success) or `FAILED` (extraction error). |
| `.pdf` | **AI_VISION_EXTRACTION** | Gemini API call | Same as images, plus a page-count check (rejected upfront if the PDF has more than 20 pages — no Gemini call is made in that case). |
| Anything else | rejected | — | `400 VALIDATION_ERROR` before any batch is created at all |

**Batch status lifecycle:** `PROCESSING → REVIEW → PUBLISHED`, or `PROCESSING → FAILED` (vision extraction only — the structured-file path never produces `PROCESSING` or `FAILED`, it goes straight to `REVIEW`).

There is currently no push notification/webhook/SSE for the `PROCESSING → REVIEW` transition — polling is the only mechanism. A reasonable interval is 2–3 seconds; extraction typically completes in a few seconds for a single-page document.

For the AI vision path specifically: fields the model can't find or isn't confident about come back as `null`, never a guessed value — this is enforced by the extraction prompt, not just a convention. Expect `null` category/description fairly often from photos that don't explicitly label those fields.

---

#### POST /api/sourcing/catalogue-import

**Request:** `multipart/form-data` with a single file field. **Not JSON** — there is no Zod body schema on this route; validation happens on the decoded file itself.

Constraints:
- Max file size: **10MB**. Enforced at the multipart-parsing layer itself, so an oversized upload can fail before your own validation logic even runs.
- PDFs: max **20 pages**.

**Success response:** `201`
```json
{
  "id": "4ba73aba-08d3-487a-8e95-4ecc2b51ee85",
  "method": "STRUCTURED_FILE",
  "status": "REVIEW",
  "sourceFileUrl": "https://<project>.supabase.co/storage/v1/object/sign/catalogue-uploads/...",
  "errorMessage": null,
  "createdAt": "2026-08-02T02:07:12.265Z",
  "rows": [
    {
      "id": "71305708-22fb-4055-ac8c-5be283caaa8e",
      "batchId": "4ba73aba-08d3-487a-8e95-4ecc2b51ee85",
      "extractedName": "Toor Dal",
      "extractedPrice": 120,
      "extractedUnit": "kg",
      "extractedCategory": "Pulses",
      "extractedDescription": "Premium quality",
      "approved": false,
      "hasMissingFields": false
    }
  ]
}
```

`method` is one of `MANUAL | STRUCTURED_FILE | AI_VISION_EXTRACTION | MASTER_CATALOGUE` (only the middle two are ever set by this endpoint — `MANUAL` and `MASTER_CATALOGUE` describe products created other ways and never appear on an import batch).

`sourceFileUrl` is a **Supabase Storage signed URL that expires after 7 days** — it's for record-keeping/support use, not a permanent asset link. Don't cache it long-term.

`hasMissingFields` is `true` whenever any of `extractedName`, `extractedPrice`, `extractedUnit`, or `extractedCategory` is null/empty on that row — this is what drives the warning icon on the review screen. `extractedDescription` is never required and never affects this flag.

**Error cases:**
| Status | Code | Condition |
|---|---|---|
| 400 | `VALIDATION_ERROR` | No file present in the multipart body |
| 400 | `VALIDATION_ERROR` | Uploaded file is empty (0 bytes) |
| 413 | `VALIDATION_ERROR` | File exceeds 10MB (message: `"request file too large"`, no `details` key — this one comes from the multipart plugin itself, not application code) |
| 400 | `VALIDATION_ERROR` | Unrecognized file type — message lists the supported extensions |
| 400 | `VALIDATION_ERROR` | PDF exceeds the 20-page limit — message includes the actual page count found |

**Side effects:**
- Always archives the raw uploaded file to private Supabase Storage, regardless of path taken.
- Writes an audit log entry (`CATALOGUE_IMPORT_COMPLETED`) with `method` and `rowCount` once rows are populated (immediately for structured files; after background extraction for vision) — this is the mechanism for tracking AI spend against catalogue volume, not just security auditing.
- For the vision path: if extraction fails (Gemini API error, or a response that isn't valid/well-shaped JSON), the batch is marked `FAILED` with `errorMessage` set, and a `CATALOGUE_IMPORT_FAILED` audit entry is written instead. **No rows are created in this case** — never partially-populated garbage.

---

#### GET /api/sourcing/catalogue-import/:batchId

Poll this until `status` leaves `PROCESSING` (only relevant for the AI vision path — see above).

**Path parameters:**
| Param | Type | Required |
|---|---|---|
| `batchId` | string (UUID) | yes |

**Success response:** `200` — same shape as the `POST` response above. When `status: "FAILED"`, `errorMessage` is populated and `rows` is empty:
```json
{
  "id": "8ba42fb0-1deb-42fd-a6a9-7fe717dea12c",
  "method": "AI_VISION_EXTRACTION",
  "status": "FAILED",
  "sourceFileUrl": "https://.../catalogue-uploads/...",
  "errorMessage": "Gemini response was not valid JSON",
  "createdAt": "2026-08-02T02:08:32.596Z",
  "rows": []
}
```

**Error cases:**
| Status | Code | Condition |
|---|---|---|
| 400 | `VALIDATION_ERROR` | `batchId` is not a valid UUID (malformed, not just nonexistent) |
| 404 | `NOT_FOUND` | Well-formed UUID, but no such batch — or it belongs to a different wholesaler (same response either way) |

---

#### PATCH /api/sourcing/catalogue-import/:batchId/rows/:rowId

Inline-edit a row before approving/publishing. Only legal while the **batch** is in `REVIEW` status.

**Path parameters:**
| Param | Type | Required |
|---|---|---|
| `batchId` | string (UUID) | yes |
| `rowId` | string (UUID) | yes |

**Request body:** all fields optional (nullable to explicitly clear a value), at least one required, unknown keys rejected.
| Field | Type | Constraints |
|---|---|---|
| `extractedName` | string \| null | 1–255 chars if non-null |
| `extractedPrice` | number \| null | ≥ 0 if non-null |
| `extractedUnit` | string \| null | 1–50 chars if non-null |
| `extractedCategory` | string \| null | 1–255 chars if non-null |
| `extractedDescription` | string \| null | max 2000 chars |
| `approved` | boolean | — |

**Success response:** `200`
```json
{
  "id": "96818131-0537-4a80-ac26-af36404862db",
  "batchId": "4ba73aba-08d3-487a-8e95-4ecc2b51ee85",
  "extractedName": "Chana Dal",
  "extractedPrice": 95,
  "extractedUnit": "kg",
  "extractedCategory": "Pulses",
  "extractedDescription": "Price to be confirmed",
  "approved": true,
  "hasMissingFields": false
}
```

**Error cases:**
| Status | Code | Condition |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Field constraint violation, empty body, or unrecognized key |
| 404 | `NOT_FOUND` | Batch doesn't exist / not owned by this wholesaler |
| 409 | `CONFLICT` | Batch is not in `REVIEW` status (e.g. still `PROCESSING`, or already `PUBLISHED`) — message states the current status |
| 404 | `NOT_FOUND` | `rowId` doesn't exist on this batch |
| 400 | `VALIDATION_ERROR` | **Setting `approved: true` while the row (after applying any other field edits in the same request) still has a missing required field** — message: "Cannot approve a row with missing required fields (name/price/unit/category)". You can fix a field and approve in the same request; the check runs against the post-merge state. |

**Side effects:** `hasMissingFields` is recomputed server-side after every edit — you cannot set it directly, it's not in the request schema at all.

---

#### POST /api/sourcing/catalogue-import/:batchId/publish

Converts every **approved** row into a real `Product` row. This is the only way rows in this pipeline become part of the wholesaler's live catalogue.

**Path parameters:**
| Param | Type | Required |
|---|---|---|
| `batchId` | string (UUID) | yes |

**Request body:** none

**Success response:** `200`
```json
{
  "batchId": "4ba73aba-08d3-487a-8e95-4ecc2b51ee85",
  "status": "PUBLISHED",
  "publishedCount": 2,
  "skippedCount": 1
}
```
`skippedCount` is every row that was **not** approved at the moment of publishing — there is no partial/second publish call for the leftovers; they're simply left behind. (A row that's approved but somehow still has missing fields — not reachable via the row-edit endpoint, but filtered defensively anyway — also counts as skipped, not published.)

**Error cases:**
| Status | Code | Condition |
|---|---|---|
| 400 | `VALIDATION_ERROR` | `batchId` not a valid UUID |
| 404 | `NOT_FOUND` | Batch doesn't exist / not owned by this wholesaler |
| 409 | `CONFLICT` | Batch is not in `REVIEW` status — includes the case of **calling publish twice**: the second call gets `409` because the batch is already `PUBLISHED` |

**Side effects:**
- **Batch becomes permanently read-only** after this call: `status` moves to `PUBLISHED`, and the row-edit endpoint will now reject any further edits with `409 CONFLICT`. There is no un-publish.
- Created products get `description` populated from `extractedDescription` (may be `null`), default `availabilityState: AVAILABLE`, and no variants/image.
- Writes an audit log entry (`CATALOGUE_IMPORT_PUBLISHED`) with `publishedCount` and `skippedCount`.

---

### Products

The wholesaler's own live catalogue. All six endpoints require a session and are tenant-scoped — a product ID belonging to another wholesaler behaves exactly like a nonexistent one (`404`, never `403`).

**Product response shape** (used by `create`, `createFromMaster`, `update`, `updateAvailability`, and each item in `list`):
```json
{
  "id": "e761d105-d959-4cfa-a17d-ba64f8ad7018",
  "name": "Basmati Rice",
  "category": "Grains",
  "brand": null,
  "unit": "25kg bag",
  "price": 1800,
  "description": null,
  "availabilityState": "LIMITED_STOCK",
  "urgencyBadgeText": "Only 3 bags left",
  "imageUrl": null,
  "variants": [
    { "id": "4b860f5e-35d4-4f22-827c-a968ca84290f", "label": "10kg bag", "price": 800 }
  ],
  "updatedAt": "2026-08-02T02:05:51.693Z"
}
```
`availabilityState` is always one of `AVAILABLE | LIMITED_STOCK | OUT_OF_STOCK` — **there is no numeric stock count anywhere in this API, by design.**

#### POST /api/sourcing/products

Manual product creation.

**Request body:**
| Field | Type | Required | Constraints |
|---|---|---|---|
| `name` | string | yes | 1–255 chars |
| `category` | string | yes | 1–255 chars |
| `brand` | string \| null | no | 1–255 chars if present |
| `unit` | string | yes | 1–50 chars |
| `price` | number | yes | ≥ 0 |
| `availabilityState` | string | no | one of the 3-state enum; defaults to `AVAILABLE` |
| `urgencyBadgeText` | string \| null | no | 1–100 chars |
| `imageUrl` | string \| null | no | valid URL, max 2048 chars |
| `description` | string \| null | no | max 2000 chars |
| `variants` | array | no | up to 20 objects, each `{ "label": string (1–100 chars), "price": number (≥0) }` |

**Success response:** `201` — full Product shape.

**Error cases:**
| Status | Code | Condition |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Any field constraint violation |

**Side effects:** Writes an audit log entry (`PRODUCT_CREATED`).

---

#### GET /api/sourcing/products

List/search the wholesaler's own catalogue. Card-render-ready — no further joins needed on the frontend.

**Query parameters:**
| Param | Type | Required | Notes |
|---|---|---|---|
| `search` | string | no | Case-insensitive substring match against product name, max 255 chars |
| `category` | string | no | Exact match, max 255 chars |
| `page` | integer | no | 1-indexed, default `1` |

Page size is fixed at **20** and is not client-configurable.

**Success response:** `200`
```json
{
  "items": [ /* array of Product shape, see above */ ],
  "page": 1,
  "pageSize": 20,
  "totalCount": 2,
  "totalPages": 1
}
```
Requesting a `page` beyond the last one returns an empty `items` array, not an error.

**Error cases:**
| Status | Code | Condition |
|---|---|---|
| 400 | `VALIDATION_ERROR` | `page` < 1, or `search`/`category` exceed max length |

---

#### PATCH /api/sourcing/products/:id

Partial edit of scalar product fields. **Does not touch variants** — there is no variant edit/delete endpoint in this chunk range; variants can only be set at creation time.

**Path parameters:** `id` (string, UUID)

**Request body:** same field set as create, all optional, at least one required, `.strict()`:
`name, category, brand, unit, price, availabilityState, urgencyBadgeText, imageUrl, description` — same per-field constraints as create.

**Success response:** `200` — full Product shape.

**Error cases:**
| Status | Code | Condition |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Field constraint violation, empty body, or unrecognized key |
| 404 | `NOT_FOUND` | Product doesn't exist / not owned by this wholesaler |

**Side effects:** Writes an audit log entry (`PRODUCT_UPDATED`) listing which field names changed.

---

#### PATCH /api/sourcing/products/:id/availability

The quick-edit endpoint for the catalogue list screen — separate from the general update endpoint on purpose (it's the one action a wholesaler does dozens of times a day).

**Path parameters:** `id` (string, UUID)

**Request body:**
| Field | Type | Required |
|---|---|---|
| `availabilityState` | string | yes — one of `AVAILABLE \| LIMITED_STOCK \| OUT_OF_STOCK` |
| `urgencyBadgeText` | string \| null | no — 1–100 chars if present; pass `null` to clear it |

`.strict()` — no other fields accepted here.

**Success response:** `200` — full Product shape.

**Error cases:**
| Status | Code | Condition |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Missing/invalid `availabilityState`, or `urgencyBadgeText` too long |
| 404 | `NOT_FOUND` | Product doesn't exist / not owned by this wholesaler |

**Side effects:** Writes an audit log entry (`PRODUCT_AVAILABILITY_UPDATED`) with the `from`/`to` states.

---

#### POST /api/sourcing/products/:id/image

Requests a **presigned Supabase Storage upload URL** — the actual image bytes go directly from the browser to Supabase Storage, never through this backend.

**Path parameters:** `id` (string, UUID)

**Request body:**
| Field | Type | Required | Constraints |
|---|---|---|---|
| `fileName` | string | yes | 1–255 chars |
| `contentType` | string | yes | one of `image/jpeg \| image/png \| image/webp` |

**Success response:** `200`
```json
{
  "uploadUrl": "https://<project>.supabase.co/storage/v1/object/upload/sign/product-images/...?token=...",
  "path": "b20b7d28-b735-4f89-8d07-ae785d2d1241/e761d105-d959-4cfa-a17d-ba64f8ad7018/c176bdb0-....jpg",
  "token": "eyJra...",
  "publicUrl": "https://<project>.supabase.co/storage/v1/object/public/product-images/..."
}
```

**What the frontend must do next**: `PUT` the raw file bytes directly to `uploadUrl` (with the matching `Content-Type` header). This backend is not involved in that step at all.

**Error cases:**
| Status | Code | Condition |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Missing/invalid `fileName` or unsupported `contentType` |
| 404 | `NOT_FOUND` | Product doesn't exist / not owned by this wholesaler |

**Side effects — important:**
- **`Product.imageUrl` is updated to `publicUrl` immediately when this endpoint is called**, *before* the client has actually uploaded anything. The URL is deterministic (the path is generated server-side and doesn't depend on the upload succeeding), so this is set optimistically. **If the frontend never completes the follow-up `PUT`, the product will have an `imageUrl` pointing at a file that doesn't exist** (broken image). There is currently no cleanup/rollback for an abandoned upload.
- The target bucket (`product-images`) is **public** — once the upload completes, `publicUrl` is permanently and publicly accessible, unlike the catalogue-import source-file URLs which are private/signed.
- Writes an audit log entry (`PRODUCT_IMAGE_UPLOAD_REQUESTED`).

---

## 7. Orders & Dashboard

Base path: `/api/sourcing`. All endpoints require a session. **There is no order-creation endpoint anywhere in this API** — orders are expected to be created by a future baker-facing Marketplace checkout flow that does not exist yet. Everything here is read/update against orders that already exist.

### GET /api/sourcing/dashboard

Aggregated stats for the Dashboard screen.

**Success response:** `200`
```json
{
  "ordersAwaitingAcceptance": 1,
  "todaysRevenue": 7400,
  "activeSkuCount": 1,
  "repeatBuyerPercentage": 33.3
}
```

| Field | Definition |
|---|---|
| `ordersAwaitingAcceptance` | Count of orders with `status: "RECEIVED"` |
| `todaysRevenue` | Sum of `totalAmount` for orders created today (UTC day boundary), **excluding** `CANCELLED` orders |
| `activeSkuCount` | Total count of `Product` rows for this wholesaler — **not** filtered by `availabilityState`; "active" means "in your catalogue," an out-of-stock item still counts |
| `repeatBuyerPercentage` | Of all distinct `bakerId`s who have ever ordered from this wholesaler, the percentage with more than 1 order — **all-time**, and orders count regardless of status (a cancelled order still counts as "this buyer has ordered before"). Rounded to 1 decimal place. `0` if there are no orders yet. |

**Error cases:** none beyond the generic session ones.

---

### GET /api/sourcing/orders

One reusable query contract for both the Dashboard's "Needs Action" list and the full Orders Pipeline screen — the caller picks the filter, it's the same endpoint either way.

**Query parameters:**
| Param | Type | Required | Notes |
|---|---|---|---|
| `status` | string | no | Comma-separated list of statuses, e.g. `status=RECEIVED,ACCEPTED`. Each value must be one of the 6 valid statuses (see the transition table below) — an invalid value anywhere in the list rejects the whole request. Omit entirely for "all statuses." |
| `sort` | string | no | `newest` (default) or `oldest`, by `createdAt` |
| `page` | integer | no | 1-indexed, default `1`. Fixed page size of 20, not configurable. |

**Success response:** `200`
```json
{
  "items": [
    {
      "id": "3401d517-d3e2-475c-8fa8-c877aa1bf0d1",
      "buyerName": "Golden Bakery",
      "buyerContact": "+91-9000000000",
      "status": "PACKING",
      "fulfilmentMode": "PICKUP",
      "totalAmount": 800,
      "advanceRequiredPercent": 20,
      "advanceStatus": "PENDING",
      "itemCount": 1,
      "readyTime": null,
      "createdAt": "2026-08-02T02:34:52.724Z",
      "updatedAt": "2026-08-02T02:34:52.724Z"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "totalCount": 4,
  "totalPages": 1
}
```
Note this is a summary shape — `itemCount` only, not the full line items (use the detail endpoint for that). `advanceStatus` is a free-form string in the schema but only ever `"PENDING"` or `"RECEIVED"` in practice (see the advance-payment endpoint below).

**Error cases:**
| Status | Code | Condition |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Any value in `status` isn't a recognized status (message: `"Invalid status: <value>"`), or `sort`/`page` invalid |

---

### GET /api/sourcing/orders/:id

Full order detail, including line items with resolved product/variant names — no further client-side joins needed.

**Path parameters:** `id` (string, UUID)

**Success response:** `200`
```json
{
  "id": "3401d517-d3e2-475c-8fa8-c877aa1bf0d1",
  "bakerId": "baker-a",
  "buyerName": "Golden Bakery",
  "buyerContact": "+91-9000000000",
  "status": "PACKING",
  "fulfilmentMode": "PICKUP",
  "advanceRequiredPercent": 20,
  "advanceStatus": "PENDING",
  "totalAmount": 800,
  "readyTime": null,
  "notes": null,
  "items": [
    {
      "id": "a349ba3f-e984-4233-8127-16893011962b",
      "productId": "0c1dcf35-1de4-48f2-98ba-b0294e188e01",
      "productName": "Refined Oil 15L",
      "variantId": "27e4da88-dffb-47b7-b607-bf15f8bcff89",
      "variantLabel": "5L",
      "quantity": 1,
      "unitPrice": 800,
      "lineTotal": 800
    }
  ],
  "createdAt": "2026-08-02T02:34:52.724Z",
  "updatedAt": "2026-08-02T02:34:52.724Z"
}
```
`bakerId` is an opaque external reference string (the baker/buyer lives in a separate service's database — there's no way to look up further baker details from this API). `variantId`/`variantLabel` are `null` when the order line wasn't for a specific variant.

**Error cases:**
| Status | Code | Condition |
|---|---|---|
| 400 | `VALIDATION_ERROR` | `id` is not a valid UUID |
| 404 | `NOT_FOUND` | Order doesn't exist / belongs to a different wholesaler |

---

### PATCH /api/sourcing/orders/:id/status

Moves an order through its lifecycle. **The server is the source of truth for what transitions are legal — the frontend must not infer this purely from its own button state**, since this endpoint will reject anything outside the table below regardless of what the UI allowed the user to click.

#### Allowed-transition table

| From status | Can move to |
|---|---|
| `RECEIVED` | `ACCEPTED`, `CANCELLED` |
| `ACCEPTED` | `PACKING`, `CANCELLED` |
| `PACKING` | `READY`, `CANCELLED` |
| `READY` | `COLLECTED_DISPATCHED`, `CANCELLED` |
| `COLLECTED_DISPATCHED` | *(none — terminal)* |
| `CANCELLED` | *(none — terminal)* |

Read this as: the pipeline is strictly linear (`RECEIVED → ACCEPTED → PACKING → READY → COLLECTED_DISPATCHED`), **no skipping steps, no going backward**, and `CANCELLED` is reachable as a side-exit from any state except the two terminal ones. Once an order is `COLLECTED_DISPATCHED` or `CANCELLED`, it can never change status again — the primary action button on the Order Detail screen should be disabled/hidden entirely for orders in either state.

**Path parameters:** `id` (string, UUID)

**Request body:**
```json
{ "status": "PACKING" }
```
`status` must be one of the 6 enum values above.

**Success response:** `200` — full order detail shape (same as `GET /orders/:id`), reflecting the new status.

**Error cases:**
| Status | Code | Condition |
|---|---|---|
| 400 | `VALIDATION_ERROR` | `status` missing or not a recognized value |
| 404 | `NOT_FOUND` | Order doesn't exist / not owned by this wholesaler |
| 409 | `CONFLICT` | Requested transition isn't in the table above. Message names the current status and lists exactly which transitions **are** legal from it, e.g. `"Cannot transition order from PACKING to COLLECTED_DISPATCHED. Allowed: READY, CANCELLED"`, or `"...Allowed: none (terminal state)"` for the two terminal statuses. |

**Side effects:**
- **Entering `READY` for the first time auto-stamps `readyTime` to the current server timestamp**, if it wasn't already set. This happens automatically — there's no separate call to set it, and it will not be overwritten on subsequent status changes.
- Writes an audit log entry (`ORDER_STATUS_CHANGED`) with the `from`/`to` statuses.

---

### PATCH /api/sourcing/orders/:id/advance-payment

Manual, off-platform confirmation that an advance payment was received — **no payment processing happens here or anywhere in this backend.** This is purely a record-keeping toggle a wholesaler flips after confirming payment through some other channel (cash, UPI, bank transfer, etc.).

**Path parameters:** `id` (string, UUID)

**Request body:**
```json
{ "advanceStatus": "RECEIVED" }
```
`advanceStatus` must be exactly `"PENDING"` or `"RECEIVED"` — an explicit target value, not a blind toggle (so a duplicate click can't accidentally flip it back).

**Success response:** `200` — full order detail shape.

**Error cases:**
| Status | Code | Condition |
|---|---|---|
| 400 | `VALIDATION_ERROR` | `advanceStatus` missing or not one of the two allowed values |
| 404 | `NOT_FOUND` | Order doesn't exist / not owned by this wholesaler |

**Side effects:** Writes an audit log entry (`ORDER_ADVANCE_PAYMENT_UPDATED`) with `from`/`to`. This endpoint has no interaction with the order-status state machine — you can mark an advance received (or pending) regardless of what pipeline status the order is in, including `CANCELLED`.

---

### PATCH /api/sourcing/orders/:id/notes

Internal wholesaler-only notes on an order (never shown to the baker/buyer — there's no baker-facing API yet at all, but this is internal by design regardless).

**Path parameters:** `id` (string, UUID)

**Request body:**
```json
{ "notes": "Buyer requested extra bubble wrap" }
```
`notes`: string (max 2000 chars) or `null` to clear it. `.strict()` body.

**Success response:** `200` — full order detail shape.

**Error cases:**
| Status | Code | Condition |
|---|---|---|
| 400 | `VALIDATION_ERROR` | `notes` exceeds 2000 chars, or the key is missing entirely from the body |
| 404 | `NOT_FOUND` | Order doesn't exist / not owned by this wholesaler |

**Side effects:** Writes an audit log entry (`ORDER_NOTES_UPDATED`) — note the metadata does **not** include the note text itself, only that a change occurred.

---

## Known Gaps

Things a frontend engineer should not assume exist or work yet:

- **No order-creation endpoint.** Every order used in testing/examples in this document was seeded directly in the database. The actual creation path (baker-facing Marketplace checkout) is future work in a separate module. There is currently no way to get a *new* order into the system through this API at all.
- **No baker-facing API of any kind** — no product search, no supplier/product detail fetch, no cart, no checkout. This entire backend is wholesaler-facing only.
- **AI vision catalogue extraction has no retry/recovery for a server restart.** It's genuine fire-and-forget: if the Node process restarts while a batch is `PROCESSING`, that batch is permanently orphaned in `PROCESSING` status with no background job system to pick it back up. The only recovery is to upload the file again as a new batch. There is no job queue in this build.
- **No GET endpoint for notification preferences.** Only `PATCH` exists — the frontend must track the current toggle state itself after the last successful write (or infer an initial default of `true`), since there's nowhere to read it back independently of a write.
- **No variant edit/delete endpoints.** Variants can only be created at `POST /products` time; `PATCH /products/:id` does not touch them at all.
- **`newOrderEmailEnabled` is not wired to anything yet.** It persists correctly via the notification-preferences endpoint, but no code anywhere actually sends a "new order" email — there's no order-creation trigger point to hang it off yet, since order creation itself doesn't exist (see above). Don't build UI that implies emails are currently being sent based on this toggle.
- **`Product.imageUrl` can point at a non-existent object** if a client calls `POST /products/:id/image` and never follows through with the actual `PUT` upload (see the side-effects note on that endpoint). There's no validation, cleanup job, or "upload confirmed" callback.
- **Catalogue-import `sourceFileUrl` expires after 7 days** (signed URL, private bucket) — don't persist it client-side expecting it to work indefinitely.
- **No pagination override.** Both `GET /products` and `GET /orders` use a fixed page size of 20 with no query parameter to change it.
- **No cross-service baker detail lookup.** `bakerId` on an order is an opaque string; `buyerName`/`buyerContact` are whatever was denormalized onto the order at creation time (by the not-yet-built creation flow) and cannot be refreshed or looked up further from this API.
- **CORS is configured for a single configurable origin** (`CORS_ORIGIN` env var, comma-separated list supported) with `credentials: true` — if the frontend and this API end up on genuinely different top-level domains (not just subdomains of the same site), the `sameSite=lax` cookies described in §1 will need revisiting (likely `SameSite=None; Secure`), which is not yet configured.
