/**
 * Submission Types for ArvaForm Frontend
 *
 * These types mirror the backend submission schema and submission-related DTOs
 * for form submission handling and management.
 */

// ============================================================================
// Core Submission Types
// ============================================================================

export type SubmissionStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";
export type IntegrationStatus = "pending" | "success" | "failed";
export type DeviceType = "desktop" | "tablet" | "mobile";

// ============================================================================
// File Upload Types
// ============================================================================

export interface FileUpload {
  fieldId: string;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  url: string;
  uploadedAt: string; // ISO date string

  // Additional metadata
  width?: number; // For images
  height?: number; // For images
  duration?: number; // For videos/audio
  checksum?: string; // File integrity
}

export interface FileUploadProgress {
  fieldId: string;
  filename: string;
  progress: number; // 0-100
  status: "uploading" | "completed" | "error";
  error?: string;
}

// ============================================================================
// Submitter Information Types
// ============================================================================

export interface SubmitterInfo {
  userId?: string; // If logged in
  email?: string;
  name?: string;
  isAnonymous: boolean;

  // Additional contact info (if collected)
  phone?: string;
  company?: string;

  // Consent and legal
  agreedToTerms?: boolean;
  marketingOptIn?: boolean;
  privacyPolicyAccepted?: boolean;
}

// ============================================================================
// Payment Information Types
// ============================================================================

export interface PaymentInfo {
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripePaymentIntentId?: string;
  transactionId?: string;
  processedAt?: string; // ISO date string

  // Payment Details
  paymentMethod?: {
    type: "card" | "paypal" | "bank_transfer";
    last4?: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
  };

  // Billing Information
  billingAddress?: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  // Receipt
  receiptUrl?: string;
  invoiceUrl?: string;

  // Refund Information
  refunds?: Array<{
    id: string;
    amount: number;
    reason?: string;
    processedAt: string;
  }>;
}

// ============================================================================
// Processing Information Types
// ============================================================================

export interface ProcessingInfo {
  attempts: number;
  lastAttemptAt?: string; // ISO date string
  nextRetryAt?: string; // ISO date string

  errors: Array<{
    message: string;
    timestamp: string; // ISO date string
    stack?: string;
    code?: string;
  }>;

  // Processing stages
  stages: Array<{
    name: string;
    status: "pending" | "processing" | "completed" | "failed";
    startedAt?: string;
    completedAt?: string;
    error?: string;
  }>;

  // Performance metrics
  processingTime?: number; // milliseconds
  queuePosition?: number;
}

// ============================================================================
// Digital Signature Types
// ============================================================================

export interface DigitalSignature {
  fieldId: string;
  signatureData: string; // Base64 encoded
  signerName: string;
  signerEmail: string;
  signedAt: string; // ISO date string
  ipAddress: string;
  userAgent?: string;

  // Signature verification
  isVerified: boolean;
  verificationMethod: "email" | "sms" | "document";
  verificationData?: {
    code?: string;
    documentId?: string;
  };

  // Legal compliance
  consentText?: string;
  legalDisclaimer?: string;
  certificateId?: string;
}

// ============================================================================
// Integration Status Types
// ============================================================================

export interface IntegrationStatusItem {
  integration: string;
  status: IntegrationStatus;
  attempts: number;
  lastAttemptAt?: string; // ISO date string
  nextRetryAt?: string; // ISO date string
  error?: string;

  // Integration-specific data
  externalId?: string; // ID in external system
  externalUrl?: string; // Link to record in external system
  mapping?: Record<string, unknown>; // Field mapping used

  // Response data
  response?: {
    statusCode?: number;
    data?: unknown;
    headers?: Record<string, string>;
  };
}

// ============================================================================
// Submission Metadata Types
// ============================================================================

export interface SubmissionMetadata {
  userAgent: string;
  ipAddress: string;
  referrer?: string;
  completionTime: number; // seconds
  deviceType: DeviceType;

  // Additional tracking
  sessionId?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };

  // Geographic data
  geolocation?: {
    country?: string;
    region?: string;
    city?: string;
    timezone?: string;
    latitude?: number;
    longitude?: number;
  };

  // Browser information
  browser?: {
    name?: string;
    version?: string;
    language?: string;
    platform?: string;
    viewport?: {
      width: number;
      height: number;
    };
  };
}

// ============================================================================
// Main Submission Interface
// ============================================================================

export interface FormSubmission {
  // Basic Information
  id: string;
  formId: string; // Form reference
  formVersion: number; // Form version at submission

  // Submission Data
  data: Record<string, unknown>; // Form field values
  files: FileUpload[]; // Uploaded files

  // Submitter Information
  submitter: SubmitterInfo;

  // Processing Status
  status: SubmissionStatus;
  processing: ProcessingInfo;

  // Payment Information (if applicable)
  payment?: PaymentInfo;

  // Digital Signatures
  signatures: DigitalSignature[];

  // Integration Status
  integrations: IntegrationStatusItem[];

  // Metadata
  metadata: SubmissionMetadata;

  // Additional Information
  notes?: string; // Admin notes
  tags?: string[]; // For organization
  priority?: "low" | "normal" | "high" | "urgent";

  // Timestamps
  submittedAt: string; // ISO date string
  processedAt?: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// ============================================================================
// Submission Form State Types
// ============================================================================

export interface SubmissionFormState {
  // Current form data
  data: Record<string, unknown>;
  files: Record<string, File[]>;

  // Form state
  currentPage: number;
  totalPages: number;
  isSubmitting: boolean;
  isValidating: boolean;

  // Validation
  errors: Record<string, string[]>;
  touched: Record<string, boolean>;

  // Progress
  completionPercentage: number;
  startedAt?: string;

  // Auto-save
  lastSaved?: string;
  isDirty: boolean;

  // Conditional logic state
  visibleElements: Set<string>;
  requiredElements: Set<string>;

  // File upload state
  uploadProgress: Record<string, FileUploadProgress>;
}

export interface SubmissionFormActions {
  // Data actions
  updateField: (fieldId: string, value: unknown) => void;
  updateMultipleFields: (updates: Record<string, unknown>) => void;
  clearField: (fieldId: string) => void;
  resetForm: () => void;

  // Navigation actions
  goToPage: (pageNumber: number) => void;
  nextPage: () => void;
  previousPage: () => void;

  // Validation actions
  validateField: (fieldId: string) => Promise<boolean>;
  validatePage: (pageNumber?: number) => Promise<boolean>;
  validateForm: () => Promise<boolean>;

  // File actions
  uploadFile: (fieldId: string, file: File) => Promise<void>;
  removeFile: (fieldId: string, fileIndex: number) => void;

  // Submission actions
  saveDraft: () => Promise<void>;
  submitForm: () => Promise<FormSubmission>;

  // State actions
  markFieldTouched: (fieldId: string) => void;
  setError: (fieldId: string, error: string) => void;
  clearErrors: (fieldId?: string) => void;
}

// ============================================================================
// Submission DTOs
// ============================================================================

export interface CreateSubmissionDto {
  formId: string;
  data: Record<string, unknown>;
  submitter?: Partial<SubmitterInfo>;
  metadata?: Partial<SubmissionMetadata>;
}

export interface UpdateSubmissionDto {
  data?: Record<string, unknown>;
  notes?: string;
  tags?: string[];
  priority?: "low" | "normal" | "high" | "urgent";
  status?: SubmissionStatus;
}

export interface ProcessSubmissionDto {
  submissionId: string;
  action: "approve" | "reject" | "retry" | "archive";
  notes?: string;
}

// ============================================================================
// Submission List Types
// ============================================================================

export interface SubmissionListItem {
  id: string;
  formId: string;
  formTitle: string;
  submitter: {
    name?: string;
    email?: string;
    isAnonymous: boolean;
  };
  status: SubmissionStatus;
  priority?: "low" | "normal" | "high" | "urgent";
  payment?: {
    amount: number;
    currency: string;
    status: PaymentStatus;
  };
  submittedAt: string;
  processedAt?: string;

  // Quick preview data
  previewData: Record<string, unknown>; // First few fields
  hasFiles: boolean;
  hasSignatures: boolean;
  hasPayment: boolean;
}

export interface SubmissionListResponse {
  submissions: SubmissionListItem[];
  total: number;
  page: number;
  limit: number;

  // Aggregations
  statusCounts: Record<SubmissionStatus, number>;
  totalAmount?: number; // If forms have payments
}

export interface SubmissionFilters {
  formId?: string;
  status?: SubmissionStatus | SubmissionStatus[];
  priority?: "low" | "normal" | "high" | "urgent";
  submitterEmail?: string;
  hasPayment?: boolean;
  hasFiles?: boolean;
  hasSignatures?: boolean;
  dateFrom?: string;
  dateTo?: string;
  search?: string; // Search in submission data
  tags?: string[];
  sortBy?: "submittedAt" | "processedAt" | "priority" | "status";
  sortOrder?: "asc" | "desc";
}

// ============================================================================
// Submission Analytics Types
// ============================================================================

export interface SubmissionAnalytics {
  // Overview metrics
  total: number;
  totalToday: number;
  totalThisWeek: number;
  totalThisMonth: number;

  // Status breakdown
  statusDistribution: Record<SubmissionStatus, number>;

  // Trends
  submissionTrends: Array<{
    date: string;
    count: number;
    completionRate: number;
  }>;

  // Performance metrics
  averageCompletionTime: number; // seconds
  averageProcessingTime: number; // seconds
  bounceRate: number; // percentage

  // Payment analytics (if applicable)
  revenue?: {
    total: number;
    currency: string;
    averageOrderValue: number;
    conversionRate: number;
  };

  // Geographic distribution
  countryDistribution: Array<{
    country: string;
    count: number;
    percentage: number;
  }>;

  // Device analytics
  deviceDistribution: Record<DeviceType, number>;
  browserDistribution: Record<string, number>;
}

// ============================================================================
// Submission Export Types
// ============================================================================

export interface ExportSubmissionsDto {
  formId?: string;
  filters?: SubmissionFilters;
  format: "csv" | "excel" | "json" | "pdf";
  includeFiles?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  fields?: string[]; // Specific fields to export
}

export interface ExportResponse {
  downloadUrl: string;
  filename: string;
  expiresAt: string; // ISO date string
  totalRecords: number;
}

// ============================================================================
// Submission Validation Types
// ============================================================================

export interface SubmissionValidationError {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

export interface SubmissionValidationResult {
  isValid: boolean;
  errors: SubmissionValidationError[];
  warnings: SubmissionValidationError[];

  // Field-specific validation
  fieldErrors: Record<string, SubmissionValidationError[]>;

  // Business rule validation
  businessRuleErrors: SubmissionValidationError[];
}

// ============================================================================
// API Response Types
// ============================================================================

export interface GetSubmissionResponse {
  submission: FormSubmission;
}

export interface CreateSubmissionResponse {
  submission: FormSubmission;
  redirectUrl?: string; // If form has redirect
}

export interface UpdateSubmissionResponse {
  submission: FormSubmission;
}

export interface DeleteSubmissionResponse {
  message: string;
}

export interface SubmissionAnalyticsResponse {
  analytics: SubmissionAnalytics;
  period: {
    start: string;
    end: string;
  };
}

// ============================================================================
// Type Guards
// ============================================================================

/* eslint-disable @typescript-eslint/no-explicit-any */
export const isFormSubmission = (obj: unknown): obj is FormSubmission => {
  return (
    obj !== null &&
    typeof obj === "object" &&
    typeof (obj as any).id === "string" &&
    typeof (obj as any).formId === "string" &&
    typeof (obj as any).status === "string" &&
    (obj as any).data &&
    typeof (obj as any).data === "object"
  );
};

export const isFileUpload = (obj: unknown): obj is FileUpload => {
  return (
    obj !== null &&
    typeof obj === "object" &&
    typeof (obj as any).fieldId === "string" &&
    typeof (obj as any).filename === "string" &&
    typeof (obj as any).url === "string"
  );
};

export const isPaymentInfo = (obj: unknown): obj is PaymentInfo => {
  return (
    obj !== null &&
    typeof obj === "object" &&
    typeof (obj as any).amount === "number" &&
    typeof (obj as any).currency === "string" &&
    typeof (obj as any).status === "string"
  );
};
/* eslint-enable @typescript-eslint/no-explicit-any */

// ============================================================================
// Utility Types
// ============================================================================

export type SubmissionWithoutSensitiveData = Omit<
  FormSubmission,
  "metadata.ipAddress" | "payment.paymentMethod"
>;
export type SubmissionBasicInfo = Pick<
  FormSubmission,
  "id" | "formId" | "status" | "submittedAt" | "submitter"
>;
export type SubmissionPreview = Pick<
  FormSubmission,
  "id" | "data" | "submitter" | "submittedAt"
>;

// ============================================================================
// Constants
// ============================================================================

export const SUBMISSION_STATUSES: Record<
  SubmissionStatus,
  { label: string; color: string; icon?: string }
> = {
  pending: { label: "Pending", color: "yellow" },
  processing: { label: "Processing", color: "blue" },
  completed: { label: "Completed", color: "green" },
  failed: { label: "Failed", color: "red" },
};

export const PAYMENT_STATUSES: Record<
  PaymentStatus,
  { label: string; color: string }
> = {
  pending: { label: "Pending", color: "yellow" },
  completed: { label: "Completed", color: "green" },
  failed: { label: "Failed", color: "red" },
  refunded: { label: "Refunded", color: "gray" },
};

export const INTEGRATION_STATUSES: Record<
  IntegrationStatus,
  { label: string; color: string }
> = {
  pending: { label: "Pending", color: "yellow" },
  success: { label: "Success", color: "green" },
  failed: { label: "Failed", color: "red" },
};
