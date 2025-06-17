import { ELEMENT_CATEGORIES } from '@/constants/element-categories';
import { FormElementType } from '@/types/form-builder.types';
import {
  ElementConfig,
  ElementRegistration,
  ElementSearchFilters,
} from '@/types/form-elements.types';
import { ELEMENT_CONFIGS } from './element-config';

/**
 * Form Element Registry
 * Central system for managing all available form elements in the library
 */
class FormElementRegistry implements ElementRegistration {
  private elements = new Map<FormElementType, ElementConfig>();
  private initialized = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize the registry with default elements
   */
  private initialize() {
    if (this.initialized) return;

    // Register all default elements
    Object.values(ELEMENT_CONFIGS).forEach((config) => {
      this.register(config);
    });

    this.initialized = true;
  }

  /**
   * Register a new element configuration
   */
  register(config: ElementConfig): void {
    if (!config.type) {
      throw new Error('Element configuration must have a type');
    }

    // Validate configuration
    this.validateConfig(config);

    this.elements.set(config.type, config);
  }

  /**
   * Unregister an element
   */
  unregister(elementType: FormElementType): void {
    this.elements.delete(elementType);
  }

  /**
   * Get element configuration by type
   */
  getElement(elementType: FormElementType): ElementConfig | undefined {
    return this.elements.get(elementType);
  }

  /**
   * Get all registered elements
   */
  getAllElements(): ElementConfig[] {
    return Array.from(this.elements.values());
  }

  /**
   * Get elements by category
   */
  getElementsByCategory(categoryId: string): ElementConfig[] {
    return this.getAllElements().filter((config) => config.category === categoryId);
  }

  /**
   * Search elements based on filters
   */
  searchElements(filters: ElementSearchFilters): ElementConfig[] {
    let results = this.getAllElements();

    // Apply category filter
    if (filters.category) {
      results = results.filter((config) => config.category === filters.category);
    }

    // Apply advanced filter
    if (filters.isAdvanced !== undefined) {
      results = results.filter((config) => Boolean(config.isAdvanced) === filters.isAdvanced);
    }

    // Apply premium filter
    if (filters.isPremium !== undefined) {
      results = results.filter((config) => Boolean(config.isPremium) === filters.isPremium);
    }

    // Apply tag filters
    if (filters.tags && filters.tags.length > 0) {
      results = results.filter((config) => filters.tags!.some((tag) => config.tags.includes(tag)));
    }

    // Apply text search
    if (filters.query) {
      const query = filters.query.toLowerCase().trim();
      results = results.filter((config) => {
        const matchesName = config.name.toLowerCase().includes(query);
        const matchesDescription = config.description.toLowerCase().includes(query);
        const matchesTags = config.tags.some((tag) => tag.toLowerCase().includes(query));
        const matchesType = config.type.toLowerCase().includes(query);

        return matchesName || matchesDescription || matchesTags || matchesType;
      });
    }

    return results;
  }

  /**
   * Get popular elements (most commonly used)
   */
  getPopularElements(): ElementConfig[] {
    const popularTypes: FormElementType[] = ['text', 'email', 'textarea', 'dropdown', 'checkbox'];
    return popularTypes
      .map((type) => this.getElement(type))
      .filter((config): config is ElementConfig => config !== undefined);
  }

  /**
   * Get recently used elements
   */
  getRecentElements(): ElementConfig[] {
    // In a real implementation, this would track usage
    return this.getPopularElements().slice(0, 5);
  }

  /**
   * Get elements by tags
   */
  getElementsByTags(tags: string[]): ElementConfig[] {
    return this.getAllElements().filter((config) => tags.some((tag) => config.tags.includes(tag)));
  }

  /**
   * Get all available categories
   */
  getCategories() {
    return ELEMENT_CATEGORIES;
  }

  /**
   * Get all available tags
   */
  getAllTags(): string[] {
    const allTags = new Set<string>();
    this.getAllElements().forEach((config) => {
      config.tags.forEach((tag) => allTags.add(tag));
    });
    return Array.from(allTags).sort();
  }

  /**
   * Validate element configuration
   */
  private validateConfig(config: ElementConfig): void {
    if (!config.type) {
      throw new Error('Element configuration must have a type');
    }

    if (!config.name) {
      throw new Error('Element configuration must have a name');
    }

    if (!config.category) {
      throw new Error('Element configuration must have a category');
    }

    // Validate category exists
    const categoryExists = ELEMENT_CATEGORIES.some((cat) => cat.id === config.category);
    if (!categoryExists) {
      throw new Error(`Invalid category: ${config.category}`);
    }

    if (!Array.isArray(config.tags)) {
      throw new Error('Element configuration must have tags array');
    }
  }

  /**
   * Clear all registered elements
   */
  clear(): void {
    this.elements.clear();
    this.initialized = false;
  }

  /**
   * Get registry statistics
   */
  getStats() {
    const categories = this.getCategories();
    const categoryStats = categories.map((category) => ({
      category: category.name,
      count: this.getElementsByCategory(category.id).length,
    }));

    return {
      totalElements: this.getAllElements().length,
      totalCategories: categories.length,
      totalTags: this.getAllTags().length,
      categoryBreakdown: categoryStats,
    };
  }
}

/**
 * Global element registry instance
 */
export const elementRegistry = new FormElementRegistry();

/**
 * Convenience functions for common operations
 */

/**
 * Get element configuration
 */
export function getElementConfig(elementType: FormElementType): ElementConfig | undefined {
  return elementRegistry.getElement(elementType);
}

/**
 * Get all elements
 */
export function getAllElements(): ElementConfig[] {
  return elementRegistry.getAllElements();
}

/**
 * Search elements
 */
export function searchElements(filters: ElementSearchFilters): ElementConfig[] {
  return elementRegistry.searchElements(filters);
}

/**
 * Get elements by category
 */
export function getElementsByCategory(categoryId: string): ElementConfig[] {
  return elementRegistry.getElementsByCategory(categoryId);
}

/**
 * Get popular elements
 */
export function getPopularElements(): ElementConfig[] {
  return elementRegistry.getPopularElements();
}

/**
 * Get element categories
 */
export function getElementCategories() {
  return elementRegistry.getCategories();
}

/**
 * Check if element type is valid
 */
export function isValidElementType(elementType: string): elementType is FormElementType {
  return elementRegistry.getElement(elementType as FormElementType) !== undefined;
}

/**
 * Get element by name (case-insensitive)
 */
export function getElementByName(name: string): ElementConfig | undefined {
  return elementRegistry
    .getAllElements()
    .find((config) => config.name.toLowerCase() === name.toLowerCase());
}

/**
 * Register custom element
 */
export function registerCustomElement(config: ElementConfig): void {
  elementRegistry.register(config);
}

/**
 * Get registry statistics
 */
export function getRegistryStats() {
  return elementRegistry.getStats();
}
