/**
 * Form Filters Component
 *
 * Provides filtering interface for forms including status,
 * date range, and sorting options.
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { FormFilters as FormFiltersType } from '@/types/form.types';
import { Filter, RotateCcw } from 'lucide-react';

interface FormFiltersProps {
  filters: FormFiltersType;
  onChange: (filters: Partial<FormFiltersType>) => void;
  onClear: () => void;
}

export function FormFilters({ filters, onChange, onClear }: FormFiltersProps) {
  const activeFiltersCount = Object.keys(filters).filter(
    (key) =>
      filters[key as keyof FormFiltersType] !== undefined &&
      filters[key as keyof FormFiltersType] !== '',
  ).length;

  const handleStatusChange = (status: string) => {
    onChange({ status: status as FormFiltersType['status'] });
  };

  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    onChange({ sortBy: sortBy as FormFiltersType['sortBy'], sortOrder });
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={filters.status || ''} onValueChange={handleStatusChange}>
            <DropdownMenuRadioItem value="">All</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="draft">Draft</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="published">Published</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="archived">Archived</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>

          <DropdownMenuSeparator />

          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={`${filters.sortBy || 'updatedAt'}-${filters.sortOrder || 'desc'}`}
            onValueChange={(value) => {
              const [sortBy, sortOrder] = value.split('-') as [string, 'asc' | 'desc'];
              handleSortChange(sortBy, sortOrder);
            }}>
            <DropdownMenuRadioItem value="updatedAt-desc">Recently Updated</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="createdAt-desc">Recently Created</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="title-asc">Name (A-Z)</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="title-desc">Name (Z-A)</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="submissions-desc">Most Submissions</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="views-desc">Most Views</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>

          {activeFiltersCount > 0 && (
            <>
              <DropdownMenuSeparator />
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                className="w-full justify-start gap-2">
                <RotateCcw className="h-4 w-4" />
                Clear filters
              </Button>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
