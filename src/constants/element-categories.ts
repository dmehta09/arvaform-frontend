import { ElementCategory } from '@/types/form-elements.types';

/**
 * Predefined element categories for the form builder library
 * Organized by complexity and common usage patterns
 */
export const ELEMENT_CATEGORIES: ElementCategory[] = [
  {
    id: 'basic-inputs',
    name: 'Basic Inputs',
    description: 'Essential input fields for collecting user data',
    icon: '📝',
    order: 1,
    elements: ['text', 'email', 'phone', 'number', 'date'],
  },
  {
    id: 'text-content',
    name: 'Text & Content',
    description: 'Text areas and content formatting elements',
    icon: '📄',
    order: 2,
    elements: ['textarea', 'heading', 'section'],
  },
  {
    id: 'selection',
    name: 'Selection',
    description: 'Choice-based input elements for user selection',
    icon: '☑️',
    order: 3,
    elements: ['dropdown', 'radio', 'checkbox'],
  },
  {
    id: 'layout',
    name: 'Layout',
    description: 'Structural elements for organizing form content',
    icon: '🎨',
    order: 4,
    elements: ['divider'],
  },
];

/**
 * Category lookup map for quick access
 */
export const CATEGORY_MAP = new Map(ELEMENT_CATEGORIES.map((category) => [category.id, category]));

/**
 * Get category by ID
 */
export function getCategoryById(categoryId: string): ElementCategory | undefined {
  return CATEGORY_MAP.get(categoryId);
}

/**
 * Get category for element type
 */
export function getCategoryForElement(elementType: string): ElementCategory | undefined {
  return ELEMENT_CATEGORIES.find((category) =>
    category.elements.includes(elementType as ElementCategory['elements'][0]),
  );
}

/**
 * Get all element types in a category
 */
export function getElementsInCategory(categoryId: string): string[] {
  const category = getCategoryById(categoryId);
  return category ? category.elements : [];
}

/**
 * Category colors for UI styling
 */
export const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  'basic-inputs': {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
  },
  'text-content': {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
  },
  selection: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
  },
  layout: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
  },
};

/**
 * Get colors for category
 */
export function getCategoryColors(categoryId: string) {
  return (
    CATEGORY_COLORS[categoryId] || {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-700',
    }
  );
}
