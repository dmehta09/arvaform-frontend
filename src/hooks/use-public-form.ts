'use client';

import {
  canFormAcceptSubmissions,
  getPublicForm,
  isFormAccessibleFromDomain,
  type PublicForm,
} from '@/lib/api/public-forms';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

// Hook state interface
interface UsePublicFormState {
  form: PublicForm | null;
  isLoading: boolean;
  error: string | null;
  isAccessible: boolean;
  canSubmit: boolean;
  retryCount: number;
}

// Hook return interface
interface UsePublicFormReturn extends UsePublicFormState {
  refetch: () => Promise<void>;
  clearError: () => void;
  isFormValid: boolean;
  estimatedDuration: string | null;
  submissionStatus: {
    current: number;
    max: number | null;
    percentage: number | null;
    remaining: number | null;
  };
}

// Hook options
interface UsePublicFormOptions {
  formSlug: string;
  initialData?: PublicForm | null;
  enablePolling?: boolean;
  pollingInterval?: number;
  maxRetries?: number;
  onError?: (error: string) => void;
  onFormLoaded?: (form: PublicForm) => void;
}

/**
 * Custom hook for managing public form state with comprehensive error handling
 * and optimistic updates following React 19 best practices
 */
export function usePublicForm(options: UsePublicFormOptions): UsePublicFormReturn {
  const {
    formSlug,
    initialData = null,
    enablePolling = false,
    pollingInterval = 30000, // 30 seconds
    maxRetries = 3,
    onError,
    onFormLoaded,
  } = options;

  const router = useRouter();

  // Main state management
  const [state, setState] = useState<UsePublicFormState>({
    form: initialData,
    isLoading: !initialData,
    error: null,
    isAccessible: true,
    canSubmit: true,
    retryCount: 0,
  });

  console.log('[usePublicForm] Hook initialized for form:', formSlug);

  // Memoized computed values for better performance
  const computedValues = useMemo(() => {
    const { form } = state;

    if (!form) {
      return {
        isFormValid: false,
        estimatedDuration: null,
        submissionStatus: {
          current: 0,
          max: null,
          percentage: null,
          remaining: null,
        },
      };
    }

    // Calculate submission status
    const submissionStatus = {
      current: form.currentSubmissions,
      max: form.maxSubmissions || null,
      percentage: form.maxSubmissions
        ? Math.round((form.currentSubmissions / form.maxSubmissions) * 100)
        : null,
      remaining: form.maxSubmissions
        ? Math.max(0, form.maxSubmissions - form.currentSubmissions)
        : null,
    };

    // Format estimated duration
    const estimatedDuration = form.estimatedDuration
      ? form.estimatedDuration < 60
        ? `${form.estimatedDuration} min`
        : `${Math.round(form.estimatedDuration / 60)}h ${form.estimatedDuration % 60}m`
      : null;

    return {
      isFormValid: form.elements && form.elements.length > 0,
      estimatedDuration,
      submissionStatus,
    };
  }, [state]);

  // Fetch form data with comprehensive error handling
  const fetchForm = useCallback(
    async (isRetry = false) => {
      try {
        console.log('[usePublicForm] Fetching form data...', {
          isRetry,
          retryCount: state.retryCount,
        });

        // Don't show loading on retries to avoid UI flicker
        if (!isRetry) {
          setState((prev) => ({ ...prev, isLoading: true, error: null }));
        }

        const formData = await getPublicForm(formSlug);

        if (!formData) {
          // Form not found - redirect to 404
          console.warn('[usePublicForm] Form not found, redirecting to 404');
          router.push('/404');
          return;
        }

        // Check domain access
        const isAccessible = isFormAccessibleFromDomain(formData);
        const canSubmit = canFormAcceptSubmissions(formData);

        console.log('[usePublicForm] Form data fetched successfully:', {
          id: formData.id,
          title: formData.title,
          isAccessible,
          canSubmit,
        });

        setState((prev) => ({
          ...prev,
          form: formData,
          isLoading: false,
          error: null,
          isAccessible,
          canSubmit,
          retryCount: 0,
        }));

        // Call success callback
        onFormLoaded?.(formData);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load form';
        console.error('[usePublicForm] Error fetching form:', errorMessage);

        // Handle rate limiting specifically
        if (errorMessage.includes('Rate limit')) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: 'Too many requests. Please wait a moment before trying again.',
          }));
          onError?.(errorMessage);
          return;
        }

        // Retry logic for network errors
        if (state.retryCount < maxRetries && !errorMessage.includes('not found')) {
          console.log('[usePublicForm] Retrying fetch...', { retryCount: state.retryCount + 1 });

          setState((prev) => ({ ...prev, retryCount: prev.retryCount + 1 }));

          // Exponential backoff
          const delay = Math.pow(2, state.retryCount) * 1000;
          setTimeout(() => fetchForm(true), delay);
          return;
        }

        // Final error state
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        onError?.(errorMessage);
      }
    },
    [formSlug, state.retryCount, maxRetries, router, onFormLoaded, onError],
  );

  // Public refetch function
  const refetch = useCallback(async () => {
    setState((prev) => ({ ...prev, retryCount: 0 }));
    await fetchForm(false);
  }, [fetchForm]);

  // Clear error function
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Initial fetch effect
  useEffect(() => {
    // Only fetch if we don't have initial data
    if (!initialData) {
      fetchForm(false);
    } else {
      // Update computed values for initial data
      const isAccessible = isFormAccessibleFromDomain(initialData);
      const canSubmit = canFormAcceptSubmissions(initialData);

      setState((prev) => ({
        ...prev,
        isAccessible,
        canSubmit,
      }));
    }
  }, [initialData, fetchForm]);

  // Polling effect for real-time updates
  useEffect(() => {
    if (!enablePolling || !state.form || state.isLoading) {
      return;
    }

    console.log('[usePublicForm] Starting polling with interval:', pollingInterval);

    const intervalId = setInterval(() => {
      // Only poll if tab is visible for performance
      if (typeof document !== 'undefined' && !document.hidden) {
        fetchForm(true); // Silent refetch
      }
    }, pollingInterval);

    return () => {
      console.log('[usePublicForm] Stopping polling');
      clearInterval(intervalId);
    };
  }, [enablePolling, pollingInterval, state.form, state.isLoading, fetchForm]);

  // Visibility change handler for efficient polling
  useEffect(() => {
    if (!enablePolling) return;

    const handleVisibilityChange = () => {
      if (!document.hidden && state.form) {
        // Refetch when tab becomes visible
        fetchForm(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enablePolling, state.form, fetchForm]);

  return {
    ...state,
    ...computedValues,
    refetch,
    clearError,
  };
}

/**
 * Simplified hook for basic public form fetching without advanced features
 */
export function usePublicFormSimple(formSlug: string, initialData?: PublicForm | null) {
  return usePublicForm({
    formSlug,
    initialData,
    enablePolling: false,
    maxRetries: 1,
  });
}
