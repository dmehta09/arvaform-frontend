import { z } from 'zod';

/**
 * Base validation schema for all form elements
 * Provides common validation rules that all elements can extend
 */
export const baseElementValidationSchema = z.object({
  required: z.boolean().optional().default(false),
  label: z.string().min(1, 'Label is required'),
  placeholder: z.string().optional(),
  helperText: z.string().optional(),
  disabled: z.boolean().optional().default(false),
});

/**
 * Text input validation schema
 * Supports length validation and pattern matching
 */
export const textInputValidationSchema = baseElementValidationSchema
  .extend({
    minLength: z.number().min(0).optional(),
    maxLength: z.number().min(1).optional(),
    pattern: z.string().optional(),
    customValidation: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.minLength && data.maxLength) {
        return data.minLength <= data.maxLength;
      }
      return true;
    },
    {
      message: 'Minimum length must be less than or equal to maximum length',
      path: ['minLength'],
    },
  );

/**
 * Email input validation schema
 * Enforces email format validation
 */
export const emailInputValidationSchema = baseElementValidationSchema.extend({
  allowedDomains: z.array(z.string()).optional(),
  blockedDomains: z.array(z.string()).optional(),
  customValidation: z.string().optional(),
});

/**
 * Phone input validation schema
 * Supports international phone number formats
 */
export const phoneInputValidationSchema = baseElementValidationSchema.extend({
  countryCode: z.string().optional().default('US'),
  format: z.enum(['international', 'national', 'e164']).optional().default('national'),
  allowedCountries: z.array(z.string()).optional(),
  customValidation: z.string().optional(),
});

/**
 * Number input validation schema
 * Supports numeric range and step validation
 */
export const numberInputValidationSchema = baseElementValidationSchema
  .extend({
    min: z.number().optional(),
    max: z.number().optional(),
    step: z.number().positive().optional().default(1),
    precision: z.number().min(0).max(10).optional(),
    allowDecimals: z.boolean().optional().default(true),
    customValidation: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.min !== undefined && data.max !== undefined) {
        return data.min <= data.max;
      }
      return true;
    },
    {
      message: 'Minimum value must be less than or equal to maximum value',
      path: ['min'],
    },
  );

/**
 * Date input validation schema
 * Supports date range validation and format options
 */
export const dateInputValidationSchema = baseElementValidationSchema
  .extend({
    minDate: z.date().optional(),
    maxDate: z.date().optional(),
    format: z.enum(['date', 'datetime', 'time']).optional().default('date'),
    disabledDates: z.array(z.date()).optional(),
    allowPastDates: z.boolean().optional().default(true),
    allowFutureDates: z.boolean().optional().default(true),
    customValidation: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.minDate && data.maxDate) {
        return data.minDate <= data.maxDate;
      }
      return true;
    },
    {
      message: 'Minimum date must be before or equal to maximum date',
      path: ['minDate'],
    },
  );

/**
 * Textarea validation schema
 * Extends text validation with rows and resize options
 */
export const textareaValidationSchema = baseElementValidationSchema
  .extend({
    minLength: z.number().min(0).optional(),
    maxLength: z.number().min(1).optional(),
    pattern: z.string().optional(),
    customValidation: z.string().optional(),
    rows: z.number().min(1).max(20).optional().default(3),
    maxRows: z.number().min(1).max(50).optional(),
    resize: z.enum(['none', 'vertical', 'horizontal', 'both']).optional().default('vertical'),
    wordCountDisplay: z.boolean().optional().default(false),
  })
  .refine(
    (data) => {
      if (data.minLength && data.maxLength) {
        return data.minLength <= data.maxLength;
      }
      return true;
    },
    {
      message: 'Minimum length must be less than or equal to maximum length',
      path: ['minLength'],
    },
  );

/**
 * Dropdown/Select validation schema
 * Supports single and multiple selection with custom options
 */
export const dropdownValidationSchema = baseElementValidationSchema
  .extend({
    options: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
          disabled: z.boolean().optional().default(false),
          group: z.string().optional(),
        }),
      )
      .min(1, 'At least one option is required'),
    multiple: z.boolean().optional().default(false),
    searchable: z.boolean().optional().default(false),
    clearable: z.boolean().optional().default(false),
    maxSelections: z.number().min(1).optional(),
    customValidation: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.multiple && data.maxSelections) {
        return data.maxSelections <= data.options.length;
      }
      return true;
    },
    {
      message: 'Maximum selections cannot exceed number of options',
      path: ['maxSelections'],
    },
  );

/**
 * Radio group validation schema
 * Supports grouped radio button options
 */
export const radioGroupValidationSchema = baseElementValidationSchema.extend({
  options: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
        disabled: z.boolean().optional().default(false),
        description: z.string().optional(),
      }),
    )
    .min(2, 'At least two options are required for radio group'),
  orientation: z.enum(['horizontal', 'vertical']).optional().default('vertical'),
  customValidation: z.string().optional(),
});

/**
 * Checkbox validation schema
 * Supports single checkbox and checkbox groups
 */
export const checkboxValidationSchema = baseElementValidationSchema
  .extend({
    isGroup: z.boolean().optional().default(false),
    options: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
          disabled: z.boolean().optional().default(false),
          description: z.string().optional(),
        }),
      )
      .optional(),
    minSelections: z.number().min(0).optional(),
    maxSelections: z.number().min(1).optional(),
    orientation: z.enum(['horizontal', 'vertical']).optional().default('vertical'),
    customValidation: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.isGroup && (!data.options || data.options.length === 0)) {
        return false;
      }
      if (!data.isGroup && data.options && data.options.length > 0) {
        return false;
      }
      return true;
    },
    {
      message: 'Group checkboxes require options, single checkboxes should not have options',
      path: ['options'],
    },
  )
  .refine(
    (data) => {
      if (data.minSelections !== undefined && data.maxSelections !== undefined) {
        return data.minSelections <= data.maxSelections;
      }
      return true;
    },
    {
      message: 'Minimum selections must be less than or equal to maximum selections',
      path: ['minSelections'],
    },
  );

/**
 * Form element validation factory
 * Returns the appropriate validation schema based on element type
 */
export function getElementValidationSchema(elementType: string) {
  switch (elementType) {
    case 'text':
      return textInputValidationSchema;
    case 'email':
      return emailInputValidationSchema;
    case 'phone':
      return phoneInputValidationSchema;
    case 'number':
      return numberInputValidationSchema;
    case 'date':
      return dateInputValidationSchema;
    case 'textarea':
      return textareaValidationSchema;
    case 'dropdown':
      return dropdownValidationSchema;
    case 'radio':
      return radioGroupValidationSchema;
    case 'checkbox':
      return checkboxValidationSchema;
    default:
      return baseElementValidationSchema;
  }
}

/**
 * Runtime value validation schemas
 * Used to validate actual form submission values
 */
export const elementValueValidators = {
  text: z.string(),
  email: z.string().email('Invalid email format'),
  phone: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format'),
  number: z.number(),
  date: z.date(),
  textarea: z.string(),
  dropdown: z.union([z.string(), z.array(z.string())]),
  radio: z.string(),
  checkbox: z.union([z.boolean(), z.array(z.string())]),
} as const;

/**
 * Type-safe validation function for form element values
 */
export function validateElementValue<T extends keyof typeof elementValueValidators>(
  elementType: T,
  value: unknown,
  required = false,
): { success: boolean; data?: unknown; error?: string } {
  try {
    const schema = required
      ? elementValueValidators[elementType]
      : elementValueValidators[elementType].optional();

    const result = schema.parse(value);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Validation failed' };
    }
    return { success: false, error: 'Unknown validation error' };
  }
}
