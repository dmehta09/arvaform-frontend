import { ReactNode } from 'react';
import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { FormElementType } from './form-builder.types';

/**
 * Base props that all form elements share
 * Provides common functionality for form integration
 */
export interface BaseElementProps<T extends FieldValues = FieldValues> {
  /** Unique identifier for the form element */
  id: string;
  /** Form element type */
  type: FormElementType;
  /** Display label for the element */
  label: string;
  /** Optional placeholder text */
  placeholder?: string;
  /** Helper text displayed below the element */
  helperText?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** CSS class names for custom styling */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** React Hook Form integration */
  form?: UseFormReturn<T>;
  /** Field name for form registration */
  name?: Path<T>;
  /** Error message to display */
  error?: string;
  /** Whether to show field in builder vs preview mode */
  mode?: 'builder' | 'preview' | 'live';
  /** Accessibility attributes */
  'aria-label'?: string;
  'aria-describedby'?: string;
  /** Event handlers */
  onChange?: (value: unknown) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  /** Test ID for testing */
  'data-testid'?: string;
}

/**
 * Text input specific props
 */
export interface TextInputProps<T extends FieldValues = FieldValues> extends BaseElementProps<T> {
  type: 'text';
  /** Input value (controlled) */
  value?: string;
  /** Minimum character length */
  minLength?: number;
  /** Maximum character length */
  maxLength?: number;
  /** Regex pattern for validation */
  pattern?: string;
  /** Input type for different text variations */
  inputType?: 'text' | 'password' | 'search' | 'url';
  /** Whether to show character count */
  showCharacterCount?: boolean;
  /** Auto-complete behavior */
  autoComplete?: string;
  /** Auto-focus on mount */
  autoFocus?: boolean;
}

/**
 * Email input specific props
 */
export interface EmailInputProps<T extends FieldValues = FieldValues> extends BaseElementProps<T> {
  type: 'email';
  /** Input value (controlled) */
  value?: string;
  /** Allowed email domains */
  allowedDomains?: string[];
  /** Blocked email domains */
  blockedDomains?: string[];
  /** Whether to validate email format on blur */
  validateOnBlur?: boolean;
  /** Auto-complete behavior */
  autoComplete?: string;
}

/**
 * Phone input specific props
 */
export interface PhoneInputProps<T extends FieldValues = FieldValues> extends BaseElementProps<T> {
  type: 'phone';
  /** Default country code */
  countryCode?: string;
  /** Phone number format */
  format?: 'international' | 'national' | 'e164';
  /** Allowed countries for input */
  allowedCountries?: string[];
  /** Whether to show country selector */
  showCountrySelector?: boolean;
  /** Auto-format as user types */
  autoFormat?: boolean;
}

/**
 * Number input specific props
 */
export interface NumberInputProps<T extends FieldValues = FieldValues> extends BaseElementProps<T> {
  type: 'number';
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step increment */
  step?: number;
  /** Decimal precision */
  precision?: number;
  /** Whether to allow decimal values */
  allowDecimals?: boolean;
  /** Whether to show increment/decrement buttons */
  showSpinButtons?: boolean;
  /** Thousand separator */
  thousandSeparator?: string;
  /** Decimal separator */
  decimalSeparator?: string;
}

/**
 * Date input specific props
 */
export interface DateInputProps<T extends FieldValues = FieldValues> extends BaseElementProps<T> {
  type: 'date';
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Date format to display */
  format?: 'date' | 'datetime' | 'time';
  /** Disabled dates */
  disabledDates?: Date[];
  /** Whether past dates are allowed */
  allowPastDates?: boolean;
  /** Whether future dates are allowed */
  allowFutureDates?: boolean;
  /** Whether to show today button */
  showToday?: boolean;
  /** Whether to show clear button */
  showClear?: boolean;
}

/**
 * Textarea specific props
 */
export interface TextareaProps<T extends FieldValues = FieldValues> extends BaseElementProps<T> {
  type: 'textarea';
  /** Input value (controlled) */
  value?: string;
  /** Number of visible rows */
  rows?: number;
  /** Maximum number of rows */
  maxRows?: number;
  /** Resize behavior */
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  /** Minimum character length */
  minLength?: number;
  /** Maximum character length */
  maxLength?: number;
  /** Whether to show word count */
  wordCountDisplay?: boolean;
  /** Auto-resize to content */
  autoResize?: boolean;
}

/**
 * Option definition for dropdown and radio elements
 */
export interface OptionDefinition {
  /** Option value */
  value: string;
  /** Display label */
  label: string;
  /** Whether option is disabled */
  disabled?: boolean;
  /** Optional group name */
  group?: string;
  /** Optional description */
  description?: string;
  /** Optional icon */
  icon?: ReactNode;
}

/**
 * Dropdown/Select specific props
 */
export interface DropdownProps<T extends FieldValues = FieldValues> extends BaseElementProps<T> {
  type: 'dropdown';
  /** Available options */
  options: OptionDefinition[];
  /** Whether multiple selection is allowed */
  multiple?: boolean;
  /** Whether the dropdown is searchable */
  searchable?: boolean;
  /** Whether to show clear button */
  clearable?: boolean;
  /** Maximum number of selections (for multiple) */
  maxSelections?: number;
  /** Placeholder for search input */
  searchPlaceholder?: string;
  /** Whether to create new options */
  creatable?: boolean;
  /** Loading state */
  loading?: boolean;
  /** No options message */
  noOptionsMessage?: string;
}

/**
 * Radio group specific props
 */
export interface RadioGroupProps<T extends FieldValues = FieldValues> extends BaseElementProps<T> {
  type: 'radio';
  /** Available options */
  options: OptionDefinition[];
  /** Layout orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Number of columns for grid layout */
  columns?: number;
  /** Whether to show descriptions */
  showDescriptions?: boolean;
}

/**
 * Checkbox specific props
 */
export interface CheckboxProps<T extends FieldValues = FieldValues> extends BaseElementProps<T> {
  type: 'checkbox';
  /** Controlled value of the checkbox or checkbox group */
  value?: boolean | string[];
  /** Whether this is a checkbox group */
  isGroup?: boolean;
  /** Available options (for group) */
  options?: OptionDefinition[];
  /** Minimum selections required (for group) */
  minSelections?: number;
  /** Maximum selections allowed (for group) */
  maxSelections?: number;
  /** Layout orientation (for group) */
  orientation?: 'horizontal' | 'vertical';
  /** Number of columns for grid layout (for group) */
  columns?: number;
  /** Whether to show descriptions (for group) */
  showDescriptions?: boolean;
  /** Indeterminate state (for single checkbox) */
  indeterminate?: boolean;
}

/**
 * Union type for all form element props
 */
export type FormElementProps<T extends FieldValues = FieldValues> =
  | TextInputProps<T>
  | EmailInputProps<T>
  | PhoneInputProps<T>
  | NumberInputProps<T>
  | DateInputProps<T>
  | TextareaProps<T>
  | DropdownProps<T>
  | RadioGroupProps<T>
  | CheckboxProps<T>;

/**
 * Form element component props with render customization
 */
export type FormElementComponentProps<T extends FieldValues = FieldValues> = FormElementProps<T> & {
  /** Custom render function for the element */
  render?: (props: FormElementProps<T>) => ReactNode;
  /** Custom wrapper component */
  wrapper?: React.ComponentType<{ children: ReactNode }>;
  /** Custom label component */
  labelComponent?: React.ComponentType<{ children: ReactNode; required?: boolean }>;
  /** Custom error component */
  errorComponent?: React.ComponentType<{ children: ReactNode }>;
  /** Custom helper text component */
  helperComponent?: React.ComponentType<{ children: ReactNode }>;
};

/**
 * Form element validation state
 */
export interface ElementValidationState {
  /** Whether the field is valid */
  isValid: boolean;
  /** Whether the field has been touched */
  isTouched: boolean;
  /** Whether the field is dirty (value changed) */
  isDirty: boolean;
  /** Current error message */
  error?: string;
  /** Validation warnings */
  warnings?: string[];
}

/**
 * Form element configuration for the builder
 */
export interface ElementConfiguration {
  /** Element type */
  type: FormElementType;
  /** Configuration properties */
  properties: Partial<FormElementProps>;
  /** Validation rules */
  validation: Record<string, unknown>;
  /** Styling configuration */
  styling: Record<string, unknown>;
  /** Conditional logic */
  conditions?: Array<{
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
    value: unknown;
    action: 'show' | 'hide' | 'require' | 'disable';
  }>;
}
