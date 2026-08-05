const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "OTP_INVALID"
  | "OTP_EXPIRED"
  | "OTP_MAX_ATTEMPTS"
  | "REFRESH_TOKEN_INVALID"
  | "REFRESH_TOKEN_REUSED"
  | "ONBOARDING_INCOMPLETE"
  | "INTERNAL_ERROR";

export interface ValidationIssue {
  keyword: string;
  instancePath: string;
  schemaPath?: string;
  message: string;
  params?: Record<string, unknown>;
}

export interface ApiErrorBody {
  code: ErrorCode;
  message: string;
  details?: ValidationIssue[] | Record<string, unknown>;
}

/** Raised for every non-2xx response. Branch on `.code`, never on `.message` (except where the API docs say the message itself carries the info, e.g. OTP rate-limit cooldown). */
export class ApiError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  readonly details?: ValidationIssue[] | Record<string, unknown>;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = "ApiError";
    this.status = status;
    this.code = body.code;
    this.details = body.details;
  }

  /** Zod validation errors carry an array of per-field issues under `details`. */
  get validationIssues(): ValidationIssue[] | undefined {
    return Array.isArray(this.details) ? (this.details as ValidationIssue[]) : undefined;
  }

  /** Find the validation issue for a given field, e.g. issueFor("advancePercentage") matches instancePath "/advancePercentage". */
  issueFor(field: string): ValidationIssue | undefined {
    const path = field.startsWith("/") ? field : `/${field}`;
    return this.validationIssues?.find((issue) => issue.instancePath === path);
  }
}

function isAuthPath(path: string): boolean {
  return path.startsWith("/api/auth");
}

function clearLocalAppState() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem("kamai.notificationPreferences");
  } catch {
    // ignore
  }
}

function redirectToLogin() {
  clearLocalAppState();
  if (typeof window !== "undefined") {
    window.location.href = "/";
  }
}

let refreshPromise: Promise<boolean> | null = null;

/** POST /api/auth/refresh, deduplicated so concurrent 401s only trigger one refresh call. */
async function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function parseErrorBody(res: Response): Promise<ApiErrorBody> {
  try {
    const json = await res.json();
    if (json && typeof json === "object" && "error" in json) {
      return json.error as ApiErrorBody;
    }
  } catch {
    // fall through
  }
  return { code: "INTERNAL_ERROR", message: `Request failed with status ${res.status}` };
}

export interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  /** JSON-serializable body, or a FormData instance for multipart requests. */
  body?: unknown;
  /** Internal: prevents infinite refresh-retry loops. */
  _isRetry?: boolean;
}

/**
 * Centralized fetch wrapper.
 * - Always sends credentials: "include" (HttpOnly cookie auth, no token handling).
 * - On 401 from a non-/api/auth endpoint, attempts one refresh + one retry.
 * - On unrecoverable refresh failure (REFRESH_TOKEN_INVALID / REFRESH_TOKEN_REUSED,
 *   or no refresh token at all), clears local state and redirects to W1 (Login).
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, headers, _isRetry, ...rest } = options;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const init: RequestInit = {
    ...rest,
    credentials: "include",
    headers: isFormData || body === undefined ? headers : { "Content-Type": "application/json", ...headers },
    body: isFormData ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
  };

  const res = await fetch(`${API_BASE_URL}${path}`, init);

  if (res.ok) {
    if (res.status === 204) return undefined as T;
    const text = await res.text();
    return (text ? JSON.parse(text) : undefined) as T;
  }

  const errorBody = await parseErrorBody(res);

  if (res.status === 401 && !isAuthPath(path) && !_isRetry) {
    const refreshed = await refreshSession();
    if (refreshed) {
      return apiFetch<T>(path, { ...options, _isRetry: true });
    }
    redirectToLogin();
    throw new ApiError(res.status, errorBody);
  }

  if (
    isAuthPath(path) &&
    path.endsWith("/refresh") &&
    (errorBody.code === "REFRESH_TOKEN_INVALID" || errorBody.code === "REFRESH_TOKEN_REUSED")
  ) {
    redirectToLogin();
  }

  throw new ApiError(res.status, errorBody);
}

/**
 * Turns a VALIDATION_ERROR's per-field issues into a { fieldName: message } map
 * (instancePath "/advancePercentage" -> key "advancePercentage"), for highlighting
 * the specific input rather than showing one generic toast. Returns {} for any
 * other error shape (network error, non-field business error, etc.).
 */
export function fieldErrorsFrom(err: unknown): Record<string, string> {
  if (!(err instanceof ApiError) || !err.validationIssues) return {};
  const map: Record<string, string> = {};
  for (const issue of err.validationIssues) {
    const key = issue.instancePath.replace(/^\//, "");
    if (key) map[key] = issue.message;
  }
  return map;
}

export { API_BASE_URL };
