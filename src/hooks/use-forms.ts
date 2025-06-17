/**
 * Custom hooks for form management
 *
 * Provides React Query hooks for form operations with optimistic updates,
 * error handling, and proper cache management.
 */

import {
  bulkDeleteForms,
  createForm,
  deleteForm,
  duplicateForm,
  getForm,
  getForms,
  getUserFormAnalytics,
  publishForm,
  searchForms,
  unpublishForm,
  updateForm,
} from '@/lib/api/forms';
import { queryKeys } from '@/lib/query-client';
import type {
  CreateFormDto,
  DuplicateFormDto,
  FormFilters,
  FormListItem,
  FormListResponse,
  GetFormResponse,
  UpdateFormDto,
} from '@/types/form.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// ============================================================================
// Form List Hooks
// ============================================================================

/**
 * Hook to fetch forms with filtering and pagination
 */
export const useForms = (filters?: FormFilters) => {
  return useQuery({
    queryKey: queryKeys.forms.list((filters || {}) as Record<string, unknown>),
    queryFn: () => getForms(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for real-time form search with debouncing
 */
export const useFormSearch = (query: string, filters?: Partial<FormFilters>) => {
  // Convert FormFilters to the search API format
  const searchFilters = filters
    ? {
        status: filters.status ? [filters.status] : undefined,
        dateRange:
          filters.dateFrom && filters.dateTo
            ? {
                start: filters.dateFrom,
                end: filters.dateTo,
              }
            : undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      }
    : undefined;

  return useQuery({
    queryKey: ['forms', 'search', query, searchFilters],
    queryFn: () => searchForms(query, searchFilters),
    enabled: query.length >= 2, // Only search when query is at least 2 characters
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to fetch a single form by ID
 */
export const useForm = (formId: string) => {
  return useQuery({
    queryKey: queryKeys.forms.detail(formId),
    queryFn: () => getForm(formId),
    enabled: !!formId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch user analytics for dashboard overview
 */
export const useUserAnalytics = (period?: { start: string; end: string }) => {
  return useQuery({
    queryKey: ['analytics', 'user', period],
    queryFn: () => getUserFormAnalytics(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// ============================================================================
// Form Mutation Hooks
// ============================================================================

/**
 * Hook to create a new form with optimistic updates
 */
export const useCreateForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createForm,
    onMutate: async (newForm: CreateFormDto) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.forms.all });

      // Snapshot the previous value
      const previousForms = queryClient.getQueryData(queryKeys.forms.lists());

      // Optimistically update the cache
      const tempForm: FormListItem = {
        id: `temp-${Date.now()}`,
        title: newForm.title,
        description: newForm.description,
        status: 'draft',
        isPublished: false,
        submissions: 0,
        views: 0,
        conversionRate: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData(queryKeys.forms.lists(), (old: FormListResponse | undefined) => {
        if (!old) return { forms: [tempForm], total: 1, page: 1, limit: 20 };
        return {
          ...old,
          forms: [tempForm, ...old.forms],
          total: old.total + 1,
        };
      });

      return { previousForms };
    },
    onError: (err, newForm, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousForms) {
        queryClient.setQueryData(queryKeys.forms.lists(), context.previousForms);
      }
    },
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.forms.all });
      queryClient.setQueryData(queryKeys.forms.detail(data.id), { form: data });
    },
  });
};

/**
 * Hook to update a form with optimistic updates
 */
export const useUpdateForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ formId, data }: { formId: string; data: UpdateFormDto }) =>
      updateForm(formId, data),
    onMutate: async ({ formId, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.forms.detail(formId) });

      // Snapshot the previous value
      const previousForm = queryClient.getQueryData(queryKeys.forms.detail(formId));

      // Optimistically update the cache
      queryClient.setQueryData(
        queryKeys.forms.detail(formId),
        (old: GetFormResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            form: {
              ...old.form,
              ...data,
              updatedAt: new Date().toISOString(),
            },
          };
        },
      );

      return { previousForm };
    },
    onError: (err, { formId }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousForm) {
        queryClient.setQueryData(queryKeys.forms.detail(formId), context.previousForm);
      }
    },
    onSuccess: (data) => {
      // Update the form detail cache
      queryClient.setQueryData(queryKeys.forms.detail(data.id), { form: data });
      // Invalidate the forms list to reflect the update
      queryClient.invalidateQueries({ queryKey: queryKeys.forms.lists() });
    },
  });
};

/**
 * Hook to delete a form with optimistic updates
 */
export const useDeleteForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteForm,
    onMutate: async (formId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.forms.all });

      // Snapshot the previous value
      const previousForms = queryClient.getQueryData(queryKeys.forms.lists());

      // Optimistically remove the form from the cache
      queryClient.setQueryData(queryKeys.forms.lists(), (old: FormListResponse | undefined) => {
        if (!old) return old;
        return {
          ...old,
          forms: old.forms.filter((form: FormListItem) => form.id !== formId),
          total: old.total - 1,
        };
      });

      // Remove the individual form from cache
      queryClient.removeQueries({ queryKey: queryKeys.forms.detail(formId) });

      return { previousForms };
    },
    onError: (err, formId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousForms) {
        queryClient.setQueryData(queryKeys.forms.lists(), context.previousForms);
      }
    },
    onSuccess: () => {
      // Invalidate forms list
      queryClient.invalidateQueries({ queryKey: queryKeys.forms.all });
    },
  });
};

/**
 * Hook to duplicate a form
 */
export const useDuplicateForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ formId, data }: { formId: string; data: DuplicateFormDto }) =>
      duplicateForm(formId, data),
    onSuccess: (newForm) => {
      // Add the new form to the cache
      queryClient.setQueryData(queryKeys.forms.detail(newForm.id), { form: newForm });
      // Invalidate the forms list to include the new form
      queryClient.invalidateQueries({ queryKey: queryKeys.forms.lists() });
    },
  });
};

/**
 * Hook to publish/unpublish a form
 */
export const useToggleFormPublish = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ formId, publish }: { formId: string; publish: boolean }) =>
      publish ? publishForm(formId) : unpublishForm(formId),
    onMutate: async ({ formId, publish }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.forms.detail(formId) });

      // Snapshot the previous value
      const previousForm = queryClient.getQueryData(queryKeys.forms.detail(formId));

      // Optimistically update the cache
      queryClient.setQueryData(
        queryKeys.forms.detail(formId),
        (old: GetFormResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            form: {
              ...old.form,
              isPublished: publish,
              status: publish ? 'published' : 'draft',
              publishedAt: publish ? new Date().toISOString() : old.form.publishedAt,
              updatedAt: new Date().toISOString(),
            },
          };
        },
      );

      return { previousForm };
    },
    onError: (err, { formId }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousForm) {
        queryClient.setQueryData(queryKeys.forms.detail(formId), context.previousForm);
      }
    },
    onSuccess: (data) => {
      // Update the form detail cache
      queryClient.setQueryData(queryKeys.forms.detail(data.id), { form: data });
      // Invalidate the forms list to reflect the update
      queryClient.invalidateQueries({ queryKey: queryKeys.forms.lists() });
    },
  });
};

/**
 * Hook for bulk operations
 */
export const useBulkDeleteForms = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkDeleteForms,
    onSuccess: () => {
      // Invalidate all form-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.forms.all });
    },
  });
};

/**
 * Hook to prefetch a form for better UX
 */
export const usePrefetchForm = () => {
  const queryClient = useQueryClient();

  return (formId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.forms.detail(formId),
      queryFn: () => getForm(formId),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };
};
