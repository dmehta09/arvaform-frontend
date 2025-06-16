/**
 * API Types for ArvaForm Frontend
 *
 * These types define the structure for API requests, responses, and HTTP client
 * configuration for communicating with the ArvaForm backend.
 */

// ============================================================================
// HTTP & Request Types
// ============================================================================

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type ContentType =
  | "application/json"
  | "multipart/form-data"
  | "application/x-www-form-urlencoded";

export interface RequestHeaders {
  "Content-Type"?: ContentType;
  Authorization?: string;
  Accept?: string;
  "X-Request-ID"?: string;
  "X-Client-Version"?: string;
  [key: string]: string | undefined;
}

export interface ApiRequestConfig {
  method: HttpMethod;
  url: string;
  headers?: RequestHeaders;
  params?: Record<string, unknown>;
  data?: unknown;
  timeout?: number;
  retries?: number;
  abortSignal?: AbortSignal;
}

// ============================================================================
// Response Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: ApiRequestConfig;
}

export interface ApiError {
  message: string;
  status: number;
  statusText: string;
  code?: string;
  field?: string;
  timestamp: string;
  path: string;
  requestId?: string;

  // Validation errors
  errors?: Array<{
    field: string;
    message: string;
    code: string;
    value?: unknown;
  }>;

  // Stack trace (development only)
  stack?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta?: Record<string, unknown>;
}

export interface BulkResponse<T> {
  success: T[];
  failed: Array<{
    item: unknown;
    error: ApiError;
  }>;
  total: number;
  successCount: number;
  failedCount: number;
}

// ============================================================================
// API Client Configuration
// ============================================================================

export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  retryDelay: number;

  // Default headers
  headers: RequestHeaders;

  // Auth configuration
  auth: {
    tokenStorage: "localStorage" | "sessionStorage" | "memory";
    tokenKey: string;
    refreshTokenKey: string;
    autoRefresh: boolean;
  };

  // Interceptors
  interceptors: {
    request: Array<
      (config: ApiRequestConfig) => ApiRequestConfig | Promise<ApiRequestConfig>
    >;
    response: Array<
      (response: ApiResponse) => ApiResponse | Promise<ApiResponse>
    >;
    error: Array<(error: ApiError) => Promise<ApiError | never>>;
  };

  // Development settings
  debug: boolean;
  logRequests: boolean;
  logResponses: boolean;
}

// ============================================================================
// Authentication API Types
// ============================================================================

export interface AuthEndpoints {
  login: "/auth/login";
  register: "/auth/register";
  refresh: "/auth/refresh";
  logout: "/auth/logout";
  logoutAll: "/auth/logout-all";
  changePassword: "/auth/change-password";
  forgotPassword: "/auth/forgot-password";
  resetPassword: "/auth/reset-password";
  verifyEmail: "/auth/verify-email";
  resendVerification: "/auth/resend-verification";
}

export interface AuthApiRequests {
  login: {
    email: string;
    password: string;
  };
  register: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  };
  refresh: {
    refreshToken: string;
  };
  logout: {
    refreshToken: string;
  };
  changePassword: {
    currentPassword: string;
    newPassword: string;
  };
  forgotPassword: {
    email: string;
  };
  resetPassword: {
    token: string;
    password: string;
  };
  verifyEmail: {
    token: string;
  };
  resendVerification: {
    email: string;
  };
}

export interface AuthApiResponses {
  login: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      status: string;
      lastLoginAt: string | null;
    };
  };
  register: AuthApiResponses["login"];
  refresh: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
  };
  logout: {
    message: string;
  };
  changePassword: {
    message: string;
  };
  forgotPassword: {
    message: string;
  };
  resetPassword: {
    message: string;
  };
  verifyEmail: {
    message: string;
  };
  resendVerification: {
    message: string;
  };
}

// ============================================================================
// User API Types
// ============================================================================

export interface UserEndpoints {
  profile: "/users/profile";
  user: "/users/:id";
  userByEmail: "/users/email/:email";
  deactivate: "/users/deactivate";
  list: "/users";
  create: "/users";
  addRefreshToken: "/users/:id/refresh-tokens";
  removeRefreshToken: "/users/:id/refresh-tokens";
  removeAllRefreshTokens: "/users/:id/refresh-tokens/all";
  validateRefreshToken: "/users/:id/refresh-tokens/validate";
}

export interface UserApiRequests {
  updateProfile: {
    firstName?: string;
    lastName?: string;
  };
  createUser: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  };
  addRefreshToken: {
    refreshToken: string;
  };
  removeRefreshToken: {
    refreshToken: string;
  };
  validateRefreshToken: {
    refreshToken: string;
  };
}

export interface UserApiResponses {
  profile: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    status: string;
    lastLoginAt: string | null;
  };
  user: UserApiResponses["profile"];
  list: UserApiResponses["profile"][];
  create: UserApiResponses["profile"];
  deactivate: {
    message: string;
  };
  addRefreshToken: {
    message: string;
  };
  removeRefreshToken: {
    message: string;
  };
  removeAllRefreshTokens: {
    message: string;
  };
  validateRefreshToken: {
    valid: boolean;
  };
}

// ============================================================================
// Form API Types
// ============================================================================

export interface FormEndpoints {
  list: "/forms";
  create: "/forms";
  get: "/forms/:id";
  update: "/forms/:id";
  delete: "/forms/:id";
  duplicate: "/forms/:id/duplicate";
  publish: "/forms/:id/publish";
  unpublish: "/forms/:id/unpublish";
  analytics: "/forms/:id/analytics";
  submissions: "/forms/:id/submissions";
  export: "/forms/:id/export";
}

export interface FormApiRequests {
  create: {
    title: string;
    description?: string;
    template?: string;
  };
  update: {
    title?: string;
    description?: string;
    pages?: unknown[];
    elements?: unknown[];
    settings?: unknown;
    accessControl?: unknown;
    seo?: unknown;
  };
  duplicate: {
    title: string;
    copySubmissions?: boolean;
  };
  publish: {
    slug?: string;
    customDomain?: string;
  };
  export: {
    format: "pdf" | "json";
    includeSubmissions?: boolean;
  };
}

export interface FormApiResponses {
  list: PaginatedResponse<{
    id: string;
    title: string;
    description?: string;
    status: string;
    isPublished: boolean;
    submissions: number;
    views: number;
    conversionRate: number;
    createdAt: string;
    updatedAt: string;
  }>;
  create: {
    id: string;
    title: string;
    description?: string;
    status: string;
    slug: string;
    createdAt: string;
  };
  get: {
    id: string;
    title: string;
    description?: string;
    pages: unknown[];
    elements: unknown[];
    settings: unknown;
    status: string;
    isPublished: boolean;
    slug: string;
    analytics: unknown;
    createdAt: string;
    updatedAt: string;
  };
  update: FormApiResponses["get"];
  delete: {
    message: string;
  };
  duplicate: FormApiResponses["create"];
  publish: {
    form: FormApiResponses["get"];
    publicUrl: string;
  };
  unpublish: {
    message: string;
  };
  analytics: {
    views: number;
    submissions: number;
    conversionRate: number;
    averageCompletionTime: number;
    period: {
      start: string;
      end: string;
    };
  };
  export: {
    downloadUrl: string;
    filename: string;
    expiresAt: string;
  };
}

// ============================================================================
// Submission API Types
// ============================================================================

export interface SubmissionEndpoints {
  list: "/submissions";
  create: "/submissions";
  get: "/submissions/:id";
  update: "/submissions/:id";
  delete: "/submissions/:id";
  export: "/submissions/export";
  analytics: "/submissions/analytics";
  bulkUpdate: "/submissions/bulk-update";
  bulkDelete: "/submissions/bulk-delete";
}

export interface SubmissionApiRequests {
  create: {
    formId: string;
    data: Record<string, unknown>;
    submitter?: {
      email?: string;
      name?: string;
    };
  };
  update: {
    data?: Record<string, unknown>;
    notes?: string;
    tags?: string[];
    priority?: string;
    status?: string;
  };
  export: {
    formId?: string;
    format: "csv" | "excel" | "json";
    dateRange?: {
      start: string;
      end: string;
    };
    filters?: Record<string, unknown>;
  };
  bulkUpdate: {
    submissionIds: string[];
    updates: {
      status?: string;
      priority?: string;
      tags?: string[];
    };
  };
  bulkDelete: {
    submissionIds: string[];
  };
}

export interface SubmissionApiResponses {
  list: PaginatedResponse<{
    id: string;
    formId: string;
    formTitle: string;
    submitter: {
      name?: string;
      email?: string;
      isAnonymous: boolean;
    };
    status: string;
    priority?: string;
    submittedAt: string;
    processedAt?: string;
  }>;
  create: {
    id: string;
    status: string;
    submittedAt: string;
    redirectUrl?: string;
  };
  get: {
    id: string;
    formId: string;
    data: Record<string, unknown>;
    files: unknown[];
    submitter: unknown;
    status: string;
    payment?: unknown;
    signatures: unknown[];
    submittedAt: string;
  };
  update: SubmissionApiResponses["get"];
  delete: {
    message: string;
  };
  export: {
    downloadUrl: string;
    filename: string;
    expiresAt: string;
    totalRecords: number;
  };
  analytics: {
    total: number;
    totalToday: number;
    statusDistribution: Record<string, number>;
    trends: Array<{
      date: string;
      count: number;
    }>;
  };
  bulkUpdate: BulkResponse<{ id: string }>;
  bulkDelete: BulkResponse<{ id: string }>;
}

// ============================================================================
// File Upload API Types
// ============================================================================

export interface FileUploadEndpoints {
  upload: "/files/upload";
  delete: "/files/:id";
  getSignedUrl: "/files/signed-url";
}

export interface FileUploadApiRequests {
  upload: FormData;
  getSignedUrl: {
    filename: string;
    contentType: string;
    size: number;
  };
}

export interface FileUploadApiResponses {
  upload: {
    id: string;
    filename: string;
    originalName: string;
    url: string;
    size: number;
    mimetype: string;
    uploadedAt: string;
  };
  delete: {
    message: string;
  };
  getSignedUrl: {
    uploadUrl: string;
    fileUrl: string;
    expiresAt: string;
  };
}

// ============================================================================
// Query Parameters & Filters
// ============================================================================

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface DateRangeParams {
  dateFrom?: string;
  dateTo?: string;
}

export interface SearchParams {
  search?: string;
  filters?: Record<string, unknown>;
}

export type QueryParams = PaginationParams & DateRangeParams & SearchParams;

// ============================================================================
// API Hook Types
// ============================================================================

export interface UseApiOptions {
  enabled?: boolean;
  retry?: number;
  retryDelay?: number;
  staleTime?: number;
  cacheTime?: number;
  onSuccess?: (data: unknown) => void;
  onError?: (error: ApiError) => void;
  select?: (data: unknown) => unknown;
}

export interface UseQueryResult<T> {
  data: T | undefined;
  error: ApiError | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  isFetching: boolean;
  refetch: () => Promise<void>;
}

export interface UseMutationResult<T, V = unknown> {
  mutate: (variables: V) => Promise<T>;
  mutateAsync: (variables: V) => Promise<T>;
  data: T | undefined;
  error: ApiError | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  reset: () => void;
}

// ============================================================================
// API Cache Types
// ============================================================================

export interface CacheConfig {
  enabled: boolean;
  defaultTTL: number; // milliseconds
  maxSize: number; // maximum number of cached items
  storageType: "memory" | "localStorage" | "sessionStorage";
}

export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
  tags?: string[];
}

export interface CacheOperations {
  get<T>(key: string): CacheEntry<T> | null;
  set<T>(key: string, data: T, ttl?: number, tags?: string[]): void;
  delete(key: string): void;
  clear(): void;
  invalidateByTag(tag: string): void;
  has(key: string): boolean;
  size(): number;
}

// ============================================================================
// WebSocket API Types
// ============================================================================

export interface WebSocketConfig {
  url: string;
  protocols?: string[];
  reconnect: boolean;
  reconnectAttempts: number;
  reconnectDelay: number;
  heartbeat: boolean;
  heartbeatInterval: number;
}

export interface WebSocketMessage<T = unknown> {
  type: string;
  payload: T;
  timestamp: number;
  id?: string;
}

export interface WebSocketEvents {
  "form.updated": { formId: string; changes: unknown };
  "submission.created": { submissionId: string; formId: string };
  "submission.updated": { submissionId: string; changes: unknown };
  "user.online": { userId: string };
  "user.offline": { userId: string };
  notification: { type: string; message: string; data?: unknown };
}

// ============================================================================
// API Client Interface
// ============================================================================

export interface ApiClient {
  // Configuration
  config: ApiClientConfig;

  // HTTP methods
  get<T>(
    url: string,
    config?: Partial<ApiRequestConfig>,
  ): Promise<ApiResponse<T>>;
  post<T>(
    url: string,
    data?: unknown,
    config?: Partial<ApiRequestConfig>,
  ): Promise<ApiResponse<T>>;
  put<T>(
    url: string,
    data?: unknown,
    config?: Partial<ApiRequestConfig>,
  ): Promise<ApiResponse<T>>;
  patch<T>(
    url: string,
    data?: unknown,
    config?: Partial<ApiRequestConfig>,
  ): Promise<ApiResponse<T>>;
  delete<T>(
    url: string,
    config?: Partial<ApiRequestConfig>,
  ): Promise<ApiResponse<T>>;

  // Authentication
  setAuthToken(token: string): void;
  getAuthToken(): string | null;
  clearAuthToken(): void;
  refreshToken(): Promise<string>;

  // Request building
  buildUrl(path: string, params?: Record<string, unknown>): string;
  buildHeaders(headers?: RequestHeaders): RequestHeaders;

  // Interceptors
  addRequestInterceptor(
    interceptor: (config: ApiRequestConfig) => ApiRequestConfig,
  ): void;
  addResponseInterceptor(
    interceptor: (response: ApiResponse) => ApiResponse,
  ): void;
  addErrorInterceptor(
    interceptor: (error: ApiError) => Promise<ApiError | never>,
  ): void;

  // Cache
  cache: CacheOperations;

  // Utilities
  isOnline(): boolean;
  cancelRequest(requestId: string): void;
  cancelAllRequests(): void;
}

// ============================================================================
// Type Guards
// ============================================================================

export const isApiError = (obj: unknown): obj is ApiError => {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "message" in obj !== null &&
    "status" in obj !== null &&
    typeof (obj as ApiError).message === "string" &&
    typeof (obj as ApiError).status === "number"
  );
};

export const isPaginatedResponse = <T>(
  obj: unknown,
): obj is PaginatedResponse<T> => {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "data" in obj !== null &&
    "pagination" in obj !== null &&
    Array.isArray((obj as PaginatedResponse<T>).data) &&
    typeof (obj as PaginatedResponse<T>).pagination.page === "number"
  );
};

// ============================================================================
// Utility Types
// ============================================================================

export type ApiEndpoint = keyof (AuthEndpoints &
  UserEndpoints &
  FormEndpoints &
  SubmissionEndpoints);
export type ApiRequestData<T extends ApiEndpoint> =
  T extends keyof AuthApiRequests
    ? AuthApiRequests[T]
    : T extends keyof UserApiRequests
      ? UserApiRequests[T]
      : unknown;

export type ApiResponseData<T extends ApiEndpoint> =
  T extends keyof AuthApiResponses
    ? AuthApiResponses[T]
    : T extends keyof UserApiResponses
      ? UserApiResponses[T]
      : unknown;

// ============================================================================
// Constants
// ============================================================================

export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const CONTENT_TYPES = {
  JSON: "application/json",
  FORM_DATA: "multipart/form-data",
  URL_ENCODED: "application/x-www-form-urlencoded",
  TEXT: "text/plain",
  HTML: "text/html",
} as const;

// Note: All types are exported individually above
