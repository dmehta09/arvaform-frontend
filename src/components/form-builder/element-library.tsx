'use client';

import { getElementCategories, searchElements } from '@/lib/form-elements/element-registry';
import { cn } from '@/lib/utils';
import { ElementCategory, ElementConfig, ElementSearchFilters } from '@/types/form-elements.types';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ElementCard } from './element-card';

/**
 * Props for the ElementLibrary component
 */
interface ElementLibraryProps {
  className?: string;
  searchPlaceholder?: string;
  // onElementClick?: (elementType: string) => void;
  // onElementDoubleClick?: (elementType: string) => void;
}

/**
 * Simple search input component for the element library
 */
function SimpleElementSearch({
  value,
  onChange,
  placeholder = 'Search elements...',
  className = '',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        'w-full px-3 py-2 text-sm border border-gray-300 rounded-md',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        'placeholder-gray-500',
        className,
      )}
    />
  );
}

/**
 * ElementLibrary provides a comprehensive sidebar for browsing and selecting
 * form elements organized by categories with search functionality
 */
export function ElementLibrary({
  className = '',
  searchPlaceholder = 'Search elements...',
  // onElementClick,
  // onElementDoubleClick,
}: ElementLibraryProps) {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['basic-inputs']), // Expand basic inputs by default
  );

  // Get categories and elements
  const categories = useMemo(() => getElementCategories(), []);

  // Filter elements based on search
  const filteredElements = useMemo(() => {
    const filters: ElementSearchFilters = {
      query: searchQuery,
      category: selectedCategory || undefined,
    };
    return searchElements(filters);
  }, [searchQuery, selectedCategory]);

  // Group elements by category
  const elementsByCategory = useMemo(() => {
    const grouped = new Map<string, { category: ElementCategory; elements: ElementConfig[] }>();

    categories.forEach((category) => {
      const categoryElements = filteredElements.filter(
        (element: ElementConfig) => element.category === category.id,
      );
      if (categoryElements.length > 0) {
        grouped.set(category.id, {
          category,
          elements: categoryElements,
        });
      }
    });

    return grouped;
  }, [categories, filteredElements]);

  /**
   * Toggle category expansion
   */
  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  /**
   * Handle category filter selection
   */
  const handleCategoryFilter = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? '' : categoryId);
  };

  return (
    <div className={cn('element-library', 'flex flex-col h-full', className)}>
      {/* Header */}
      <div className="library-header p-4 border-b bg-white">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Form Elements</h3>

        {/* Search */}
        <SimpleElementSearch
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={setSearchQuery}
          className="mb-3"
        />

        {/* Category filters */}
        <div className="category-filters flex flex-wrap gap-1">
          <button
            onClick={() => handleCategoryFilter('')}
            className={cn(
              'px-2 py-1 rounded text-xs font-medium transition-colors',
              selectedCategory === ''
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
            )}>
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryFilter(category.id)}
              className={cn(
                'px-2 py-1 rounded text-xs font-medium transition-colors',
                selectedCategory === category.id
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
              )}>
              {category.icon} {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Elements */}
      <div className="library-content flex-1 overflow-y-auto">
        {elementsByCategory.size === 0 ? (
          <div className="empty-state p-4 text-center text-gray-500">
            <p className="text-sm">
              {searchQuery ? 'No elements found matching your search.' : 'No elements available.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-blue-600 hover:text-blue-800 text-sm mt-2">
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="categories-list">
            {Array.from(elementsByCategory.entries()).map(
              ([categoryId, { category, elements }]) => (
                <div key={categoryId} className="category-section">
                  {/* Category Header */}
                  <div className="category-header sticky top-0 bg-gray-50 border-b z-10">
                    <button
                      onClick={() => toggleCategory(categoryId)}
                      className="w-full flex items-center justify-between p-3 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{category.icon}</span>
                        <div className="text-left">
                          <div className="font-medium text-gray-900">{category.name}</div>
                          <div className="text-xs text-gray-500">{category.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                          {elements.length}
                        </span>
                        {expandedCategories.has(categoryId) ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </button>
                  </div>

                  {/* Category Elements */}
                  {expandedCategories.has(categoryId) && (
                    <div className="category-elements p-3 space-y-2">
                      {elements.map((elementConfig: ElementConfig) => (
                        <ElementCard
                          key={elementConfig.type}
                          config={elementConfig}
                          size="medium"
                          // onClick={() => onElementClick?.(elementConfig.type)}
                          // onDoubleClick={() => onElementDoubleClick?.(elementConfig.type)}
                          className="w-full"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ),
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="library-footer p-3 border-t bg-gray-50 text-xs text-gray-500">
        <p>
          {filteredElements.length} element{filteredElements.length !== 1 ? 's' : ''} available
        </p>
      </div>
    </div>
  );
}

/**
 * Hook for managing element library state
 */
export function useElementLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['basic-inputs']),
  );

  const filteredElements = useMemo(() => {
    const filters: ElementSearchFilters = {
      query: searchQuery,
      category: selectedCategory || undefined,
    };
    return searchElements(filters);
  }, [searchQuery, selectedCategory]);

  return {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    expandedCategories,
    setExpandedCategories,
    filteredElements,
  };
}
