/**
 * Authentication Provider for ArvaForm
 *
 * Provides authentication context to the entire application
 * using the useAuth hook and TanStack Query for state management.
 */

'use client';

import { useAuth } from '@/hooks/use-auth';
import type { AuthContextType } from '@/types/user.types';
import { ReactNode, createContext, useContext } from 'react';

// ============================================================================
// Authentication Context
// ============================================================================

const AuthContext = createContext<AuthContextType | null>(null);

// ============================================================================
// Authentication Provider Component
// ============================================================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

// ============================================================================
// useAuthContext Hook
// ============================================================================

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
}

// ============================================================================
// Export Default
// ============================================================================

export default AuthProvider;
