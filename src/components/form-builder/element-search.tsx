'use client';

import { cn } from '@/lib/utils';
import { ElementSearchFilters } from '@/types/form-elements.types';
import { SearchIcon, XIcon } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

/**
 * Props for the ElementSearch component
 */
interface ElementSearchProps {
  filters: ElementSearchFilters;
  onFiltersChange: (filters: ElementSearchFilters) => void;
  placeholder?: string;
  className?: string;
  showClearButton?: boolean;
  debounceMs?: number;
}

/**
 * Search component for filtering form elements in the library
 * Provides real-time search with debouncing and clear functionality
 */
export function ElementSearch({
  filters,
  onFiltersChange,
  placeholder = 'Search elements...',
  className = '',
  showClearButton = true,
  debounceMs = 300,
}: ElementSearchProps) {
  const [inputValue, setInputValue] = useState(filters.query || '');
  const [isFocused, setIsFocused] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== filters.query) {
        onFiltersChange({
          ...filters,
          query: inputValue,
        });
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [inputValue, filters, onFiltersChange, debounceMs]);

  // Sync input value with external filter changes
  useEffect(() => {
    if (filters.query !== inputValue) {
      setInputValue(filters.query || '');
    }
  }, [filters.query, inputValue]);

  /**
   * Handle input change
   */
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  }, []);

  /**
   * Handle clear search
   */
  const handleClear = useCallback(() => {
    setInputValue('');
    onFiltersChange({
      ...filters,
      query: '',
    });
  }, [filters, onFiltersChange]);

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      // Clear on Escape
      if (event.key === 'Escape') {
        handleClear();
        event.currentTarget.blur();
      }
    },
    [handleClear],
  );

  /**
   * Handle focus events
   */
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const hasValue = inputValue.length > 0;
  const isActive = isFocused || hasValue;

  return (
    <div
      className={cn(
        'element-search relative',
        'border border-gray-300 rounded-lg overflow-hidden',
        'transition-all duration-200',
        {
          'border-blue-400 shadow-sm': isActive,
          'border-gray-200': !isActive,
        },
        className,
      )}>
      {/* Search input */}
      <div className="relative flex items-center">
        {/* Search icon */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <SearchIcon
            className={cn('h-4 w-4 transition-colors duration-200', {
              'text-blue-500': isActive,
              'text-gray-400': !isActive,
            })}
          />
        </div>

        {/* Input field */}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={cn(
            'w-full pl-10 pr-10 py-2.5',
            'text-sm placeholder-gray-500',
            'bg-transparent border-none outline-none',
            'focus:placeholder-gray-400',
          )}
          data-testid="element-search-input"
        />

        {/* Clear button */}
        {showClearButton && hasValue && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              'absolute right-3 top-1/2 transform -translate-y-1/2',
              'p-1 rounded-full',
              'hover:bg-gray-100 active:bg-gray-200',
              'transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
            )}
            aria-label="Clear search"
            data-testid="element-search-clear">
            <XIcon className="h-3 w-3 text-gray-400" />
          </button>
        )}
      </div>

      {/* Search suggestions (optional future enhancement) */}
      {isActive && hasValue && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1">
          {/* This could be expanded to show search suggestions in the future */}
        </div>
      )}
    </div>
  );
}

/**
 * Advanced search component with additional filter options
 */
interface AdvancedElementSearchProps extends ElementSearchProps {
  availableTags?: string[];
  availableCategories?: { id: string; name: string }[];
  showTagFilter?: boolean;
  showCategoryFilter?: boolean;
  showAdvancedFilter?: boolean;
}

export function AdvancedElementSearch({
  filters,
  onFiltersChange,
  availableTags = [],
  availableCategories = [],
  showTagFilter = true,
  showCategoryFilter = true,
  showAdvancedFilter = true,
  ...searchProps
}: AdvancedElementSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  /**
   * Handle category filter change
   */
  const handleCategoryChange = useCallback(
    (category: string | undefined) => {
      onFiltersChange({
        ...filters,
        category: category || undefined,
      });
    },
    [filters, onFiltersChange],
  );

  /**
   * Handle tag filter change
   */
  const handleTagToggle = useCallback(
    (tag: string) => {
      const currentTags = filters.tags || [];
      const newTags = currentTags.includes(tag)
        ? currentTags.filter((t) => t !== tag)
        : [...currentTags, tag];

      onFiltersChange({
        ...filters,
        tags: newTags.length > 0 ? newTags : undefined,
      });
    },
    [filters, onFiltersChange],
  );

  /**
   * Handle advanced filter toggle
   */
  const handleAdvancedToggle = useCallback(() => {
    onFiltersChange({
      ...filters,
      isAdvanced: filters.isAdvanced === undefined ? true : !filters.isAdvanced,
    });
  }, [filters, onFiltersChange]);

  /**
   * Clear all filters
   */
  const handleClearAll = useCallback(() => {
    onFiltersChange({
      query: '',
    });
  }, [onFiltersChange]);

  const hasActiveFilters =
    filters.query ||
    filters.category ||
    (filters.tags && filters.tags.length > 0) ||
    filters.isAdvanced !== undefined;

  return (
    <div className="advanced-element-search space-y-3">
      {/* Main search */}
      <ElementSearch {...searchProps} filters={filters} onFiltersChange={onFiltersChange} />

      {/* Filter toggle */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          data-testid="advanced-search-toggle">
          {isExpanded ? 'Hide Filters' : 'Show Filters'}
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-sm text-gray-600 hover:text-gray-700"
            data-testid="clear-all-filters">
            Clear All
          </button>
        )}
      </div>

      {/* Advanced filters */}
      {isExpanded && (
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg border">
          {/* Category filter */}
          {showCategoryFilter && availableCategories.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleCategoryChange(e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Categories</option>
                {availableCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tag filters */}
          {showTagFilter && availableTags.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tags</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.slice(0, 10).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium border transition-colors',
                      {
                        'bg-blue-100 border-blue-300 text-blue-700': filters.tags?.includes(tag),
                        'bg-white border-gray-300 text-gray-600 hover:border-gray-400':
                          !filters.tags?.includes(tag),
                      },
                    )}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Advanced elements toggle */}
          {showAdvancedFilter && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="advanced-elements"
                checked={filters.isAdvanced === true}
                onChange={handleAdvancedToggle}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="advanced-elements" className="text-sm text-gray-700">
                Show advanced elements only
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
