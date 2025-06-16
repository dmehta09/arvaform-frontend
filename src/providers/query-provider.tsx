/**
 * Query Provider for ArvaForm
 *
 * Provides TanStack Query client context to the entire application
 * with development tools and proper error boundaries.
 */

'use client';

import { createQueryClient } from '@/lib/query-client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode, useState } from 'react';

// ============================================================================
// Query Provider Component
// ============================================================================

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Create query client instance (using useState to ensure it's stable)
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Show dev tools only in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  );
}

// ============================================================================
// Export Default
// ============================================================================

export default QueryProvider;
