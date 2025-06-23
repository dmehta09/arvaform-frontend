/**
 * Submission Validator - 2025 Edition
 *
 * Zod-based validation schemas for form submission processing.
 * Provides consistent client/server validation with React 19 integration.
 *
 * Features:
 * - Dynamic schema generation from form elements
 * - File upload validation with security checks
 * - Multi-step form validation
 * - Real-time validation with debouncing
 * - Accessibility-compliant error messages
 * - TypeScript strict mode compliance
 */

import { FormElement } from '@/types/form.types';
import { z } from 'zod';

// ============================================================================
// Base Types & Interfaces
// ============================================================================

export interface SubmissionData {
  [elementId: string]: unknown;
}

export interface ValidationContext {
  formId: string;
  pageId?: string;
  elementId?: string;
  userId?: string;
  sessionId?: string;
}

export interface ValidationError {
  elementId: string;
  field: string;
  message: string;
  code: string;
  type: 'required' | 'format' | 'length' | 'file' | 'custom';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  data: SubmissionData;
}

// ============================================================================
// File Upload Validation
// ============================================================================

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
] as const;

type AllowedFileType = (typeof ALLOWED_FILE_TYPES)[number];

export const fileValidationSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  size: z
    .number()
    .max(MAX_FILE_SIZE, `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`),
  type: z.enum(ALLOWED_FILE_TYPES as unknown as [AllowedFileType, ...AllowedFileType[]], {
    errorMap: () => ({ message: 'File type not supported' }),
  }),
  lastModified: z.number().optional(),
});

export const multipleFilesSchema = z.array(fileValidationSchema).max(5, 'Maximum 5 files allowed');

// ============================================================================
// Element-Specific Validation Schemas
// ============================================================================

const textSchema = z.string().trim();
const emailSchema = z.string().email('Please enter a valid email address');
const phoneSchema = z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number');
const numberSchema = z.coerce.number();
const urlSchema = z.string().url('Please enter a valid URL');
const dateSchema = z.string().datetime({ offset: true }).or(z.string().date());
const timeSchema = z
  .string()
  .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time');

// ============================================================================
// Dynamic Schema Generation
// ============================================================================

/**
 * Creates a Zod schema for a form element based on its configuration
 */
export function createElementSchema(element: FormElement): z.ZodSchema {
  let baseSchema: z.ZodSchema;

  // Base schema by element type
  switch (element.type) {
    case 'text':
    case 'textarea':
      baseSchema = textSchema;
      break;
    case 'email':
      baseSchema = emailSchema;
      break;
    case 'phone':
      baseSchema = phoneSchema;
      break;
    case 'number':
      baseSchema = numberSchema;
      break;
    case 'url':
      baseSchema = urlSchema;
      break;
    case 'date':
    case 'datetime':
      baseSchema = dateSchema;
      break;
    case 'time':
      baseSchema = timeSchema;
      break;
    case 'select':
    case 'radio':
      if (element.options && element.options.length > 0) {
        baseSchema = z.enum(element.options as [string, ...string[]]);
      } else {
        baseSchema = z.string();
      }
      break;
    case 'checkbox':
      if (element.allowMultiple) {
        baseSchema = z.array(z.string()).min(0);
      } else {
        baseSchema = z.boolean();
      }
      break;
    case 'file':
      baseSchema = element.allowMultiple ? multipleFilesSchema : fileValidationSchema;
      break;
    case 'rating':
      baseSchema = z.number().min(1).max(5);
      break;
    case 'signature':
      baseSchema = z.string().min(1, 'Signature is required');
      break;
    case 'payment':
      baseSchema = z.object({
        amount: z.number().positive(),
        currency: z.string().length(3),
        token: z.string().min(1),
      });
      break;
    default:
      baseSchema = z.unknown();
  }

  // Apply validation rules
  if (element.validation) {
    // Required validation
    if (element.validation.required) {
      if (baseSchema instanceof z.ZodString) {
        baseSchema = baseSchema.min(
          1,
          element.validation.customMessage || `${element.label} is required`,
        );
      } else if (baseSchema instanceof z.ZodArray) {
        baseSchema = baseSchema.min(
          1,
          element.validation.customMessage || `${element.label} is required`,
        );
      }
    } else {
      // Make optional if not required
      baseSchema = baseSchema.optional();
    }

    // Length validation for strings
    if (baseSchema instanceof z.ZodString) {
      let stringSchema = baseSchema as z.ZodString;
      if (element.validation.minLength) {
        stringSchema = stringSchema.min(
          element.validation.minLength,
          `${element.label} must be at least ${element.validation.minLength} characters`,
        );
      }
      if (element.validation.maxLength) {
        stringSchema = stringSchema.max(
          element.validation.maxLength,
          `${element.label} must be no more than ${element.validation.maxLength} characters`,
        );
      }
      baseSchema = stringSchema;
    }

    // Number validation
    if (baseSchema instanceof z.ZodNumber) {
      let numberSchema = baseSchema as z.ZodNumber;
      if (element.validation.min !== undefined) {
        numberSchema = numberSchema.min(
          element.validation.min,
          `${element.label} must be at least ${element.validation.min}`,
        );
      }
      if (element.validation.max !== undefined) {
        numberSchema = numberSchema.max(
          element.validation.max,
          `${element.label} must be no more than ${element.validation.max}`,
        );
      }
      baseSchema = numberSchema;
    }

    // Pattern validation
    if (element.validation.pattern && baseSchema instanceof z.ZodString) {
      try {
        const regex = new RegExp(element.validation.pattern);
        baseSchema = baseSchema.regex(
          regex,
          element.validation.customMessage || `${element.label} format is invalid`,
        );
      } catch (error) {
        console.warn(`Invalid regex pattern for element ${element.id}:`, error);
      }
    }
  }

  return baseSchema;
}

/**
 * Creates a complete Zod schema for form submission validation
 */
export function createFormSubmissionSchema(elements: FormElement[]): z.ZodSchema {
  const schemaFields: Record<string, z.ZodSchema> = {};

  elements.forEach((element) => {
    // Skip non-input elements
    if (['section', 'divider', 'html'].includes(element.type)) {
      return;
    }

    schemaFields[element.id] = createElementSchema(element);
  });

  return z.object(schemaFields);
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates form submission data against form elements
 */
export function validateSubmissionData(
  data: SubmissionData,
  elements: FormElement[],
  _context?: ValidationContext,
): ValidationResult {
  const schema = createFormSubmissionSchema(elements);
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      isValid: true,
      errors: [],
      warnings: [],
      data: result.data,
    };
  }

  const errors: ValidationError[] = result.error.issues.map((issue) => ({
    elementId: String(issue.path[0] || ''),
    field: issue.path.join('.'),
    message: issue.message,
    code: issue.code,
    type: getErrorType(issue.code),
  }));

  return {
    isValid: false,
    errors,
    warnings: [],
    data,
  };
}

/**
 * Validates a single field value
 */
export function validateFieldValue(
  elementId: string,
  value: unknown,
  element: FormElement,
): ValidationError | null {
  const schema = createElementSchema(element);
  const result = schema.safeParse(value);

  if (result.success) {
    return null;
  }

  const issue = result.error.issues[0];
  if (!issue) return null;

  return {
    elementId,
    field: elementId,
    message: issue.message,
    code: issue.code,
    type: getErrorType(issue.code),
  };
}

/**
 * Validates file uploads with security checks
 */
export function validateFileUpload(file: File, element: FormElement): ValidationError | null {
  // Check file size
  const maxSize = element.maxFileSize ? element.maxFileSize * 1024 * 1024 : MAX_FILE_SIZE;
  if (file.size > maxSize) {
    return {
      elementId: element.id,
      field: 'file',
      message: `File size must be less than ${maxSize / 1024 / 1024}MB`,
      code: 'too_big',
      type: 'file',
    };
  }

  // Check file type
  const allowedTypes = element.fileTypes || [...ALLOWED_FILE_TYPES];
  if (!allowedTypes.includes(file.type)) {
    return {
      elementId: element.id,
      field: 'file',
      message: `File type ${file.type} is not supported`,
      code: 'invalid_type',
      type: 'file',
    };
  }

  // Check file name for security
  const suspiciousPatterns = /\.(exe|bat|cmd|scr|com|pif|vbs|js|jar|php)$/i;
  if (suspiciousPatterns.test(file.name)) {
    return {
      elementId: element.id,
      field: 'file',
      message: 'File type is not allowed for security reasons',
      code: 'security_risk',
      type: 'file',
    };
  }

  return null;
}

// ============================================================================
// Utility Functions
// ============================================================================

function getErrorType(zodCode: string): ValidationError['type'] {
  switch (zodCode) {
    case 'too_small':
    case 'too_big':
      return 'length';
    case 'invalid_string':
    case 'invalid_type':
      return 'format';
    case 'custom':
      return 'custom';
    default:
      return 'format';
  }
}

/**
 * Formats validation errors for display
 */
export function formatValidationErrors(errors: ValidationError[]): Record<string, string> {
  const formatted: Record<string, string> = {};

  errors.forEach((error) => {
    formatted[error.elementId] = error.message;
  });

  return formatted;
}

/**
 * Gets accessible error message for screen readers
 */
export function getAccessibleErrorMessage(error: ValidationError): string {
  return `Error in ${error.field}: ${error.message}`;
}

// ============================================================================
// Conditional Logic Validation
// ============================================================================

/**
 * Validates conditional logic rules
 */
export function validateConditionalLogic(
  data: SubmissionData,
  elements: FormElement[],
): ValidationError[] {
  const errors: ValidationError[] = [];

  elements.forEach((element) => {
    if (!element.conditionalLogic) return;

    const { show: _show, conditions } = element.conditionalLogic;
    let shouldShow = true;

    // Evaluate conditions
    conditions.forEach((condition) => {
      const fieldValue = data[condition.field];
      const conditionMet = evaluateCondition(fieldValue, condition.operator, condition.value);

      if (element.conditionalLogic?.logicType === 'all') {
        shouldShow = shouldShow && conditionMet;
      } else {
        shouldShow = shouldShow || conditionMet;
      }
    });

    // If element should be hidden but has a value, that's an error
    if (
      !shouldShow &&
      data[element.id] !== undefined &&
      data[element.id] !== null &&
      data[element.id] !== ''
    ) {
      errors.push({
        elementId: element.id,
        field: element.id,
        message: 'This field should not have a value based on your other responses',
        code: 'conditional_logic',
        type: 'custom',
      });
    }

    // If element should be shown and is required but missing, add error
    if (
      shouldShow &&
      element.validation?.required &&
      (!data[element.id] || data[element.id] === '')
    ) {
      errors.push({
        elementId: element.id,
        field: element.id,
        message: `${element.label} is required`,
        code: 'required',
        type: 'required',
      });
    }
  });

  return errors;
}

function evaluateCondition(value: unknown, operator: string, expectedValue: unknown): boolean {
  switch (operator) {
    case 'equals':
      return value === expectedValue;
    case 'not_equals':
      return value !== expectedValue;
    case 'contains':
      return String(value).toLowerCase().includes(String(expectedValue).toLowerCase());
    case 'not_contains':
      return !String(value).toLowerCase().includes(String(expectedValue).toLowerCase());
    case 'greater_than':
      return Number(value) > Number(expectedValue);
    case 'less_than':
      return Number(value) < Number(expectedValue);
    case 'is_empty':
      return !value || value === '' || (Array.isArray(value) && value.length === 0);
    case 'is_not_empty':
      return !!value && value !== '' && (!Array.isArray(value) || value.length > 0);
    default:
      return false;
  }
}
