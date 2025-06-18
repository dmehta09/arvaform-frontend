/**
 * Property Validation Utilities - 2025 Edition
 * Functions for validating and sanitizing element properties
 */

import type { ElementProperties } from '@/types/element-properties.types';
import {
  PropertyValidationResult,
  PropertyValidationWarning,
} from '@/types/element-properties.types';
import type { ValidationRule, ValidationRuleType } from '@/types/form-builder.types';
import {
  elementPropertiesSchema,
  formatValidationErrors,
  getElementValidationSchema,
} from './property-schemas';

/**
 * Sanitize a property value based on its expected type
 */
export function sanitizePropertyValue(value: unknown, type: string): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  switch (type) {
    case 'number':
    case 'range':
      if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
      }
      return typeof value === 'number' ? value : 0;
    case 'boolean':
      return !!value;
    case 'text':
    case 'textarea':
    case 'select':
    case 'color':
    default:
      return typeof value === 'string' ? value : String(value);
  }
}

/**
 * Check for unmet dependencies between properties
 */
export function checkPropertyDependencies(
  properties: Record<string, unknown>,
): PropertyValidationWarning[] {
  const warnings: PropertyValidationWarning[] = [];

  if (properties.width !== 'custom' && properties.customWidth) {
    warnings.push({
      property: 'customWidth',
      message: 'Custom width is set but width is not "Custom". This value will be ignored.',
      code: 'dependency_mismatch',
    });
  }

  if (properties.allowDecimals === false && properties.decimalPlaces) {
    warnings.push({
      property: 'decimalPlaces',
      message: 'Decimal places are set but decimals are not allowed. This value will be ignored.',
      code: 'dependency_mismatch',
    });
  }

  if (properties.allowMultiple === false && properties.emailSeparator) {
    warnings.push({
      property: 'emailSeparator',
      message: 'Email separator is set but multiple emails are not allowed.',
      code: 'dependency_mismatch',
    });
  }

  return warnings;
}

/**
 * Validates element properties with comprehensive error handling
 */
export function validateElementProperties(
  elementId: string,
  properties: Partial<ElementProperties>,
): PropertyValidationResult {
  try {
    // Get the appropriate validation schema based on element type
    const schema = properties.elementType
      ? getElementValidationSchema(properties.elementType)
      : elementPropertiesSchema;

    // Validate the properties
    const result = schema.safeParse(properties);

    if (result.success) {
      return {
        isValid: true,
        errors: {},
        warnings: {},
      };
    }

    // Format validation errors
    const errors = formatValidationErrors(result.error);

    return {
      isValid: false,
      errors,
      warnings: {},
    };
  } catch (error) {
    console.error('Error validating element properties:', error);
    return {
      isValid: false,
      errors: {
        general: ['Validation failed due to an unexpected error'],
      },
      warnings: {},
    };
  }
}

/**
 * Validates a single property value
 */
export function validateSingleProperty(
  elementType: string,
  propertyKey: string,
  value: unknown,
): { isValid: boolean; error?: string } {
  try {
    const schema = getElementValidationSchema(elementType);

    // Create a minimal object with just the property to validate
    const testObject = {
      id: 'test',
      elementType,
      label: 'Test',
      required: false,
      disabled: false,
      validation: [],
      styling: {},
      [propertyKey]: value,
    };

    const result = schema.safeParse(testObject);

    if (result.success) {
      return { isValid: true };
    }

    // Find the error for this specific property
    const propertyError = result.error.errors.find((err) => err.path.includes(propertyKey));

    return {
      isValid: false,
      error: propertyError?.message || 'Invalid value',
    };
  } catch (error) {
    console.error('Error validating single property:', error);
    return {
      isValid: false,
      error: 'Validation error occurred',
    };
  }
}

/**
 * Validates validation rules for an element
 */
export function validateValidationRules(
  elementType: string,
  rules: ValidationRule[],
): PropertyValidationResult {
  const errors: Record<string, string[]> = {};
  const warnings: Record<string, string[]> = {};

  // Check for duplicate rule types
  const ruleTypes = rules.map((rule) => rule.type);
  const duplicateTypes = ruleTypes.filter((type, index) => ruleTypes.indexOf(type) !== index);

  if (duplicateTypes.length > 0) {
    errors.validation = [`Duplicate validation rules: ${duplicateTypes.join(', ')}`];
  }

  // Validate each rule individually
  rules.forEach((rule, index) => {
    const ruleErrors = validateValidationRule(elementType, rule);
    if (ruleErrors.length > 0) {
      errors[`validation.${index}`] = ruleErrors;
    }
  });

  // Check for logical conflicts
  const conflicts = checkValidationRuleConflicts(rules);
  if (conflicts.length > 0) {
    warnings.validation = conflicts;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates a single validation rule
 */
function validateValidationRule(elementType: string, rule: ValidationRule): string[] {
  const errors: string[] = [];

  // Check if rule type is appropriate for element type
  const appropriateRules = getAppropriateValidationRules(elementType);
  if (!appropriateRules.includes(rule.type)) {
    errors.push(`${rule.type} validation is not applicable to ${elementType}`);
  }

  // Validate rule-specific requirements
  switch (rule.type) {
    case 'minLength':
    case 'maxLength':
      if (rule.value === undefined || typeof rule.value !== 'number' || rule.value < 0) {
        errors.push(`${rule.type} must be a positive number`);
      }
      break;

    case 'min':
    case 'max':
      if (rule.value === undefined || typeof rule.value !== 'number') {
        errors.push(`${rule.type} must be a number`);
      }
      break;

    case 'pattern':
      if (rule.value === undefined || typeof rule.value !== 'string') {
        errors.push('Pattern must be a valid regular expression string');
      } else {
        try {
          new RegExp(rule.value as string);
        } catch {
          errors.push('Pattern must be a valid regular expression');
        }
      }
      break;

    case 'custom':
      if (!rule.value || typeof rule.value !== 'string') {
        errors.push('Custom validation must include function code');
      }
      break;
  }

  return errors;
}

/**
 * Returns appropriate validation rule types for an element type
 */
function getAppropriateValidationRules(elementType: string): ValidationRuleType[] {
  const commonRules: ValidationRuleType[] = ['required'];

  switch (elementType) {
    case 'text-input':
    case 'textarea':
      return [...commonRules, 'minLength', 'maxLength', 'pattern', 'custom'];

    case 'email-input':
      return [...commonRules, 'email', 'pattern', 'custom'];

    case 'number-input':
      return [...commonRules, 'min', 'max', 'number', 'custom'];

    case 'url-input':
      return [...commonRules, 'url', 'pattern', 'custom'];

    case 'select':
    case 'radio-group':
    case 'checkbox':
      return [...commonRules, 'custom'];

    default:
      return [...commonRules, 'custom'];
  }
}

/**
 * Checks for logical conflicts between validation rules
 */
function checkValidationRuleConflicts(rules: ValidationRule[]): string[] {
  const warnings: string[] = [];

  // Find min/max length conflicts
  const minLength = rules.find((r) => r.type === 'minLength');
  const maxLength = rules.find((r) => r.type === 'maxLength');

  if (
    minLength &&
    maxLength &&
    typeof minLength.value === 'number' &&
    typeof maxLength.value === 'number' &&
    minLength.value > maxLength.value
  ) {
    warnings.push('Minimum length is greater than maximum length');
  }

  // Find min/max value conflicts
  const min = rules.find((r) => r.type === 'min');
  const max = rules.find((r) => r.type === 'max');

  if (
    min &&
    max &&
    typeof min.value === 'number' &&
    typeof max.value === 'number' &&
    min.value > max.value
  ) {
    warnings.push('Minimum value is greater than maximum value');
  }

  return warnings;
}

/**
 * Validates styling properties
 */
export function validateStylingProperties(
  styling: Record<string, unknown>,
): PropertyValidationResult {
  const errors: Record<string, string[]> = {};

  // Validate colors
  Object.entries(styling).forEach(([key, value]) => {
    if (key.includes('Color') && typeof value === 'string') {
      if (!isValidColor(value)) {
        errors[key] = ['Invalid color format. Use hex colors (e.g., #FF0000)'];
      }
    }
  });

  // Validate dimensions
  if (styling.width && !isValidDimension(styling.width as string)) {
    errors.width = ['Invalid width value. Use valid CSS units (px, rem, em, %, etc.)'];
  }

  if (styling.height && !isValidDimension(styling.height as string)) {
    errors.height = ['Invalid height value. Use valid CSS units (px, rem, em, %, etc.)'];
  }

  // Validate opacity
  if (styling.opacity !== undefined) {
    const opacity = Number(styling.opacity);
    if (isNaN(opacity) || opacity < 0 || opacity > 1) {
      errors.opacity = ['Opacity must be a number between 0 and 1'];
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings: {},
  };
}

/**
 * Validates if a string is a valid color
 */
function isValidColor(color: string): boolean {
  // Check hex color format
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (hexRegex.test(color)) return true;

  // Check CSS color names (basic validation)
  const cssColors = [
    'transparent',
    'black',
    'white',
    'red',
    'green',
    'blue',
    'yellow',
    'orange',
    'purple',
    'pink',
    'gray',
    'grey',
    'brown',
    'cyan',
    'magenta',
  ];
  if (cssColors.includes(color.toLowerCase())) return true;

  // Check rgb/rgba format
  const rgbRegex = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)$/;
  if (rgbRegex.test(color)) return true;

  // Check hsl/hsla format
  const hslRegex = /^hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([\d.]+))?\s*\)$/;
  if (hslRegex.test(color)) return true;

  return false;
}

/**
 * Validates if a string is a valid CSS dimension
 */
function isValidDimension(dimension: string): boolean {
  const dimensionRegex =
    /^\d+(\.\d+)?(px|rem|em|%|vh|vw|vmin|vmax|ch|ex|cm|mm|in|pt|pc|auto|min-content|max-content|fit-content)$/;
  return dimensionRegex.test(dimension) || dimension === 'auto';
}

/**
 * Validates conditional logic
 */
export function validateConditionalLogic(
  logic: Record<string, unknown>,
  availableElements: string[],
): PropertyValidationResult {
  const errors: Record<string, string[]> = {};

  // Validate show/hide conditions
  if (logic.showIf && typeof logic.showIf === 'string') {
    const validation = validateConditionExpression(logic.showIf, availableElements);
    if (!validation.isValid) {
      errors.showIf = [validation.error || 'Invalid condition expression'];
    }
  }

  if (logic.hideIf && typeof logic.hideIf === 'string') {
    const validation = validateConditionExpression(logic.hideIf, availableElements);
    if (!validation.isValid) {
      errors.hideIf = [validation.error || 'Invalid condition expression'];
    }
  }

  if (logic.requiredIf && typeof logic.requiredIf === 'string') {
    const validation = validateConditionExpression(logic.requiredIf, availableElements);
    if (!validation.isValid) {
      errors.requiredIf = [validation.error || 'Invalid condition expression'];
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings: {},
  };
}

/**
 * Validates a conditional logic expression
 */
function validateConditionExpression(
  expression: string,
  availableElements: string[],
): { isValid: boolean; error?: string } {
  try {
    // Basic validation - check for element references
    const elementRefs = expression.match(/\$\{([^}]+)\}/g) || [];

    for (const ref of elementRefs) {
      const elementId = ref.slice(2, -1); // Remove ${ and }
      if (!availableElements.includes(elementId)) {
        return {
          isValid: false,
          error: `Referenced element '${elementId}' does not exist`,
        };
      }
    }

    // Additional syntax validation could be added here
    return { isValid: true };
  } catch (error) {
    console.error('Error validating condition expression:', error);
    return {
      isValid: false,
      error: 'Invalid expression syntax',
    };
  }
}

/**
 * Real-time validation for property forms
 */
export function createRealTimeValidator(elementType: string) {
  return {
    validateField: (fieldName: string, value: unknown) => {
      return validateSingleProperty(elementType, fieldName, value);
    },

    validateAll: (properties: Partial<ElementProperties>) => {
      return validateElementProperties(properties.id || 'temp', properties);
    },

    getFieldConstraints: (fieldName: string) => {
      // Return validation constraints for a specific field
      const appropriateRules = getAppropriateValidationRules(elementType);
      return {
        required: true, // All properties are required by default
        validationRules: appropriateRules,
        elementSpecific: getElementSpecificConstraints(elementType, fieldName),
      };
    },
  };
}

/**
 * Returns element-specific constraints for a field
 */
function getElementSpecificConstraints(elementType: string, fieldName: string) {
  const constraints: Record<string, unknown> = {};

  if (elementType === 'text-input' && fieldName === 'maxLength') {
    constraints.min = 1;
    constraints.max = 10000;
  }

  if (elementType === 'number-input') {
    if (fieldName === 'min' || fieldName === 'max') {
      constraints.type = 'number';
    }
  }

  if (fieldName.includes('Color')) {
    constraints.format = 'color';
    constraints.pattern = '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$';
  }

  return constraints;
}

/**
 * Debounced validation for performance
 */
export function createDebouncedValidator(
  validator: (value: unknown) => { isValid: boolean; error?: string },
  delay = 300,
) {
  let timeoutId: NodeJS.Timeout;

  return (value: unknown) => {
    return new Promise<{ isValid: boolean; error?: string }>((resolve) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        resolve(validator(value));
      }, delay);
    });
  };
}
