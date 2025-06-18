/**
 * Preview system utility functions
 * Helper functions for screenshot capture, URL generation, form validation, and more
 */

import { DeviceViewport } from '@/lib/preview/device-breakpoints';
import { FormElement } from '@/types/form-builder.types';

/**
 * Screenshot capture functionality using html2canvas
 * Note: html2canvas should be installed as a dependency
 */
export async function capturePreviewScreenshot(
  element: HTMLElement,
  options: {
    filename?: string;
    format?: 'png' | 'jpeg' | 'webp';
    quality?: number;
    scale?: number;
  } = {},
): Promise<string | null> {
  try {
    // Dynamic import to avoid bundling html2canvas if not needed
    const html2canvas = await import('html2canvas');

    const canvas = await html2canvas.default(element, {
      allowTaint: true,
      useCORS: true,
      scale: options.scale || 2, // Higher resolution for better quality
      backgroundColor: '#ffffff',
      logging: false,
      ...options,
    });

    // Convert to data URL
    const dataUrl = canvas.toDataURL(`image/${options.format || 'png'}`, options.quality || 0.9);

    // If filename provided, trigger download
    if (options.filename) {
      downloadDataUrl(dataUrl, options.filename);
    }

    return dataUrl;
  } catch (error) {
    console.error('Failed to capture screenshot:', error);
    return null;
  }
}

/**
 * Download data URL as file
 */
function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generate shareable preview URL with encoded form configuration
 */
export function generatePreviewShareUrl(
  formElements: FormElement[],
  viewport: DeviceViewport,
  theme: 'light' | 'dark' = 'light',
): string {
  try {
    const config = {
      elements: formElements,
      viewport: {
        name: viewport.name,
        width: viewport.width,
        height: viewport.height,
      },
      theme,
      timestamp: Date.now(),
    };

    const encoded = btoa(JSON.stringify(config));
    const baseUrl = window.location.origin;

    return `${baseUrl}/preview/share?config=${encoded}`;
  } catch (error) {
    console.error('Failed to generate share URL:', error);
    return window.location.href;
  }
}

/**
 * Parse shared preview URL configuration
 */
export function parsePreviewShareUrl(url: string): {
  elements: FormElement[];
  viewport: Partial<DeviceViewport>;
  theme: 'light' | 'dark';
} | null {
  try {
    const urlObj = new URL(url);
    const configParam = urlObj.searchParams.get('config');

    if (!configParam) return null;

    const config = JSON.parse(atob(configParam));
    return config;
  } catch (error) {
    console.error('Failed to parse share URL:', error);
    return null;
  }
}

/**
 * Validate form data against form elements
 */
export function validateFormData(
  formElements: FormElement[],
  formData: Record<string, unknown>,
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const element of formElements) {
    const value = formData[element.id];
    const elementErrors = validateElementValue(element, value);

    if (elementErrors.length > 0 && elementErrors[0]) {
      errors[element.id] = elementErrors[0]; // Show first error
    }
  }

  return errors;
}

/**
 * Validate individual element value against its validation rules
 */
export function validateElementValue(element: FormElement, value: unknown): string[] {
  const errors: string[] = [];

  // Check required validation
  if (
    element.required ||
    element.validation.some((rule) => rule.type === 'required' && rule.enabled)
  ) {
    if (value === undefined || value === null || value === '') {
      errors.push(`${element.label || 'This field'} is required`);
      return errors; // Return early for required field
    }
  }

  // Skip other validations if value is empty and not required
  if (value === undefined || value === null || value === '') {
    return errors;
  }

  const stringValue = String(value);

  // Check validation rules
  for (const rule of element.validation) {
    if (!rule.enabled) continue;

    switch (rule.type) {
      case 'minLength':
        if (typeof rule.value === 'number' && stringValue.length < rule.value) {
          errors.push(rule.message || `Must be at least ${rule.value} characters long`);
        }
        break;

      case 'maxLength':
        if (typeof rule.value === 'number' && stringValue.length > rule.value) {
          errors.push(rule.message || `Must be no more than ${rule.value} characters long`);
        }
        break;

      case 'pattern':
        if (typeof rule.value === 'string') {
          const regex = new RegExp(rule.value);
          if (!regex.test(stringValue)) {
            errors.push(rule.message || 'Invalid format');
          }
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(stringValue)) {
          errors.push(rule.message || 'Invalid email address');
        }
        break;

      case 'url':
        try {
          new URL(stringValue);
        } catch {
          errors.push(rule.message || 'Invalid URL');
        }
        break;

      case 'number':
        if (isNaN(Number(stringValue))) {
          errors.push(rule.message || 'Must be a valid number');
        }
        break;

      case 'min':
        if (typeof rule.value === 'number' && Number(stringValue) < rule.value) {
          errors.push(rule.message || `Must be at least ${rule.value}`);
        }
        break;

      case 'max':
        if (typeof rule.value === 'number' && Number(stringValue) > rule.value) {
          errors.push(rule.message || `Must be no more than ${rule.value}`);
        }
        break;
    }
  }

  return errors;
}

/**
 * Calculate estimated form completion time based on element types
 */
export function estimateFormCompletionTime(formElements: FormElement[]): number {
  const timeEstimates: Record<string, number> = {
    text: 10, // 10 seconds
    email: 8, // 8 seconds
    phone: 12, // 12 seconds
    number: 6, // 6 seconds
    date: 8, // 8 seconds
    textarea: 30, // 30 seconds
    dropdown: 5, // 5 seconds
    radio: 4, // 4 seconds
    checkbox: 3, // 3 seconds
  };

  const totalSeconds = formElements.reduce((total, element) => {
    return total + (timeEstimates[element.type] || 10);
  }, 0);

  return Math.ceil(totalSeconds / 60); // Return in minutes, rounded up
}

/**
 * Generate form analytics summary for preview
 */
export function generateFormAnalytics(
  formElements: FormElement[],
  formData: Record<string, unknown>,
): {
  totalFields: number;
  completedFields: number;
  completionRate: number;
  estimatedTime: number;
  fieldTypes: Record<string, number>;
  hasValidationErrors: boolean;
  errorCount: number;
} {
  const validationErrors = validateFormData(formElements, formData);
  const completedFields = Object.keys(formData).filter(
    (key) => formData[key] !== undefined && formData[key] !== '',
  ).length;

  const fieldTypes = formElements.reduce(
    (acc, element) => {
      acc[element.type] = (acc[element.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return {
    totalFields: formElements.length,
    completedFields,
    completionRate:
      formElements.length > 0 ? Math.round((completedFields / formElements.length) * 100) : 0,
    estimatedTime: estimateFormCompletionTime(formElements),
    fieldTypes,
    hasValidationErrors: Object.keys(validationErrors).length > 0,
    errorCount: Object.keys(validationErrors).length,
  };
}

/**
 * Get element accessibility attributes for preview
 */
export function getElementAccessibilityAttributes(element: FormElement): Record<string, string> {
  const attrs: Record<string, string> = {};

  // Basic accessibility attributes
  attrs['aria-label'] = element.label;

  if (element.placeholder) {
    attrs['placeholder'] = element.placeholder;
  }

  if (
    element.required ||
    element.validation.some((rule) => rule.type === 'required' && rule.enabled)
  ) {
    attrs['aria-required'] = 'true';
    attrs['required'] = 'true';
  }

  // Add element-specific attributes
  switch (element.type) {
    case 'email':
      attrs['type'] = 'email';
      attrs['autocomplete'] = 'email';
      break;

    case 'phone':
      attrs['type'] = 'tel';
      attrs['autocomplete'] = 'tel';
      break;

    case 'number':
      attrs['type'] = 'number';
      attrs['inputmode'] = 'numeric';
      break;

    case 'date':
      attrs['type'] = 'date';
      break;

    case 'textarea':
      attrs['role'] = 'textbox';
      attrs['aria-multiline'] = 'true';
      break;
  }

  return attrs;
}

/**
 * Format form data for export/sharing
 */
export function formatFormDataForExport(
  formElements: FormElement[],
  formData: Record<string, unknown>,
  format: 'json' | 'csv' | 'txt' = 'json',
): string {
  switch (format) {
    case 'json':
      return JSON.stringify(formData, null, 2);

    case 'csv': {
      const headers = formElements.map((el) => el.label);
      const values = formElements.map((el) => formData[el.id] || '');
      return [headers.join(','), values.join(',')].join('\n');
    }

    case 'txt': {
      return formElements
        .map((el) => `${el.label}: ${formData[el.id] || '(not filled)'}`)
        .join('\n');
    }

    default:
      return JSON.stringify(formData, null, 2);
  }
}

/**
 * Check if device supports touch interactions
 */
export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Get optimal viewport for current screen size
 */
export function getOptimalViewportForScreen(): {
  type: 'mobile' | 'tablet' | 'desktop';
  recommendedViewport: string;
} {
  const screenWidth = window.screen.width;

  if (screenWidth <= 768) {
    return { type: 'mobile', recommendedViewport: 'iphone14' };
  } else if (screenWidth <= 1024) {
    return { type: 'tablet', recommendedViewport: 'ipadAir' };
  } else {
    return { type: 'desktop', recommendedViewport: 'desktop1080' };
  }
}
