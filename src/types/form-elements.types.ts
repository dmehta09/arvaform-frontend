import { FormElement, FormElementType } from './form-builder.types';

/**
 * Form element category definition
 */
export interface ElementCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  order: number;
  elements: FormElementType[];
}

/**
 * Element configuration for the library
 */
export interface ElementConfig {
  type: FormElementType;
  name: string;
  description: string;
  icon: string;
  category: string;
  defaultProps: Partial<FormElement>;
  isAdvanced?: boolean;
  isPremium?: boolean;
  tags: string[];
  previewImage?: string;
}

/**
 * Element library search filters
 */
export interface ElementSearchFilters {
  query: string;
  category?: string;
  tags?: string[];
  isAdvanced?: boolean;
  isPremium?: boolean;
}

/**
 * Element drag data for library elements
 */
export interface ElementDragData {
  elementType: FormElementType;
  source: 'library';
  config: ElementConfig;
}

/**
 * Element usage analytics
 */
export interface ElementUsageStats {
  elementType: FormElementType;
  usageCount: number;
  lastUsed: Date;
  averageConfigTime: number;
  popularProperties: Record<string, number>;
}

/**
 * Element library state
 */
export interface ElementLibraryState {
  categories: ElementCategory[];
  elements: ElementConfig[];
  searchFilters: ElementSearchFilters;
  favoriteElements: FormElementType[];
  recentElements: FormElementType[];
  expandedCategories: string[];
  usageStats: Record<FormElementType, ElementUsageStats>;
}

/**
 * Element registration interface
 */
export interface ElementRegistration {
  register: (config: ElementConfig) => void;
  unregister: (elementType: FormElementType) => void;
  getElement: (elementType: FormElementType) => ElementConfig | undefined;
  getAllElements: () => ElementConfig[];
  getElementsByCategory: (categoryId: string) => ElementConfig[];
  searchElements: (filters: ElementSearchFilters) => ElementConfig[];
}

/**
 * Element template for quick form creation
 */
export interface ElementTemplate {
  id: string;
  name: string;
  description: string;
  elements: FormElement[];
  category: string;
  thumbnail?: string;
  isPopular?: boolean;
}
