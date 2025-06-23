/**
 * Submissions API Client - ArvaForm 2025
 *
 * Modern API client for submission management with TanStack Query integration
 * Following Next.js 15 and React 19 best practices
 */

import { apiClient } from '@/lib/api-client';
import type {
  BulkActionRequest,
  BulkActionResponse,
  Submission,
  SubmissionFilters,
  SubmissionListResponse,
  SubmissionQueryParams,
  SubmissionSorting,
  SubmissionStats,
} from '@/types/submission.types';

/**
 * Base path for submissions API endpoints
 */
const SUBMISSIONS_BASE = '/submissions';

/**
 * Convert filters and sorting to URL query parameters
 */
function buildQueryParams(params: SubmissionQueryParams): URLSearchParams {
  const searchParams = new URLSearchParams();

  // Add pagination
  if (params.page) {
    searchParams.set('page', params.page.toString());
  }
  if (params.limit) {
    searchParams.set('limit', params.limit.toString());
  }

  // Add sorting
  if (params.sorting) {
    searchParams.set('sortBy', params.sorting.field);
    searchParams.set('sortDir', params.sorting.direction);
  }

  // Add filters
  if (params.filters) {
    const { filters } = params;

    if (filters.search) {
      searchParams.set('search', filters.search);
    }

    if (filters.status && filters.status.length > 0) {
      // Ensure status is an array before join (2025 TS pattern)
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

    if (filters.deviceType && filters.deviceType.length > 0) {
      searchParams.set('deviceType', filters.deviceType.join(','));
    }

    // Add custom field filters
    if (filters.customFields) {
      Object.entries(filters.customFields).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.set(`field.${key}`, String(value));
        }
      });
    }
  }

  return searchParams;
}

/**
 * Fetch submissions for a specific form with pagination, filtering, and sorting
 */
export async function fetchSubmissions(
  formId: string,
  params: SubmissionQueryParams = {},
): Promise<SubmissionListResponse> {
  const queryParams = buildQueryParams(params);
  const response = await apiClient.get<SubmissionListResponse>(
    `${SUBMISSIONS_BASE}/form/${formId}?${queryParams.toString()}`,
  );
  return response.data;
}

/**
 * Fetch a single submission by ID
 */
export async function fetchSubmission(submissionId: string): Promise<Submission> {
  const response = await apiClient.get<Submission>(`${SUBMISSIONS_BASE}/${submissionId}`);
  return response.data;
}

/**
 * Update submission status (mark as read, archive, etc.)
 */
export async function updateSubmissionStatus(
  submissionId: string,
  status: Submission['status'],
  notes?: string,
): Promise<Submission> {
  const response = await apiClient.patch<Submission>(`${SUBMISSIONS_BASE}/${submissionId}/status`, {
    status,
    notes,
  });
  return response.data;
}

/**
 * Delete a single submission
 */
export async function deleteSubmission(submissionId: string): Promise<void> {
  await apiClient.delete(`${SUBMISSIONS_BASE}/${submissionId}`);
}

/**
 * Perform bulk actions on multiple submissions
 */
export async function performBulkAction(
  formId: string,
  request: BulkActionRequest,
): Promise<BulkActionResponse> {
  const response = await apiClient.post<BulkActionResponse>(
    `${SUBMISSIONS_BASE}/form/${formId}/bulk`,
    request,
  );
  return response.data;
}

/**
 * Fetch submission statistics for a form
 */
export async function fetchSubmissionStats(
  formId: string,
  dateRange?: { from: Date; to: Date },
): Promise<SubmissionStats> {
  const queryParams = new URLSearchParams();

  if (dateRange?.from) {
    queryParams.set('from', dateRange.from.toISOString());
  }
  if (dateRange?.to) {
    queryParams.set('to', dateRange.to.toISOString());
  }

  const response = await apiClient.get<SubmissionStats>(
    `${SUBMISSIONS_BASE}/form/${formId}/stats?${queryParams.toString()}`,
  );
  return response.data;
}

/**
 * Download a file from a submission
 */
export async function downloadSubmissionFile(submissionId: string, fileId: string): Promise<Blob> {
  // Use direct fetch for blob response until API client supports response types
  const response = await fetch(`${SUBMISSIONS_BASE}/${submissionId}/files/${fileId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('arvaform_tokens')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to download file');
  }

  return response.blob();
}

/**
 * Export submissions data
 * Integration point for E3-T007 (Basic Data Export Functionality)
 */
export async function exportSubmissions(
  formId: string,
  format: 'csv' | 'excel' | 'json',
  filters?: SubmissionFilters,
  columns?: string[],
): Promise<Blob> {
  const queryParams = new URLSearchParams({
    format,
    ...(columns && { columns: columns.join(',') }),
  });

  // Add filter parameters
  if (filters) {
    const filterParams = buildQueryParams({ filters });
    filterParams.forEach((value, key) => {
      queryParams.set(key, value);
    });
  }

  // Use direct fetch for blob response until API client supports response types
  const response = await fetch(
    `${SUBMISSIONS_BASE}/form/${formId}/export?${queryParams.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('arvaform_tokens')}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error('Failed to export submissions');
  }

  return response.blob();
}

/**
 * Get presigned URL for file upload
 */
export async function getFileUploadUrl(
  submissionId: string,
  fileName: string,
  fileSize: number,
): Promise<string> {
  // Use direct fetch temporarily
  const response = await fetch(`${SUBMISSIONS_BASE}/${submissionId}/upload-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('arvaform_tokens')}`,
    },
    body: JSON.stringify({ fileName, fileSize }),
  });

  if (!response.ok) {
    throw new Error('Failed to get upload URL');
  }

  const data = await response.json();
  return data.uploadUrl;
}

/**
 * TanStack Query configuration helpers
 */
export const submissionQueries = {
  /**
   * Query key factory for submissions
   */
  keys: {
    all: ['submissions'] as const,
    form: (formId: string) => [...submissionQueries.keys.all, 'form', formId] as const,
    list: (formId: string, params?: SubmissionQueryParams) =>
      [...submissionQueries.keys.form(formId), 'list', params] as const,
    detail: (submissionId: string) =>
      [...submissionQueries.keys.all, 'detail', submissionId] as const,
    stats: (formId: string, dateRange?: { from: Date; to: Date }) =>
      [...submissionQueries.keys.form(formId), 'stats', dateRange] as const,
  },

  /**
   * Pre-configured query options for submissions list
   */
  list: (formId: string, params?: SubmissionQueryParams) => ({
    queryKey: submissionQueries.keys.list(formId, params),
    queryFn: () => fetchSubmissions(formId, params),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  }),

  /**
   * Pre-configured query options for submission detail
   */
  detail: (submissionId: string) => ({
    queryKey: submissionQueries.keys.detail(submissionId),
    queryFn: () => fetchSubmission(submissionId),
    staleTime: 60 * 1000, // 1 minute
  }),

  /**
   * Pre-configured query options for submission stats
   */
  stats: (formId: string, dateRange?: { from: Date; to: Date }) => ({
    queryKey: submissionQueries.keys.stats(formId, dateRange),
    queryFn: () => fetchSubmissionStats(formId, dateRange),
    staleTime: 2 * 60 * 1000, // 2 minutes
  }),
};

/**
 * Mutation options for submission operations
 */
export const submissionMutations = {
  /**
   * Update submission status mutation
   */
  updateStatus: {
    mutationFn: ({
      submissionId,
      status,
      notes,
    }: {
      submissionId: string;
      status: Submission['status'];
      notes?: string;
    }) => updateSubmissionStatus(submissionId, status, notes),
  },

  /**
   * Delete submission mutation
   */
  delete: {
    mutationFn: deleteSubmission,
  },

  /**
   * Bulk action mutation
   */
  bulkAction: {
    mutationFn: ({ formId, request }: { formId: string; request: BulkActionRequest }) =>
      performBulkAction(formId, request),
  },
};

/**
 * Default pagination settings
 */
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
} as const;

/**
 * Default sorting configuration
 */
export const DEFAULT_SORTING: SubmissionSorting = {
  field: 'submittedAt',
  direction: 'desc',
} as const;

/**
 * Predefined filter presets
 */
export const FILTER_PRESETS = {
  unread: { status: ['new' as const] },
  today: {
    dateRange: {
      from: new Date(new Date().setHours(0, 0, 0, 0)),
      to: new Date(new Date().setHours(23, 59, 59, 999)),
    },
  },
  thisWeek: {
    dateRange: {
      from: new Date(new Date().setDate(new Date().getDate() - 7)),
      to: new Date(),
    },
  },
  withFiles: { hasFiles: true },
  lowSpam: { maxSpamScore: 30 },
} as const;
