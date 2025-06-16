/**
 * Form Types for ArvaForm Frontend
 *
 * These types mirror the backend form schema and form-related DTOs
 * for the form builder and form management functionality.
 */

// ============================================================================
// Core Form Types
// ============================================================================

export type FormStatus = 'draft' | 'published' | 'archived' | 'deleted';
export type AccessControlType = 'public' | 'private' | 'password' | 'domain';
export type ElementType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'number'
  | 'phone'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'file'
  | 'date'
  | 'time'
  | 'datetime'
  | 'url'
  | 'rating'
  | 'signature'
  | 'payment'
  | 'section'
  | 'divider'
  | 'html';

export type LogicOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'is_empty'
  | 'is_not_empty';

// ============================================================================
// Form Element Types
// ============================================================================

export interface FormElementValidation {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  customMessage?: string;
}

export interface FormElementPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FormElementStyling {
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  borderRadius?: number;
  padding?: number;
  margin?: number;
}

export interface ConditionalLogicCondition {
  field: string;
  operator: LogicOperator;
  value: unknown;
}

export interface ConditionalLogic {
  show: boolean;
  conditions: ConditionalLogicCondition[];
  logicType?: 'all' | 'any'; // AND or OR logic
}

export interface FormElement {
  id: string; // Unique within form
  type: ElementType;
  pageId: string; // Parent page ID

  // Display Properties
  label: string;
  placeholder?: string;
  helpText?: string;
  description?: string;

  // Validation Rules
  validation: FormElementValidation;

  // Element-Specific Configuration
  options?: string[]; // For select, radio, checkbox
  defaultValue?: unknown;
  fileTypes?: string[]; // For file uploads
  maxFileSize?: number; // MB
  allowMultiple?: boolean; // For file uploads and checkboxes

  // Layout & Styling
  position: FormElementPosition;
  styling: FormElementStyling;

  // Conditional Logic
  conditionalLogic?: ConditionalLogic;

  // Advanced Properties
  metadata?: Record<string, unknown>;
  isRequired?: boolean; // Computed from validation
}

// ============================================================================
// Form Page Types
// ============================================================================

export interface FormPage {
  id: string;
  title: string;
  description?: string;
  order: number;

  // Page Settings
  settings: {
    showTitle: boolean;
    showDescription: boolean;
    showProgressBar: boolean;
    allowPrevious: boolean;
  };

  // Page Styling
  styling: {
    backgroundColor?: string;
    backgroundImage?: string;
    padding?: number;
    maxWidth?: number;
  };

  // Conditional Logic for entire page
  conditionalLogic?: ConditionalLogic;
}

// ============================================================================
// Form Settings Types
// ============================================================================

export interface FormNotificationSettings {
  email: {
    enabled: boolean;
    recipients: string[];
    subject?: string;
    template?: string;
    replyTo?: string;
  };
  webhook: {
    enabled: boolean;
    url?: string;
    headers?: Record<string, string>;
    retryAttempts?: number;
  };
  slack: {
    enabled: boolean;
    webhookUrl?: string;
    channel?: string;
  };
}

export interface FormSubmitButton {
  text: string;
  color: string;
  backgroundColor: string;
  position: 'left' | 'center' | 'right';
  size: 'small' | 'medium' | 'large';
  loading?: boolean;
}

export interface FormIntegrations {
  googleSheets?: {
    enabled: boolean;
    spreadsheetId: string;
    worksheetId: string;
    mapping?: Record<string, string>;
  };
  zapier?: {
    enabled: boolean;
    webhookUrl: string;
  };
  mailchimp?: {
    enabled: boolean;
    listId: string;
    apiKey: string;
    doubleOptIn?: boolean;
  };
  airtable?: {
    enabled: boolean;
    baseId: string;
    tableId: string;
    apiKey: string;
  };
}

export interface FormSettings {
  // Submission Handling
  submitButton: FormSubmitButton;
  allowMultipleSubmissions: boolean;
  requireLogin: boolean;
  saveProgress: boolean;
  showProgressBar: boolean;

  // Notifications
  notifications: FormNotificationSettings;

  // Redirect & Thank You
  redirectUrl?: string;
  thankYouMessage?: string;
  showThankYouPage: boolean;

  // Integrations
  integrations: FormIntegrations;

  // Advanced Settings
  captcha: {
    enabled: boolean;
    type: 'recaptcha' | 'hcaptcha';
    siteKey?: string;
  };

  // Data Management
  dataRetention: {
    enabled: boolean;
    days?: number; // 0 = forever
  };

  // Submission Limits
  submissionLimits: {
    enabled: boolean;
    maxSubmissions?: number;
    limitType: 'total' | 'per_user' | 'per_day';
  };
}

// ============================================================================
// Form Access Control Types
// ============================================================================

export interface FormAccessControl {
  type: AccessControlType;
  password?: string; // Hashed on backend
  allowedDomains?: string[];
  allowedUsers?: string[]; // User IDs
  allowedRoles?: string[]; // Role IDs

  // Time-based access
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string

  // Geographic restrictions
  allowedCountries?: string[];
  blockedCountries?: string[];
}

// ============================================================================
// Form Analytics Types
// ============================================================================

export interface FormAnalytics {
  views: number;
  submissions: number;
  conversionRate: number;
  averageCompletionTime: number; // seconds
  lastSubmissionAt?: string; // ISO date string

  // Detailed Analytics
  viewsByDay: Array<{
    date: string;
    views: number;
  }>;
  submissionsByDay: Array<{
    date: string;
    submissions: number;
  }>;

  // Element Analytics
  elementInteractions: Record<
    string,
    {
      views: number;
      interactions: number;
      abandonmentRate: number;
    }
  >;

  // User Journey
  pageViews: Record<string, number>;
  dropoffPoints: Array<{
    pageId: string;
    dropoffRate: number;
  }>;
}

// ============================================================================
// Form SEO Types
// ============================================================================

export interface FormSEO {
  metaTitle?: string;
  metaDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  canonicalUrl?: string;
  robots?: string;
}

// ============================================================================
// Conditional Rules Types
// ============================================================================

export interface ConditionalRule {
  id: string;
  name: string;
  description?: string;

  // Trigger Conditions
  triggers: Array<{
    elementId: string;
    operator: LogicOperator;
    value: unknown;
  }>;

  // Actions
  actions: Array<{
    type: 'show' | 'hide' | 'require' | 'set_value' | 'redirect' | 'calculate';
    targetId: string; // Element ID or page ID
    value?: unknown;
  }>;

  // Logic Type
  logicType: 'all' | 'any'; // AND or OR

  // Execution Order
  priority: number;
  enabled: boolean;
}

// ============================================================================
// Main Form Interface
// ============================================================================

export interface Form {
  // Basic Information
  id: string;
  title: string;
  description?: string;

  // Ownership & Access
  createdBy: string; // User ID
  organizationId?: string; // Organization ID

  // Form Structure
  pages: FormPage[];
  elements: FormElement[];

  // Form Configuration
  settings: FormSettings;

  // Conditional Logic
  conditionalRules: ConditionalRule[];

  // Publishing & Access
  isPublished: boolean;
  publishedAt?: string; // ISO date string
  slug: string; // Unique URL slug
  customDomain?: string;

  // Security & Access Control
  accessControl: FormAccessControl;

  // Analytics & Tracking
  analytics: FormAnalytics;

  // SEO & Metadata
  seo: FormSEO;

  // Status & Lifecycle
  status: FormStatus;
  version: number; // Version control

  // Timestamps
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  deletedAt?: string; // ISO date string
}

// ============================================================================
// Form Builder Types
// ============================================================================

export interface FormBuilderState {
  form: Form;
  selectedElement: FormElement | null;
  selectedPage: FormPage | null;
  draggedElement: FormElement | null;
  previewMode: boolean;
  isDirty: boolean;
  isLoading: boolean;
  errors: string[];
}

export interface FormBuilderActions {
  // Form Actions
  updateForm: (updates: Partial<Form>) => void;
  saveForm: () => Promise<void>;
  publishForm: () => Promise<void>;
  duplicateForm: () => Promise<Form>;
  deleteForm: () => Promise<void>;

  // Page Actions
  addPage: () => FormPage;
  updatePage: (pageId: string, updates: Partial<FormPage>) => void;
  deletePage: (pageId: string) => void;
  reorderPages: (pageIds: string[]) => void;

  // Element Actions
  addElement: (element: Omit<FormElement, 'id'>) => void;
  updateElement: (elementId: string, updates: Partial<FormElement>) => void;
  deleteElement: (elementId: string) => void;
  duplicateElement: (elementId: string) => void;
  moveElement: (elementId: string, newPosition: FormElementPosition) => void;

  // Selection Actions
  selectElement: (element: FormElement | null) => void;
  selectPage: (page: FormPage | null) => void;

  // State Actions
  setPreviewMode: (enabled: boolean) => void;
  setLoading: (loading: boolean) => void;
  addError: (error: string) => void;
  clearErrors: () => void;
}

// ============================================================================
// Form DTOs
// ============================================================================

export interface CreateFormDto {
  title: string;
  description?: string;
  template?: string; // Template ID
}

export interface UpdateFormDto {
  title?: string;
  description?: string;
  settings?: Partial<FormSettings>;
  accessControl?: Partial<FormAccessControl>;
  seo?: Partial<FormSEO>;
}

export interface DuplicateFormDto {
  title: string;
  copySubmissions?: boolean;
}

export interface PublishFormDto {
  slug?: string;
  customDomain?: string;
}

// ============================================================================
// Form List Types
// ============================================================================

export interface FormListItem {
  id: string;
  title: string;
  description?: string;
  status: FormStatus;
  isPublished: boolean;
  submissions: number;
  views: number;
  conversionRate: number;
  lastSubmissionAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormListResponse {
  forms: FormListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface FormFilters {
  status?: FormStatus;
  search?: string;
  createdBy?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'submissions' | 'views';
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// Form Templates Types
// ============================================================================

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  thumbnail?: string;
  isPopular: boolean;
  isFree: boolean;
  form: Omit<Form, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>;
  createdAt: string;
}

export interface FormTemplateCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
  templateCount: number;
}

// ============================================================================
// Form Validation Types
// ============================================================================

export interface FormValidationError {
  field: string;
  message: string;
  code: string;
  elementId?: string;
  pageId?: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: FormValidationError[];
  warnings: FormValidationError[];
}

// ============================================================================
// Form API Response Types
// ============================================================================

export interface GetFormResponse {
  form: Form;
}

export interface CreateFormResponse {
  form: Form;
}

export interface UpdateFormResponse {
  form: Form;
}

export interface DeleteFormResponse {
  message: string;
}

export interface PublishFormResponse {
  form: Form;
  publicUrl: string;
}

export interface FormAnalyticsResponse {
  analytics: FormAnalytics;
  period: {
    start: string;
    end: string;
  };
}

// ============================================================================
// Type Guards
// ============================================================================

/* eslint-disable @typescript-eslint/no-explicit-any */
export const isForm = (obj: unknown): obj is Form => {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    typeof (obj as any).id === 'string' &&
    typeof (obj as any).title === 'string' &&
    Array.isArray((obj as any).pages) &&
    Array.isArray((obj as any).elements)
  );
};

export const isFormElement = (obj: unknown): obj is FormElement => {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    typeof (obj as any).id === 'string' &&
    typeof (obj as any).type === 'string' &&
    typeof (obj as any).label === 'string'
  );
};

export const isFormPage = (obj: unknown): obj is FormPage => {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    typeof (obj as any).id === 'string' &&
    typeof (obj as any).title === 'string' &&
    typeof (obj as any).order === 'number'
  );
};
/* eslint-enable @typescript-eslint/no-explicit-any */

// ============================================================================
// Utility Types
// ============================================================================

export type FormWithoutSensitiveData = Omit<Form, 'accessControl'>;
export type FormBasicInfo = Pick<Form, 'id' | 'title' | 'description' | 'status' | 'isPublished'>;
export type FormElementBasic = Pick<FormElement, 'id' | 'type' | 'label' | 'validation'>;

// ============================================================================
// Constants
// ============================================================================

export const ELEMENT_TYPES: Record<
  ElementType,
  { label: string; category: string; icon?: string }
> = {
  text: { label: 'Text Input', category: 'Basic' },
  textarea: { label: 'Textarea', category: 'Basic' },
  email: { label: 'Email', category: 'Basic' },
  number: { label: 'Number', category: 'Basic' },
  phone: { label: 'Phone', category: 'Basic' },
  select: { label: 'Dropdown', category: 'Choice' },
  radio: { label: 'Radio Buttons', category: 'Choice' },
  checkbox: { label: 'Checkboxes', category: 'Choice' },
  file: { label: 'File Upload', category: 'Advanced' },
  date: { label: 'Date', category: 'Date & Time' },
  time: { label: 'Time', category: 'Date & Time' },
  datetime: { label: 'Date & Time', category: 'Date & Time' },
  url: { label: 'Website URL', category: 'Basic' },
  rating: { label: 'Rating', category: 'Advanced' },
  signature: { label: 'Signature', category: 'Advanced' },
  payment: { label: 'Payment', category: 'Advanced' },
  section: { label: 'Section', category: 'Layout' },
  divider: { label: 'Divider', category: 'Layout' },
  html: { label: 'HTML Block', category: 'Layout' },
};

export const FORM_STATUSES: Record<FormStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'gray' },
  published: { label: 'Published', color: 'green' },
  archived: { label: 'Archived', color: 'yellow' },
  deleted: { label: 'Deleted', color: 'red' },
};
