/**
 * Form Dashboard Component
 *
 * Main dashboard interface for form management featuring form listing,
 * search, filtering, analytics overview, and form actions.
 * Implements modern 2025 design patterns with responsive layout.
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useForms, useUserAnalytics } from '@/hooks/use-forms';
import type { FormFilters as FormFiltersType } from '@/types/form.types';
import { Grid3X3, List, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { FormCard } from './form-card';
import { FormCreationModal } from './form-creation-modal';
import { FormFilters } from './form-filters';
import { FormSearch } from './form-search';

type ViewMode = 'grid' | 'list';

interface FormDashboardProps {
  className?: string;
}

export function FormDashboard({ className }: FormDashboardProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FormFiltersType>({});

  // Debounced search and filtering
  const debouncedFilters = useMemo(() => {
    return {
      ...filters,
      search: searchQuery.trim() || undefined,
    };
  }, [filters, searchQuery]);

  // Fetch forms and analytics
  const {
    data: formsData,
    isLoading: isLoadingForms,
    error: formsError,
  } = useForms(debouncedFilters);
  const { data: analytics, isLoading: isLoadingAnalytics } = useUserAnalytics();

  const forms = formsData?.forms || [];
  const totalForms = formsData?.total || 0;

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<FormFiltersType>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  return (
    <div className={`space-y-6 p-6 ${className || ''}`}>
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Forms</h1>
          <p className="text-muted-foreground">Create, manage, and analyze your forms</p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 w-8 p-0">
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 w-8 p-0">
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Create Form Button */}
          <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Form
          </Button>
        </div>
      </div>

      {/* Analytics Overview */}
      {isLoadingAnalytics ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : analytics ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalForms}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.totalForms === 1 ? 'form created' : 'forms created'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalSubmissions}</div>
              <p className="text-xs text-muted-foreground">across all forms</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalViews}</div>
              <p className="text-xs text-muted-foreground">form page views</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Conversion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.averageConversionRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">conversion rate</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search */}
        <FormSearch
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search forms..."
          className="flex-1"
        />

        {/* Filters */}
        <FormFilters filters={filters} onChange={handleFilterChange} onClear={clearFilters} />
      </div>

      {/* Active Filters */}
      {(searchQuery || Object.keys(filters).length > 0) && (
        <div className="flex flex-wrap gap-2">
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: {searchQuery}
              <button
                onClick={() => setSearchQuery('')}
                className="ml-1 rounded-full hover:bg-muted">
                ×
              </button>
            </Badge>
          )}
          {filters.status && (
            <Badge variant="secondary" className="gap-1">
              Status: {filters.status}
              <button
                onClick={() => handleFilterChange({ status: undefined })}
                className="ml-1 rounded-full hover:bg-muted">
                ×
              </button>
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs">
            Clear all
          </Button>
        </div>
      )}

      {/* Forms Grid/List */}
      {isLoadingForms ? (
        <div
          className={`grid gap-4 ${
            viewMode === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : formsError ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-destructive mb-2">Failed to load forms</p>
            <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
          </CardContent>
        </Card>
      ) : forms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            {searchQuery || Object.keys(filters).length > 0 ? (
              <>
                <p className="text-lg font-medium mb-2">No forms found</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Try adjusting your search or filters
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              </>
            ) : (
              <>
                <p className="text-lg font-medium mb-2">No forms yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first form to get started
                </p>
                <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Form
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div
          className={`grid gap-4 ${
            viewMode === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}>
          {forms.map((form) => (
            <FormCard key={form.id} form={form} viewMode={viewMode} />
          ))}
        </div>
      )}

      {/* Pagination would go here if implementing infinite scroll */}
      {totalForms > forms.length && (
        <div className="flex justify-center">
          <Button variant="outline">Load more forms</Button>
        </div>
      )}

      {/* Form Creation Modal */}
      <FormCreationModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
    </div>
  );
}
