/**
 * Forms API Client for ArvaForm Frontend
 *
 * Provides type-safe API functions for form management operations
 * including CRUD operations, search, filtering, and analytics.
 */

import { apiClient } from '@/lib/api-client';
import type {
  CreateFormDto,
  CreateFormResponse,
  DeleteFormResponse,
  DuplicateFormDto,
  Form,
  FormAnalyticsResponse,
  FormFilters,
  FormListResponse,
  FormTemplate,
  GetFormResponse,
  PublishFormDto,
  PublishFormResponse,
  UpdateFormDto,
  UpdateFormResponse,
} from '@/types/form.types';

// ============================================================================
// Form CRUD Operations
// ============================================================================

/**
 * Get all forms for the current user with filtering and pagination
 */
export const getForms = async (filters?: FormFilters): Promise<FormListResponse> => {
  const params = new URLSearchParams();

  if (filters?.status) params.append('status', filters.status);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.createdBy) params.append('createdBy', filters.createdBy);
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
  if (filters?.dateTo) params.append('dateTo', filters.dateTo);
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

  const endpoint = `/forms${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await apiClient.get<FormListResponse>(endpoint);
  return response.data;
};

/**
 * Get a specific form by ID
 */
export const getForm = async (formId: string): Promise<Form> => {
  const response = await apiClient.get<GetFormResponse>(`/forms/${formId}`);
  return response.data.form;
};

/**
 * Create a new form
 */
export const createForm = async (data: CreateFormDto): Promise<Form> => {
  const response = await apiClient.post<CreateFormResponse>('/forms', data);
  return response.data.form;
};

/**
 * Update an existing form
 */
export const updateForm = async (formId: string, data: UpdateFormDto): Promise<Form> => {
  const response = await apiClient.patch<UpdateFormResponse>(`/forms/${formId}`, data);
  return response.data.form;
};

/**
 * Delete a form (soft delete)
 */
export const deleteForm = async (formId: string): Promise<void> => {
  await apiClient.delete<DeleteFormResponse>(`/forms/${formId}`);
};

/**
 * Duplicate an existing form
 */
export const duplicateForm = async (formId: string, data: DuplicateFormDto): Promise<Form> => {
  const response = await apiClient.post<CreateFormResponse>(`/forms/${formId}/duplicate`, data);
  return response.data.form;
};

/**
 * Publish a form
 */
export const publishForm = async (formId: string, data?: PublishFormDto): Promise<Form> => {
  const response = await apiClient.post<PublishFormResponse>(`/forms/${formId}/publish`, data);
  return response.data.form;
};

/**
 * Unpublish a form
 */
export const unpublishForm = async (formId: string): Promise<Form> => {
  const response = await apiClient.post<UpdateFormResponse>(`/forms/${formId}/unpublish`);
  return response.data.form;
};

// ============================================================================
// Form Analytics
// ============================================================================

/**
 * Get form analytics for a specific form
 */
export const getFormAnalytics = async (
  formId: string,
  period?: { start: string; end: string },
): Promise<FormAnalyticsResponse> => {
  const params = new URLSearchParams();
  if (period?.start) params.append('start', period.start);
  if (period?.end) params.append('end', period.end);

  const endpoint = `/forms/${formId}/analytics${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await apiClient.get<FormAnalyticsResponse>(endpoint);
  return response.data;
};

/**
 * Get aggregate analytics for all user forms
 */
export const getUserFormAnalytics = async (period?: {
  start: string;
  end: string;
}): Promise<{
  totalForms: number;
  totalSubmissions: number;
  totalViews: number;
  averageConversionRate: number;
  topForms: Array<{
    id: string;
    title: string;
    submissions: number;
    views: number;
    conversionRate: number;
  }>;
}> => {
  const params = new URLSearchParams();
  if (period?.start) params.append('start', period.start);
  if (period?.end) params.append('end', period.end);

  const endpoint = `/forms/analytics${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await apiClient.get<{
    totalForms: number;
    totalSubmissions: number;
    totalViews: number;
    averageConversionRate: number;
    topForms: Array<{
      id: string;
      title: string;
      submissions: number;
      views: number;
      conversionRate: number;
    }>;
  }>(endpoint);
  return response.data;
};

// ============================================================================
// Form Templates
// ============================================================================

/**
 * Get available form templates
 */
export const getFormTemplates = async (): Promise<FormTemplate[]> => {
  const response = await apiClient.get<FormTemplate[]>('/forms/templates');
  return response.data;
};

/**
 * Create form from template
 */
export const createFormFromTemplate = async (templateId: string, title: string): Promise<Form> => {
  const response = await apiClient.post<CreateFormResponse>(`/forms/templates/${templateId}`, {
    title,
  });
  return response.data.form;
};

// ============================================================================
// Form Sharing
// ============================================================================

/**
 * Get form public URL
 */
export const getFormPublicUrl = async (formId: string): Promise<string> => {
  const response = await apiClient.get<{ url: string }>(`/forms/${formId}/public-url`);
  return response.data.url;
};

/**
 * Generate form embed code
 */
export const getFormEmbedCode = async (
  formId: string,
  options?: {
    width?: string;
    height?: string;
    theme?: 'light' | 'dark' | 'auto';
  },
): Promise<string> => {
  const response = await apiClient.post<{ embedCode: string }>(`/forms/${formId}/embed`, options);
  return response.data.embedCode;
};

// ============================================================================
// Bulk Operations
// ============================================================================

/**
 * Bulk delete forms
 */
export const bulkDeleteForms = async (formIds: string[]): Promise<void> => {
  await apiClient.post('/forms/bulk-delete', { formIds });
};

/**
 * Bulk update form status
 */
export const bulkUpdateFormStatus = async (
  formIds: string[],
  status: 'published' | 'draft' | 'archived',
): Promise<void> => {
  await apiClient.post('/forms/bulk-update-status', { formIds, status });
};

// ============================================================================
// Form Search
// ============================================================================

/**
 * Search forms with advanced filters
 */
export const searchForms = async (
  query: string,
  filters?: {
    status?: string[];
    dateRange?: { start: string; end: string };
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  },
): Promise<FormListResponse> => {
  const params = new URLSearchParams();
  params.append('q', query);

  if (filters?.status) {
    filters.status.forEach((status) => params.append('status', status));
  }
  if (filters?.dateRange?.start) params.append('dateFrom', filters.dateRange.start);
  if (filters?.dateRange?.end) params.append('dateTo', filters.dateRange.end);
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.offset) params.append('offset', filters.offset.toString());

  const response = await apiClient.get<FormListResponse>(`/forms/search?${params.toString()}`);
  return response.data;
};
