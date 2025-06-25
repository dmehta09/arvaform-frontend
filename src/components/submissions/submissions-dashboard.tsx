/**
 * Submissions Dashboard Component - ArvaForm 2025
 *
 * Main dashboard for submission management with modern table, filtering, and bulk operations
 * Following React 19 and TanStack Table v8 best practices
 */

'use client';

import { SubmissionFilters } from '@/components/submissions/submission-filters';
import { SubmissionTable } from '@/components/submissions/submission-table';
import { SubmissionTableToolbar } from '@/components/submissions/submission-table-toolbar';
import { SubmissionViewModal } from '@/components/submissions/submission-view-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubmissions } from '@/hooks/use-submissions';
import type {
  Submission,
  SubmissionListResponse,
  SubmissionQueryParams,
} from '@/types/submission.types';
import { Filter, RefreshCw } from 'lucide-react';
import { useState, useTransition } from 'react';

interface SubmissionsDashboardProps {
  /** Form ID */
  formId: string;
  /** Form title for display */
  formTitle: string;
  /** Initial data from server */
  initialData: SubmissionListResponse;
  /** Initial query parameters */
  initialParams: SubmissionQueryParams;
}

/**
 * Main submissions dashboard component with table, filters, and actions
 */
export function SubmissionsDashboard({
  formId,
  formTitle,
  initialData: _initialData,
  initialParams,
}: SubmissionsDashboardProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Use submissions hook with React 19 patterns
  const {
    submissions,
    isLoading,
    error,
    pagination,
    filters,
    sorting,
    selectedIds,
    optimisticSubmissions,
    actionState,
    setFilters,
    setSorting,
    setPagination,
    toggleSelection,
    selectAll,
    clearSelection,
    applyFilterPreset,
    resetFilters,
    performBulkAction,
    refresh,
  } = useSubmissions({
    formId,
    initialParams,
    persistInUrl: true,
    realTime: true,
  });

  // Handle submission view
  const handleViewSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
  };

  // Handle bulk actions with optimistic updates
  const handleBulkAction = async (action: string, reason?: string) => {
    if (selectedIds.length === 0) return;

    startTransition(async () => {
      try {
        await performBulkAction(
          action as 'delete' | 'markAsRead' | 'markAsNew' | 'archive' | 'flag',
          reason,
        );
        clearSelection();
      } catch (error) {
        console.error('Bulk action failed:', error);
      }
    });
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    startTransition(() => {
      setFilters(newFilters);
      setPagination(1); // Reset to first page when filtering
    });
  };

  // Handle sorting changes
  const handleSortingChange = (newSorting: typeof sorting) => {
    startTransition(() => {
      setSorting(newSorting);
    });
  };

  // Handle pagination changes
  const handlePaginationChange = (page: number, pageSize?: number) => {
    startTransition(() => {
      setPagination(page, pageSize);
    });
  };

  // Handle refresh
  const handleRefresh = () => {
    startTransition(() => {
      refresh();
    });
  };

  // Get display data (optimistic or actual)
  const displaySubmissions = optimisticSubmissions.length > 0 ? optimisticSubmissions : submissions;

  // Convert filters to Record<string, unknown> for export
  const currentFiltersForExport = filters as Record<string, unknown>;

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <p className="text-destructive">Failed to load submissions: {error.message}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-muted' : ''}>
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>

          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isPending}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isPending ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Filter Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <SubmissionFilters
              filters={filters}
              onChange={handleFilterChange}
              onApplyPreset={applyFilterPreset}
              onReset={resetFilters}
              isPending={isPending}
            />
          </CardContent>
        </Card>
      )}

      {/* Table Toolbar with Export */}
      <SubmissionTableToolbar
        selectedCount={selectedIds.length}
        totalCount={pagination.total}
        onBulkAction={handleBulkAction}
        onSelectAll={selectAll}
        onClearSelection={clearSelection}
        actionState={actionState}
        isPending={isPending}
        formId={formId}
        formTitle={formTitle}
        selectedSubmissions={undefined}
        currentFilters={currentFiltersForExport}
      />

      {/* Main Table */}
      <Card>
        <CardContent className="p-0">
          <SubmissionTable
            submissions={displaySubmissions}
            isLoading={isLoading || isPending}
            pagination={pagination}
            sorting={sorting}
            selectedIds={selectedIds}
            onViewSubmission={handleViewSubmission}
            onToggleSelection={toggleSelection}
            onSortingChange={handleSortingChange}
            onPaginationChange={handlePaginationChange}
          />
        </CardContent>
      </Card>

      {/* View Modal */}
      {selectedSubmission && (
        <SubmissionViewModal
          submission={selectedSubmission}
          isOpen={!!selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
        />
      )}
    </div>
  );
}
