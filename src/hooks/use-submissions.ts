/**
 * useSubmissions Hook - ArvaForm 2025
 *
 * Modern submission management hook using React 19 patterns
 * Integrates TanStack Query, useActionState, useOptimistic, and URL state
 */

'use client';

import {
  DEFAULT_PAGINATION,
  DEFAULT_SORTING,
  FILTER_PRESETS,
  submissionQueries,
} from '@/lib/api/submissions';
import type {
  BulkActionRequest,
  Submission,
  SubmissionActionState,
  SubmissionFilters,
  SubmissionQueryParams,
  SubmissionSorting,
} from '@/types/submission.types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useActionState, useCallback, useMemo, useOptimistic, useTransition } from 'react';

interface UseSubmissionsOptions {
  /** Form ID to fetch submissions for */
  formId: string;
  /** Initial query parameters */
  initialParams?: SubmissionQueryParams;
  /** Enable real-time updates */
  realTime?: boolean;
  /** Enable URL state persistence */
  persistInUrl?: boolean;
}

interface UseSubmissionsReturn {
  /** Current submissions data */
  submissions: Submission[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Pagination info */
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  /** Current filters */
  filters: SubmissionFilters;
  /** Current sorting */
  sorting: SubmissionSorting;
  /** Selected submission IDs for bulk actions */
  selectedIds: string[];
  /** Optimistic submissions for immediate UI updates */
  optimisticSubmissions: Submission[];
  /** Action state for bulk operations */
  actionState: SubmissionActionState;
  /** Is any transition pending */
  isPending: boolean;

  // Actions
  /** Update filters */
  setFilters: (filters: Partial<SubmissionFilters>) => void;
  /** Update sorting */
  setSorting: (sorting: SubmissionSorting) => void;
  /** Update pagination */
  setPagination: (page: number, limit?: number) => void;
  /** Toggle selection of submission */
  toggleSelection: (submissionId: string) => void;
  /** Select all current page submissions */
  selectAll: () => void;
  /** Clear all selections */
  clearSelection: () => void;
  /** Apply filter preset */
  applyFilterPreset: (preset: keyof typeof FILTER_PRESETS) => void;
  /** Reset all filters */
  resetFilters: () => void;
  /** Perform bulk action */
  performBulkAction: (action: BulkActionRequest['action'], reason?: string) => Promise<void>;
  /** Refresh submissions data */
  refresh: () => void;
}

/**
 * Server action for bulk operations (React 19 pattern)
 */
async function bulkActionServerAction(
  prevState: SubmissionActionState,
  formData: FormData,
): Promise<SubmissionActionState> {
  try {
    const action = formData.get('action') as BulkActionRequest['action'];
    const submissionIds = formData.get('submissionIds') as string;
    const _reason = formData.get('reason') as string | undefined;
    const formId = formData.get('formId') as string;

    if (!action || !submissionIds || !formId) {
      throw new Error('Missing required fields');
    }

    // This would call the actual API
    // For now, return success state
    return {
      status: 'success',
      message: `Successfully performed ${action} on ${submissionIds.split(',').length} submissions`,
      lastUpdated: new Date(),
    };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      lastUpdated: new Date(),
    };
  }
}

/**
 * Parse URL search params to submission query params
 */
function parseUrlParams(searchParams: URLSearchParams): SubmissionQueryParams {
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  const sortBy = searchParams.get('sortBy');
  const sortDir = searchParams.get('sortDir') as 'asc' | 'desc';

  const filters: SubmissionFilters = {};

  // Parse basic filters
  const search = searchParams.get('search');
  if (search) filters.search = search;

  const status = searchParams.get('status');
  if (status) {
    // Use proper array check before join
    const statusArray = Array.isArray(status) ? status : [status];
    filters.status = statusArray as unknown as SubmissionFilters['status'];
  }

  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  if (dateFrom || dateTo) {
    filters.dateRange = {
      ...(dateFrom && { from: new Date(dateFrom) }),
      ...(dateTo && { to: new Date(dateTo) }),
    };
  }

  const hasEmail = searchParams.get('hasEmail');
  if (hasEmail) filters.hasEmail = hasEmail === 'true';

  const hasFiles = searchParams.get('hasFiles');
  if (hasFiles) filters.hasFiles = hasFiles === 'true';

  const maxSpamScore = searchParams.get('maxSpamScore');
  if (maxSpamScore) filters.maxSpamScore = parseInt(maxSpamScore, 10);

  const deviceType = searchParams.get('deviceType');
  if (deviceType) {
    filters.deviceType = deviceType.split(',') as SubmissionFilters['deviceType'];
  }

  return {
    page,
    limit,
    ...(sortBy &&
      sortDir && {
        sorting: {
          field: sortBy as keyof Submission | 'submitterInfo.email' | 'metadata.deviceType',
          direction: sortDir,
        },
      }),
    ...(Object.keys(filters).length > 0 && { filters }),
  };
}

/**
 * Convert submission query params to URL search params
 */
function toUrlParams(params: SubmissionQueryParams): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (params.page && params.page > 1) {
    searchParams.set('page', params.page.toString());
  }
  if (params.limit && params.limit !== DEFAULT_PAGINATION.limit) {
    searchParams.set('limit', params.limit.toString());
  }
  if (params.sorting) {
    searchParams.set('sortBy', params.sorting.field);
    searchParams.set('sortDir', params.sorting.direction);
  }
  if (params.filters) {
    const { filters } = params;
    if (filters.search) searchParams.set('search', filters.search);
    if (filters.status?.length) {
      // Use proper array check before join
      const statusArray = Array.isArray(filters.status) ? filters.status : [filters.status];
      searchParams.set('status', statusArray.join(','));
    }
    if (filters.dateRange?.from) {
      searchParams.set('dateFrom', filters.dateRange.from.toISOString());
    }
    if (filters.dateRange?.to) {
      searchParams.set('dateTo', filters.dateRange.to.toISOString());
    }
    if (filters.hasEmail !== undefined) {
      searchParams.set('hasEmail', filters.hasEmail.toString());
    }
    if (filters.hasFiles !== undefined) {
      searchParams.set('hasFiles', filters.hasFiles.toString());
    }
    if (filters.maxSpamScore !== undefined) {
      searchParams.set('maxSpamScore', filters.maxSpamScore.toString());
    }
    if (filters.deviceType?.length) {
      searchParams.set('deviceType', filters.deviceType.join(','));
    }
  }

  return searchParams;
}

/**
 * Main useSubmissions hook
 */
export function useSubmissions(options: UseSubmissionsOptions): UseSubmissionsReturn {
  const { formId, initialParams, persistInUrl = true } = options;
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Parse current params from URL or use initial params
  const currentParams = useMemo(() => {
    if (persistInUrl && searchParams) {
      return parseUrlParams(searchParams);
    }
    return (
      initialParams || {
        page: DEFAULT_PAGINATION.page,
        limit: DEFAULT_PAGINATION.limit,
        sorting: DEFAULT_SORTING,
      }
    );
  }, [searchParams, initialParams, persistInUrl]);

  // React 19 useActionState for bulk operations
  const [actionState, bulkActionDispatch] = useActionState(bulkActionServerAction, {
    status: 'idle',
  } as SubmissionActionState);

  // Selection state
  const [selectedIds, setSelectedIds] = useOptimistic(
    [] as string[],
    (state, newSelection: { type: 'toggle' | 'selectAll' | 'clear'; ids?: string[] }) => {
      switch (newSelection.type) {
        case 'toggle':
          const id = newSelection.ids?.[0];
          if (!id) return state;
          return state.includes(id) ? state.filter((i) => i !== id) : [...state, id];
        case 'selectAll':
          return newSelection.ids || [];
        case 'clear':
          return [];
        default:
          return state;
      }
    },
  );

  // Fetch submissions data
  const {
    data: submissionsResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    ...submissionQueries.list(formId, currentParams),
    enabled: !!formId,
  });

  // Optimistic submissions for immediate UI updates
  const [optimisticSubmissions] = useOptimistic(
    submissionsResponse?.data || [],
    (state, newSubmissions: Submission[]) => newSubmissions,
  );

  // Update URL when params change
  const updateUrl = useCallback(
    (newParams: SubmissionQueryParams) => {
      if (!persistInUrl) return;

      const urlParams = toUrlParams(newParams);
      const newUrl = `${window.location.pathname}?${urlParams.toString()}`;

      startTransition(() => {
        router.replace(newUrl, { scroll: false });
      });
    },
    [persistInUrl, router],
  );

  // Action handlers
  const setFilters = useCallback(
    (newFilters: Partial<SubmissionFilters>) => {
      const updatedParams = {
        ...currentParams,
        page: 1, // Reset to first page when filtering
        filters: { ...currentParams.filters, ...newFilters },
      };
      updateUrl(updatedParams);
    },
    [currentParams, updateUrl],
  );

  const setSorting = useCallback(
    (sorting: SubmissionSorting) => {
      const updatedParams = { ...currentParams, sorting };
      updateUrl(updatedParams);
    },
    [currentParams, updateUrl],
  );

  const setPagination = useCallback(
    (page: number, limit?: number) => {
      const updatedParams = {
        ...currentParams,
        page,
        ...(limit && { limit }),
      };
      updateUrl(updatedParams);
    },
    [currentParams, updateUrl],
  );

  const toggleSelection = useCallback(
    (submissionId: string) => {
      startTransition(() => {
        setSelectedIds({ type: 'toggle', ids: [submissionId] });
      });
    },
    [setSelectedIds],
  );

  const selectAll = useCallback(() => {
    const allIds = submissionsResponse?.data.map((s) => s.id) || [];
    startTransition(() => {
      setSelectedIds({ type: 'selectAll', ids: allIds });
    });
  }, [submissionsResponse?.data, setSelectedIds]);

  const clearSelection = useCallback(() => {
    startTransition(() => {
      setSelectedIds({ type: 'clear' });
    });
  }, [setSelectedIds]);

  const applyFilterPreset = useCallback(
    (preset: keyof typeof FILTER_PRESETS) => {
      const presetFilters = FILTER_PRESETS[preset];
      // Convert readonly preset to mutable filters using proper type assertion (2025 TS pattern)
      setFilters({ ...presetFilters } as Partial<SubmissionFilters>);
    },
    [setFilters],
  );

  const resetFilters = useCallback(() => {
    const updatedParams = {
      ...currentParams,
      page: 1,
      filters: {},
    };
    updateUrl(updatedParams);
  }, [currentParams, updateUrl]);

  const performBulkAction = useCallback(
    async (action: BulkActionRequest['action'], reason?: string) => {
      if (selectedIds.length === 0) return;

      const formData = new FormData();
      formData.append('action', action);
      formData.append('submissionIds', selectedIds.join(','));
      formData.append('formId', formId);
      if (reason) formData.append('reason', reason);

      startTransition(() => {
        bulkActionDispatch(formData);
      });

      // Clear selection after action
      clearSelection();

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: submissionQueries.keys.form(formId),
      });
    },
    [selectedIds, formId, bulkActionDispatch, clearSelection, queryClient],
  );

  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    submissions: submissionsResponse?.data || [],
    isLoading,
    error,
    pagination: submissionsResponse?.pagination || {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    },
    filters: currentParams.filters || {},
    sorting: currentParams.sorting || DEFAULT_SORTING,
    selectedIds,
    optimisticSubmissions,
    actionState,
    isPending,

    // Actions
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
  };
}
