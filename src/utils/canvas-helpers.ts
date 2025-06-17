/**
 * Canvas helper utilities for form builder
 * Provides common utility functions for canvas operations, element management, and UI helpers
 */

import { CanvasSize, ElementPosition, FormElement } from '@/types/form-builder.types';
import { UniqueIdentifier } from '@dnd-kit/core';

/**
 * Default canvas configuration
 */
export const DEFAULT_CANVAS_CONFIG = {
  width: 800,
  height: 1200,
  gridSize: 20,
  zoom: 1,
  minZoom: 0.25,
  maxZoom: 2,
  elementSpacing: 20,
  margin: 20,
} as const;

/**
 * Default element dimensions
 */
export const DEFAULT_ELEMENT_DIMENSIONS = {
  width: 300,
  height: 80,
  minWidth: 100,
  minHeight: 40,
} as const;

/**
 * Generate a unique element ID
 */
export function generateElementId(prefix: string = 'element'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Calculate element bounds
 */
export function getElementBounds(element: FormElement): {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
} {
  const { x, y } = element.position;
  const width = DEFAULT_ELEMENT_DIMENSIONS.width;
  const height = DEFAULT_ELEMENT_DIMENSIONS.height;

  return {
    left: x,
    right: x + width,
    top: y,
    bottom: y + height,
    width,
    height,
  };
}

/**
 * Check if a point is within element bounds
 */
export function isPointInElement(point: { x: number; y: number }, element: FormElement): boolean {
  const bounds = getElementBounds(element);
  return (
    point.x >= bounds.left &&
    point.x <= bounds.right &&
    point.y >= bounds.top &&
    point.y <= bounds.bottom
  );
}

/**
 * Get elements at a specific point
 */
export function getElementsAtPoint(
  point: { x: number; y: number },
  elements: FormElement[],
): FormElement[] {
  return elements.filter((element) => isPointInElement(point, element));
}

/**
 * Calculate canvas viewport bounds
 */
export function getCanvasViewport(
  canvasSize: CanvasSize,
  zoom: number,
  scroll: { x: number; y: number },
): {
  left: number;
  right: number;
  top: number;
  bottom: number;
} {
  const scaledWidth = canvasSize.width * zoom;
  const scaledHeight = canvasSize.height * zoom;

  return {
    left: scroll.x,
    right: scroll.x + scaledWidth,
    top: scroll.y,
    bottom: scroll.y + scaledHeight,
  };
}

/**
 * Check if element is visible in viewport
 */
export function isElementVisible(
  element: FormElement,
  viewport: ReturnType<typeof getCanvasViewport>,
): boolean {
  const bounds = getElementBounds(element);

  return !(
    bounds.right < viewport.left ||
    bounds.left > viewport.right ||
    bounds.bottom < viewport.top ||
    bounds.top > viewport.bottom
  );
}

/**
 * Format element position for display
 */
export function formatPosition(position: ElementPosition): string {
  return `(${Math.round(position.x)}, ${Math.round(position.y)})`;
}

/**
 * Calculate element center point
 */
export function getElementCenter(element: FormElement): { x: number; y: number } {
  const bounds = getElementBounds(element);
  return {
    x: bounds.left + bounds.width / 2,
    y: bounds.top + bounds.height / 2,
  };
}

/**
 * Sort elements by their visual order (top to bottom, left to right)
 */
export function sortElementsByVisualOrder(elements: FormElement[]): FormElement[] {
  return [...elements].sort((a, b) => {
    // Primary sort by Y position (top to bottom)
    const yDiff = a.position.y - b.position.y;
    if (Math.abs(yDiff) > 5) return yDiff; // 5px tolerance for same row

    // Secondary sort by X position (left to right)
    const xDiff = a.position.x - b.position.x;
    if (Math.abs(xDiff) > 5) return xDiff;

    // Tertiary sort by order attribute
    return (a.position.order ?? 0) - (b.position.order ?? 0);
  });
}

/**
 * Get next available position for new element
 */
export function getNextElementPosition(existingElements: FormElement[]): ElementPosition {
  if (existingElements.length === 0) {
    return {
      x: DEFAULT_CANVAS_CONFIG.margin,
      y: DEFAULT_CANVAS_CONFIG.margin,
      order: 0,
    };
  }

  const sortedElements = sortElementsByVisualOrder(existingElements);
  const lastElement = sortedElements[sortedElements.length - 1];

  if (!lastElement) {
    return {
      x: DEFAULT_CANVAS_CONFIG.margin,
      y: DEFAULT_CANVAS_CONFIG.margin,
      order: 0,
    };
  }

  return {
    x: DEFAULT_CANVAS_CONFIG.margin,
    y:
      lastElement.position.y +
      DEFAULT_ELEMENT_DIMENSIONS.height +
      DEFAULT_CANVAS_CONFIG.elementSpacing,
    order: sortedElements.length,
  };
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Round to nearest grid position
 */
export function roundToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Calculate distance between two points
 */
export function distance(
  point1: { x: number; y: number },
  point2: { x: number; y: number },
): number {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: never[]) => void>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: never[]) => void>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Get contrasting text color for background
 */
export function getContrastColor(backgroundColor: string): string {
  // Simple contrast calculation - in production, use a proper contrast library
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? '#000000' : '#ffffff';
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Create a safe element ID from a string
 */
export function createSafeId(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

/**
 * Check if an element is selected
 */
export function isElementSelected(
  elementId: UniqueIdentifier,
  selectedIds: Set<UniqueIdentifier>,
): boolean {
  return selectedIds.has(elementId);
}

/**
 * Get element type display name
 */
export function getElementTypeDisplayName(type: string): string {
  const displayNames: Record<string, string> = {
    text: 'Text Input',
    email: 'Email Input',
    phone: 'Phone Input',
    number: 'Number Input',
    date: 'Date Input',
    textarea: 'Text Area',
    select: 'Dropdown',
    radio: 'Radio Group',
    checkbox: 'Checkbox',
    file: 'File Upload',
    range: 'Range Slider',
    switch: 'Toggle Switch',
    rating: 'Star Rating',
    signature: 'Signature',
    section: 'Section',
    heading: 'Heading',
    paragraph: 'Paragraph',
    divider: 'Divider',
    spacer: 'Spacer',
  };

  return displayNames[type] || type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Validate element position within canvas bounds
 */
export function validateElementPosition(
  position: ElementPosition,
  canvasSize: CanvasSize,
): ElementPosition {
  const maxX = Math.max(0, canvasSize.width - DEFAULT_ELEMENT_DIMENSIONS.width);
  const maxY = Math.max(0, canvasSize.height - DEFAULT_ELEMENT_DIMENSIONS.height);

  return {
    ...position,
    x: clamp(position.x, 0, maxX),
    y: clamp(position.y, 0, maxY),
  };
}

/**
 * Calculate optimal canvas size based on elements
 */
export function calculateOptimalCanvasSize(elements: FormElement[]): CanvasSize {
  if (elements.length === 0) {
    return {
      width: DEFAULT_CANVAS_CONFIG.width,
      height: DEFAULT_CANVAS_CONFIG.height,
      minWidth: 400,
      minHeight: 600,
      maxWidth: 2000,
      maxHeight: 5000,
    };
  }

  let maxX = 0;
  let maxY = 0;

  elements.forEach((element) => {
    const bounds = getElementBounds(element);
    maxX = Math.max(maxX, bounds.right);
    maxY = Math.max(maxY, bounds.bottom);
  });

  return {
    width: Math.max(DEFAULT_CANVAS_CONFIG.width, maxX + DEFAULT_CANVAS_CONFIG.margin),
    height: Math.max(DEFAULT_CANVAS_CONFIG.height, maxY + DEFAULT_CANVAS_CONFIG.margin),
    minWidth: 400,
    minHeight: 600,
    maxWidth: 2000,
    maxHeight: 5000,
  };
}
