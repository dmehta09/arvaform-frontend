/**
 * TanStack Query Client Configuration for ArvaForm
 *
 * Provides optimized query client configuration with:
 * - Proper retry logic for authentication errors
 * - Optimistic caching strategies
 * - Error handling and logging
 * - Performance optimizations
 */

import { QueryClient } from '@tanstack/react-query';
import { ApiError, AuthError } from './api-client';

// ============================================================================
// Query Client Configuration
// ============================================================================

export const createQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache for 5 minutes by default
        staleTime: 5 * 60 * 1000,

        // Keep unused data in cache for 10 minutes
        gcTime: 10 * 60 * 1000,

        // Retry configuration
        retry: (failureCount, error) => {
          // Don't retry auth errors
          if (error instanceof AuthError) {
            return false;
          }

          // Don't retry validation errors
          if (error instanceof ApiError && error.status === 422) {
            return false;
          }

          // Retry up to 3 times for other errors
          return failureCount < 3;
        },

        // Retry delay with exponential backoff
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

        // Refetch on window focus for important data
        refetchOnWindowFocus: true,

        // Refetch on reconnect
        refetchOnReconnect: true,

        // Don't refetch on mount if data is fresh
        refetchOnMount: 'always',
      },

      mutations: {
        // Retry mutations on network errors
        retry: (failureCount, error) => {
          // Don't retry auth or validation errors
          if (
            error instanceof AuthError ||
            (error instanceof ApiError && error.status >= 400 && error.status < 500)
          ) {
            return false;
          }

          // Retry up to 2 times for network errors
          return failureCount < 2;
        },

        // Retry delay for mutations
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      },
    },
  });
};

// ============================================================================
// Query Keys Factory
// ============================================================================

export const queryKeys = {
  // Auth queries
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
    profile: () => [...queryKeys.auth.all, 'profile'] as const,
  },

  // Forms queries
  forms: {
    all: ['forms'] as const,
    lists: () => [...queryKeys.forms.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.forms.lists(), filters] as const,
    details: () => [...queryKeys.forms.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.forms.details(), id] as const,
  },

  // Submissions queries
  submissions: {
    all: ['submissions'] as const,
    lists: () => [...queryKeys.submissions.all, 'list'] as const,
    list: (formId: string, filters?: Record<string, unknown>) =>
      [...queryKeys.submissions.lists(), formId, filters] as const,
    details: () => [...queryKeys.submissions.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.submissions.details(), id] as const,
  },

  // Users queries (admin)
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },
};

// ============================================================================
// Query Client Instance
// ============================================================================

export const queryClient = createQueryClient();

// ============================================================================
// Error Logging
// ============================================================================

// Error logging is handled in individual queries and mutations

// ============================================================================
// Export Default
// ============================================================================

export default queryClient;
