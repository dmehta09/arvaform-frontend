/**
 * Property Schemas - 2025 Edition
 * Defines property configurations for all form element types
 * Following modern form builder patterns and best practices
 */

import {
  ElementPropertySchema,
  PropertyConfig,
  PropertySection,
} from '@/types/element-properties.types';
import { FormElementType } from '@/types/form-builder.types';
import { z } from 'zod';

/**
 * Common properties shared across all elements
 */
const commonProperties: Record<string, PropertyConfig> = {
  label: {
    type: 'text',
    label: 'Label',
    description: 'The text label displayed for this element',
    required: true,
    defaultValue: '',
    placeholder: 'Enter label...',
    section: 'general',
  },
  placeholder: {
    type: 'text',
    label: 'Placeholder',
    description: 'Hint text shown when the field is empty',
    required: false,
    defaultValue: '',
    placeholder: 'Enter placeholder...',
    section: 'general',
  },
  helperText: {
    type: 'textarea',
    label: 'Helper Text',
    description: 'Additional information to help users understand this field',
    required: false,
    defaultValue: '',
    placeholder: 'Enter helper text...',
    rows: 2,
    section: 'general',
  },
  required: {
    type: 'boolean',
    label: 'Required',
    description: 'Mark this field as required for form submission',
    defaultValue: false,
    section: 'validation',
  },
  disabled: {
    type: 'boolean',
    label: 'Disabled',
    description: 'Prevent user interaction with this field',
    defaultValue: false,
    section: 'general',
  },
  width: {
    type: 'select',
    label: 'Width',
    description: 'Set the width of this element',
    defaultValue: 'full',
    options: [
      { value: 'auto', label: 'Auto' },
      { value: 'quarter', label: '25%' },
      { value: 'half', label: '50%' },
      { value: 'three-quarters', label: '75%' },
      { value: 'full', label: '100%' },
      { value: 'custom', label: 'Custom' },
    ],
    section: 'styling',
  },
  customWidth: {
    type: 'text',
    label: 'Custom Width',
    description: 'Custom width value (e.g., 300px, 20rem)',
    required: false,
    defaultValue: '',
    placeholder: 'e.g., 300px, 20rem',
    section: 'styling',
  },
};

/**
 * Validation properties for input elements
 */
const validationProperties: Record<string, PropertyConfig> = {
  minLength: {
    type: 'number',
    label: 'Minimum Length',
    description: 'Minimum number of characters required',
    min: 0,
    defaultValue: 0,
    section: 'validation',
  },
  maxLength: {
    type: 'number',
    label: 'Maximum Length',
    description: 'Maximum number of characters allowed',
    min: 1,
    defaultValue: 255,
    section: 'validation',
  },
  pattern: {
    type: 'text',
    label: 'Pattern (Regex)',
    description: 'Regular expression pattern for validation',
    required: false,
    defaultValue: '',
    placeholder: 'e.g., ^[a-zA-Z0-9]+$',
    section: 'validation',
  },
  customValidationMessage: {
    type: 'text',
    label: 'Custom Error Message',
    description: 'Custom message to show when validation fails',
    required: false,
    defaultValue: '',
    placeholder: 'Enter custom error message...',
    section: 'validation',
  },
};

/**
 * Styling properties for visual customization
 */
const stylingProperties: Record<string, PropertyConfig> = {
  backgroundColor: {
    type: 'color',
    label: 'Background Color',
    description: 'Background color of the element',
    format: 'hex',
    defaultValue: '#ffffff',
    presets: ['#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6'],
    section: 'styling',
  },
  textColor: {
    type: 'color',
    label: 'Text Color',
    description: 'Color of the text content',
    format: 'hex',
    defaultValue: '#212529',
    presets: ['#212529', '#495057', '#6c757d', '#868e96'],
    section: 'styling',
  },
  borderColor: {
    type: 'color',
    label: 'Border Color',
    description: 'Color of the element border',
    format: 'hex',
    defaultValue: '#ced4da',
    presets: ['#ced4da', '#adb5bd', '#6c757d', '#495057'],
    section: 'styling',
  },
  borderWidth: {
    type: 'range',
    label: 'Border Width',
    description: 'Width of the element border',
    min: 0,
    max: 10,
    step: 1,
    unit: 'px',
    defaultValue: 1,
    section: 'styling',
  },
  borderRadius: {
    type: 'range',
    label: 'Border Radius',
    description: 'Rounded corners of the element',
    min: 0,
    max: 50,
    step: 1,
    unit: 'px',
    defaultValue: 4,
    section: 'styling',
  },
  fontSize: {
    type: 'select',
    label: 'Font Size',
    description: 'Size of the text',
    defaultValue: 'base',
    options: [
      { value: 'xs', label: 'Extra Small (12px)' },
      { value: 'sm', label: 'Small (14px)' },
      { value: 'base', label: 'Base (16px)' },
      { value: 'lg', label: 'Large (18px)' },
      { value: 'xl', label: 'Extra Large (20px)' },
      { value: '2xl', label: '2X Large (24px)' },
    ],
    section: 'styling',
  },
  fontWeight: {
    type: 'select',
    label: 'Font Weight',
    description: 'Weight/thickness of the text',
    defaultValue: 'normal',
    options: [
      { value: 'light', label: 'Light (300)' },
      { value: 'normal', label: 'Normal (400)' },
      { value: 'medium', label: 'Medium (500)' },
      { value: 'semibold', label: 'Semi Bold (600)' },
      { value: 'bold', label: 'Bold (700)' },
    ],
    section: 'styling',
  },
  padding: {
    type: 'select',
    label: 'Padding',
    description: 'Inner spacing of the element',
    defaultValue: 'md',
    options: [
      { value: 'none', label: 'None (0px)' },
      { value: 'sm', label: 'Small (8px)' },
      { value: 'md', label: 'Medium (12px)' },
      { value: 'lg', label: 'Large (16px)' },
      { value: 'xl', label: 'Extra Large (20px)' },
    ],
    section: 'styling',
  },
  margin: {
    type: 'select',
    label: 'Margin',
    description: 'Outer spacing around the element',
    defaultValue: 'md',
    options: [
      { value: 'none', label: 'None (0px)' },
      { value: 'sm', label: 'Small (8px)' },
      { value: 'md', label: 'Medium (12px)' },
      { value: 'lg', label: 'Large (16px)' },
      { value: 'xl', label: 'Extra Large (20px)' },
    ],
    section: 'styling',
  },
};

/**
 * Common sections used across elements
 */
const commonSections: PropertySection[] = [
  {
    id: 'general',
    title: 'General',
    description: 'Basic element configuration',
    icon: 'Settings',
    collapsed: false,
    properties: ['label', 'placeholder', 'helperText', 'disabled', 'width', 'customWidth'],
  },
  {
    id: 'validation',
    title: 'Validation',
    description: 'Input validation rules',
    icon: 'Shield',
    collapsed: false,
    properties: ['required', 'minLength', 'maxLength', 'pattern', 'customValidationMessage'],
  },
  {
    id: 'styling',
    title: 'Styling',
    description: 'Visual appearance customization',
    icon: 'Palette',
    collapsed: true,
    properties: [
      'backgroundColor',
      'textColor',
      'borderColor',
      'borderWidth',
      'borderRadius',
      'fontSize',
      'fontWeight',
      'padding',
      'margin',
    ],
  },
  {
    id: 'logic',
    title: 'Conditional Logic',
    description: 'Show/hide based on other fields',
    icon: 'GitBranch',
    collapsed: true,
    properties: [],
  },
];

/**
 * Base validation schema for common properties
 */
const baseValidationSchema = z.object({
  label: z.string().min(1, 'Label is required').max(100, 'Label must be under 100 characters'),
  placeholder: z.string().max(200, 'Placeholder must be under 200 characters').optional(),
  helperText: z.string().max(500, 'Helper text must be under 500 characters').optional(),
  required: z.boolean().optional(),
  disabled: z.boolean().optional(),
  width: z.enum(['auto', 'quarter', 'half', 'three-quarters', 'full', 'custom']).optional(),
  customWidth: z.string().optional(),
});

/**
 * Text Input Element Schema
 */
export const textInputSchema: ElementPropertySchema = {
  elementType: 'text',
  properties: {
    ...commonProperties,
    ...validationProperties,
    ...stylingProperties,
  },
  sections: commonSections,
  validation: baseValidationSchema.extend({
    minLength: z.number().min(0).optional(),
    maxLength: z.number().min(1).optional(),
    pattern: z.string().optional(),
  }),
};

/**
 * Email Input Element Schema
 */
export const emailInputSchema: ElementPropertySchema = {
  elementType: 'email',
  properties: {
    ...commonProperties,
    ...validationProperties,
    ...stylingProperties,
    allowMultiple: {
      type: 'boolean',
      label: 'Allow Multiple Emails',
      description: 'Allow users to enter multiple email addresses',
      defaultValue: false,
      section: 'validation',
    },
    emailSeparator: {
      type: 'select',
      label: 'Email Separator',
      description: 'Character used to separate multiple emails',
      defaultValue: ',',
      options: [
        { value: ',', label: 'Comma (,)' },
        { value: ';', label: 'Semicolon (;)' },
        { value: ' ', label: 'Space' },
      ],
      section: 'validation',
    },
  },
  sections: [
    ...commonSections.map((section) =>
      section.id === 'validation'
        ? { ...section, properties: [...section.properties, 'allowMultiple', 'emailSeparator'] }
        : section,
    ),
  ],
  validation: baseValidationSchema.extend({
    allowMultiple: z.boolean().optional(),
    emailSeparator: z.enum([',', ';', ' ']).optional(),
  }),
};

/**
 * Textarea Element Schema
 */
export const textareaSchema: ElementPropertySchema = {
  elementType: 'textarea',
  properties: {
    ...commonProperties,
    ...validationProperties,
    ...stylingProperties,
    rows: {
      type: 'number',
      label: 'Rows',
      description: 'Number of visible text rows',
      min: 1,
      max: 20,
      defaultValue: 3,
      section: 'general',
    },
    cols: {
      type: 'number',
      label: 'Columns',
      description: 'Number of visible text columns',
      min: 10,
      max: 200,
      defaultValue: 50,
      section: 'general',
    },
    resize: {
      type: 'select',
      label: 'Resize',
      description: 'Allow users to resize the textarea',
      defaultValue: 'vertical',
      options: [
        { value: 'none', label: 'None' },
        { value: 'both', label: 'Both' },
        { value: 'horizontal', label: 'Horizontal' },
        { value: 'vertical', label: 'Vertical' },
      ],
      section: 'general',
    },
  },
  sections: [
    ...commonSections.map((section) =>
      section.id === 'general'
        ? { ...section, properties: [...section.properties, 'rows', 'cols', 'resize'] }
        : section,
    ),
  ],
  validation: baseValidationSchema.extend({
    rows: z.number().min(1).max(20).optional(),
    cols: z.number().min(10).max(200).optional(),
    resize: z.enum(['none', 'both', 'horizontal', 'vertical']).optional(),
  }),
};

/**
 * Checkbox Element Schema
 */
export const checkboxSchema: ElementPropertySchema = {
  elementType: 'checkbox',
  properties: {
    ...commonProperties,
    ...stylingProperties,
    checked: {
      type: 'boolean',
      label: 'Default Checked',
      description: 'Whether the checkbox is checked by default',
      defaultValue: false,
      section: 'general',
    },
    value: {
      type: 'text',
      label: 'Value',
      description: 'Value sent when checkbox is checked',
      defaultValue: 'true',
      section: 'general',
    },
    checkboxPosition: {
      type: 'select',
      label: 'Checkbox Position',
      description: 'Position of checkbox relative to label',
      defaultValue: 'left',
      options: [
        { value: 'left', label: 'Left of label' },
        { value: 'right', label: 'Right of label' },
      ],
      section: 'styling',
    },
  },
  sections: [
    {
      id: 'general',
      title: 'General',
      description: 'Basic checkbox configuration',
      icon: 'Settings',
      collapsed: false,
      properties: ['label', 'helperText', 'disabled', 'checked', 'value'],
    },
    {
      id: 'validation',
      title: 'Validation',
      description: 'Checkbox validation rules',
      icon: 'Shield',
      collapsed: false,
      properties: ['required'],
    },
    {
      id: 'styling',
      title: 'Styling',
      description: 'Visual appearance customization',
      icon: 'Palette',
      collapsed: true,
      properties: [
        ...(stylingProperties.backgroundColor ? Object.keys(stylingProperties) : []),
        'checkboxPosition',
      ],
    },
    {
      id: 'logic',
      title: 'Conditional Logic',
      description: 'Show/hide based on other fields',
      icon: 'GitBranch',
      collapsed: true,
      properties: [],
    },
  ],
  validation: baseValidationSchema.extend({
    checked: z.boolean().optional(),
    value: z.string().optional(),
    checkboxPosition: z.enum(['left', 'right']).optional(),
  }),
};

/**
 * Number Input Element Schema
 */
export const numberInputSchema: ElementPropertySchema = {
  elementType: 'number',
  properties: {
    ...commonProperties,
    ...stylingProperties,
    min: {
      type: 'number',
      label: 'Minimum Value',
      description: 'Minimum allowed value',
      defaultValue: 0,
      section: 'validation',
    },
    max: {
      type: 'number',
      label: 'Maximum Value',
      description: 'Maximum allowed value',
      defaultValue: 100,
      section: 'validation',
    },
    step: {
      type: 'number',
      label: 'Step',
      description: 'Increment/decrement step value',
      defaultValue: 1,
      min: 0.01,
      section: 'validation',
    },
    allowDecimals: {
      type: 'boolean',
      label: 'Allow Decimals',
      description: 'Allow decimal numbers',
      defaultValue: true,
      section: 'validation',
    },
    decimalPlaces: {
      type: 'number',
      label: 'Decimal Places',
      description: 'Number of decimal places allowed',
      min: 0,
      max: 10,
      defaultValue: 2,
      section: 'validation',
    },
  },
  sections: [
    ...commonSections.map((section) =>
      section.id === 'validation'
        ? {
            ...section,
            properties: [
              ...section.properties,
              'min',
              'max',
              'step',
              'allowDecimals',
              'decimalPlaces',
            ],
          }
        : section,
    ),
  ],
  validation: baseValidationSchema.extend({
    min: z.number().optional(),
    max: z.number().optional(),
    step: z.number().min(0.01).optional(),
    allowDecimals: z.boolean().optional(),
    decimalPlaces: z.number().min(0).max(10).optional(),
  }),
};

/**
 * Registry of all element schemas
 */
export const elementSchemas: Record<FormElementType, ElementPropertySchema> = {
  text: textInputSchema,
  email: emailInputSchema,
  textarea: textareaSchema,
  checkbox: checkboxSchema,
  number: numberInputSchema,
  // Placeholder schemas for other element types
  phone: textInputSchema, // Will extend with phone-specific properties
  date: textInputSchema, // Will extend with date-specific properties
  dropdown: textInputSchema, // Will extend with dropdown-specific properties
  radio: textInputSchema, // Will extend with radio-specific properties
  section: textInputSchema, // Will extend with section-specific properties
  heading: textInputSchema, // Will extend with heading-specific properties
  divider: textInputSchema, // Will extend with divider-specific properties
};

/**
 * Get property schema for an element type
 */
export function getElementPropertySchema(elementType: FormElementType): ElementPropertySchema {
  return elementSchemas[elementType] || textInputSchema;
}

/**
 * Get property configuration for a specific property
 */
export function getPropertyConfig(
  elementType: FormElementType,
  propertyName: string,
): PropertyConfig | undefined {
  const schema = getElementPropertySchema(elementType);
  return schema.properties[propertyName];
}

/**
 * Get all properties for a specific section
 */
export function getSectionProperties(
  elementType: FormElementType,
  sectionId: string,
): Record<string, PropertyConfig> {
  const schema = getElementPropertySchema(elementType);
  const section = schema.sections.find((s) => s.id === sectionId);

  if (!section) return {};

  const properties: Record<string, PropertyConfig> = {};
  section.properties.forEach((propertyName) => {
    const config = schema.properties[propertyName];
    if (config) {
      properties[propertyName] = config;
    }
  });

  return properties;
}

/**
 * Base element properties schema
 */
export const baseElementPropertiesSchema = z.object({
  id: z.string().min(1, 'Element ID is required'),
  label: z.string().min(1, 'Label is required'),
  placeholder: z.string().optional(),
  required: z.boolean().default(false),
  disabled: z.boolean().default(false),
  description: z.string().optional(),
  className: z.string().optional(),
});

/**
 * Validation rule schema
 */
export const validationRuleSchema = z.object({
  id: z.string(),
  type: z.enum([
    'required',
    'minLength',
    'maxLength',
    'pattern',
    'email',
    'url',
    'number',
    'min',
    'max',
    'custom',
  ] as const),
  value: z.union([z.string(), z.number()]).optional(),
  message: z.string().optional(),
  enabled: z.boolean().default(true),
});

/**
 * Element styling schema with comprehensive validation
 */
export const elementStylingSchema = z.object({
  // Layout & Spacing
  width: z.string().optional(),
  height: z.string().optional(),
  margin: z
    .object({
      top: z.string().optional(),
      right: z.string().optional(),
      bottom: z.string().optional(),
      left: z.string().optional(),
    })
    .optional(),
  padding: z
    .object({
      top: z.string().optional(),
      right: z.string().optional(),
      bottom: z.string().optional(),
      left: z.string().optional(),
    })
    .optional(),

  // Typography
  fontSize: z.string().optional(),
  fontWeight: z.string().optional(),
  fontFamily: z.string().optional(),
  textAlign: z.enum(['left', 'center', 'right', 'justify']).optional(),

  // Colors - validate hex colors
  backgroundColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color')
    .optional(),
  textColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color')
    .optional(),
  borderColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color')
    .optional(),
  focusColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color')
    .optional(),

  // Borders & Radius
  borderWidth: z.string().optional(),
  borderStyle: z.enum(['solid', 'dashed', 'dotted', 'none']).optional(),
  borderRadius: z.string().optional(),

  // Effects
  boxShadow: z.string().optional(),
  opacity: z.number().min(0).max(1).optional(),
});

/**
 * Conditional logic schema
 */
export const conditionalLogicSchema = z.object({
  showIf: z.string().optional(),
  hideIf: z.string().optional(),
  requiredIf: z.string().optional(),
});

/**
 * Complete element properties schema
 */
export const elementPropertiesSchema = baseElementPropertiesSchema.extend({
  elementType: z.string().min(1, 'Element type is required'),
  validation: z.array(validationRuleSchema).default([]),
  styling: elementStylingSchema.default({}),
  conditional: conditionalLogicSchema.optional(),
  customAttributes: z.record(z.unknown()).optional(),
});

/**
 * Property change event schema
 */
export const propertyChangeEventSchema = z.object({
  elementId: z.string().min(1),
  property: z.string().min(1),
  value: z.unknown(),
  tab: z.enum(['general', 'validation', 'styling', 'conditional']),
});

/**
 * Validation schemas for specific form field types
 */
export const textInputValidationSchema = z
  .object({
    minLength: z.number().min(0).optional(),
    maxLength: z.number().min(1).optional(),
    pattern: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.minLength !== undefined && data.maxLength !== undefined) {
        return data.minLength <= data.maxLength;
      }
      return true;
    },
    {
      message: 'Minimum length must be less than or equal to maximum length',
      path: ['minLength'],
    },
  );

export const numberInputValidationSchema = z
  .object({
    min: z.number().optional(),
    max: z.number().optional(),
    step: z.number().positive().optional(),
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

export const emailInputValidationSchema = z.object({
  allowMultiple: z.boolean().default(false),
  domains: z.array(z.string()).optional(),
});

export const selectValidationSchema = z.object({
  options: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
        disabled: z.boolean().default(false),
      }),
    )
    .min(1, 'At least one option is required'),
  multiple: z.boolean().default(false),
  maxSelections: z.number().positive().optional(),
});

/**
 * Styling validation schemas for different aspects
 */
export const spacingValidationSchema = z.object({
  top: z
    .string()
    .regex(/^\d+(px|rem|em|%|vh|vw|auto)$/, 'Invalid spacing value')
    .optional(),
  right: z
    .string()
    .regex(/^\d+(px|rem|em|%|vh|vw|auto)$/, 'Invalid spacing value')
    .optional(),
  bottom: z
    .string()
    .regex(/^\d+(px|rem|em|%|vh|vw|auto)$/, 'Invalid spacing value')
    .optional(),
  left: z
    .string()
    .regex(/^\d+(px|rem|em|%|vh|vw|auto)$/, 'Invalid spacing value')
    .optional(),
});

export const dimensionValidationSchema = z.object({
  width: z
    .string()
    .regex(
      /^\d+(px|rem|em|%|vh|vw|auto|min-content|max-content|fit-content)$/,
      'Invalid width value',
    )
    .optional(),
  height: z
    .string()
    .regex(
      /^\d+(px|rem|em|%|vh|vw|auto|min-content|max-content|fit-content)$/,
      'Invalid height value',
    )
    .optional(),
});

export const typographyValidationSchema = z.object({
  fontSize: z
    .string()
    .regex(/^\d+(px|rem|em|pt)$/, 'Invalid font size')
    .optional(),
  fontWeight: z
    .enum([
      '100',
      '200',
      '300',
      '400',
      '500',
      '600',
      '700',
      '800',
      '900',
      'normal',
      'bold',
      'lighter',
      'bolder',
    ])
    .optional(),
  fontFamily: z.string().optional(),
  lineHeight: z
    .string()
    .regex(/^\d+(\.\d+)?(px|rem|em|%)$/, 'Invalid line height')
    .optional(),
});

/**
 * Property template schema
 */
export const propertyTemplateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  icon: z.string().optional(),
  properties: elementPropertiesSchema.partial(),
  tags: z.array(z.string()).default([]),
  category: z.string().optional(),
});

/**
 * Property panel state schema
 */
export const propertyPanelStateSchema = z.object({
  selectedElementId: z.string().nullable(),
  activeTab: z.enum(['general', 'validation', 'styling', 'conditional']),
  isOpen: z.boolean().default(true),
  properties: z.record(elementPropertiesSchema),
});

/**
 * Custom validation function schema
 */
export const customValidationFunctionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Function name is required'),
  description: z.string().optional(),
  parameters: z
    .array(
      z.object({
        name: z.string().min(1),
        type: z.enum(['string', 'number', 'boolean', 'array', 'object']),
        required: z.boolean().default(false),
        description: z.string().optional(),
      }),
    )
    .default([]),
  returnType: z.enum(['boolean', 'string', 'object']),
  code: z.string().min(1, 'Function code is required'),
});

/**
 * Form builder validation context schema
 */
export const validationContextSchema = z.object({
  formElements: z.array(elementPropertiesSchema),
  globalSettings: z
    .object({
      theme: z.string().optional(),
      validationMode: z.enum(['onChange', 'onBlur', 'onSubmit']).default('onChange'),
      showErrorSummary: z.boolean().default(true),
    })
    .optional(),
});

/**
 * Helper function to validate element properties based on element type
 */
export function getElementValidationSchema(elementType: string) {
  const baseSchema = elementPropertiesSchema;

  switch (elementType) {
    case 'text-input':
      return baseSchema.extend({
        validation: z.array(
          validationRuleSchema.extend({
            type: z.enum(['required', 'minLength', 'maxLength', 'pattern']),
          }),
        ),
      });

    case 'number-input':
      return baseSchema.extend({
        validation: z.array(
          validationRuleSchema.extend({
            type: z.enum(['required', 'min', 'max', 'number']),
          }),
        ),
      });

    case 'email-input':
      return baseSchema.extend({
        validation: z.array(
          validationRuleSchema.extend({
            type: z.enum(['required', 'email']),
          }),
        ),
      });

    case 'select':
    case 'radio-group':
      return baseSchema.extend({
        validation: z.array(
          validationRuleSchema.extend({
            type: z.enum(['required']),
          }),
        ),
        options: z
          .array(
            z.object({
              value: z.string(),
              label: z.string(),
              disabled: z.boolean().default(false),
            }),
          )
          .min(1, 'At least one option is required'),
      });

    case 'checkbox':
      return baseSchema.extend({
        validation: z.array(
          validationRuleSchema.extend({
            type: z.enum(['required']),
          }),
        ),
        checkboxType: z.enum(['single', 'group']).default('single'),
      });

    default:
      return baseSchema;
  }
}

/**
 * Validation error formatting helper
 */
export function formatValidationErrors(error: z.ZodError) {
  return error.errors.reduce(
    (acc, err) => {
      const path = err.path.join('.');
      if (!acc[path]) {
        acc[path] = [];
      }
      acc[path].push(err.message);
      return acc;
    },
    {} as Record<string, string[]>,
  );
}

/**
 * Property value sanitization schemas
 */
export const sanitizePropertyValueSchema = z.object({
  type: z.enum(['string', 'number', 'boolean', 'array', 'object']),
  value: z.unknown(),
  allowEmpty: z.boolean().default(true),
  transform: z.function().args(z.unknown()).returns(z.unknown()).optional(),
});

/**
 * Property inheritance schema for nested elements
 */
export const propertyInheritanceSchema = z.object({
  parentElementId: z.string().optional(),
  inheritedProperties: z.array(z.string()).default([]),
  overriddenProperties: z.array(z.string()).default([]),
  allowOverride: z.boolean().default(true),
  cascadeChanges: z.boolean().default(false),
});
