/**
 * useAuth Hook for ArvaForm Authentication
 *
 * Provides comprehensive authentication state management using TanStack Query
 * with features like:
 * - Automatic token refresh
 * - Optimistic updates
 * - Persistent authentication state
 * - Error handling and retry logic
 * - Real-time authentication status
 */

'use client';

import { authApi, AuthError, shouldRefreshToken, tokenStorage } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-client';
import type {
  AuthContextType,
  AuthTokens,
  ChangePasswordDto,
  LoginDto,
  LoginResponse,
  RegisterDto,
  UpdateProfileDto,
  UserContext,
  UserProfileDto,
} from '@/types/user.types';
import { useMutation, UseMutationResult, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';

// ============================================================================
// Authentication Hook
// ============================================================================

export const useAuth = (): AuthContextType => {
  const queryClient = useQueryClient();

  // --------------------------------------------------------------------------
  // Current User Query
  // --------------------------------------------------------------------------

  const { data: currentUser, isLoading: isUserLoading } = useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: authApi.getCurrentUser,
    enabled: !!tokenStorage.get()?.accessToken,
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: (failureCount, error) => {
      // Don't retry auth errors
      if (error instanceof AuthError) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // --------------------------------------------------------------------------
  // Token Refresh Logic
  // --------------------------------------------------------------------------

  const { mutate: refreshTokens } = useMutation({
    mutationFn: authApi.refreshToken,
    onSuccess: () => {
      // Invalidate and refetch user data with new tokens
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
    onError: (error) => {
      console.error('Token refresh failed:', error);
      tokenStorage.clear();
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
  });

  // Automatic token refresh
  useEffect(() => {
    const tokens = tokenStorage.get();

    // TODO: REMOVE THIS SUPER ADMIN CHECK BEFORE PRODUCTION!
    // Skip token refresh for super admin
    if (tokens?.accessToken?.startsWith('super-admin-token-')) {
      console.log('🚨 SKIPPING AUTO-REFRESH FOR SUPER ADMIN - REMOVE BEFORE PRODUCTION!');
      return;
    }
    // END TODO: Remove super admin check

    if (tokens && shouldRefreshToken(tokens)) {
      refreshTokens();
    }

    // Set up interval to check for token refresh
    const interval = setInterval(() => {
      const currentTokens = tokenStorage.get();

      // TODO: REMOVE THIS SUPER ADMIN CHECK BEFORE PRODUCTION!
      // Skip token refresh for super admin
      if (currentTokens?.accessToken?.startsWith('super-admin-token-')) {
        return;
      }
      // END TODO: Remove super admin check

      if (currentTokens && shouldRefreshToken(currentTokens)) {
        refreshTokens();
      }
    }, 60 * 1000); // Check every minute

    return () => clearInterval(interval);
  }, [refreshTokens]);

  // --------------------------------------------------------------------------
  // Login Mutation
  // --------------------------------------------------------------------------

  const loginMutation: UseMutationResult<LoginResponse, Error, LoginDto> = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // TODO: REMOVE THIS SUPER ADMIN CHECK BEFORE PRODUCTION!
      // Check if this is a super admin login (avoid double token storage)
      const isSuperAdminLogin = data.user && 'isSuperAdmin' in data.user && data.user.isSuperAdmin;

      if (isSuperAdminLogin) {
        console.log('🚨 SUPER ADMIN LOGIN SUCCESS - BYPASSING NORMAL TOKEN FLOW');
        // Tokens are already stored by authApi.login for super admin
        // Just set user data in cache
        queryClient.setQueryData(queryKeys.auth.user(), data.user);
        return;
      }
      // END TODO: Remove super admin check

      // Normal user login flow
      // Store tokens and update cache
      tokenStorage.set({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn,
        tokenType: data.tokenType,
      });

      // Set user data in cache
      queryClient.setQueryData(queryKeys.auth.user(), data.user);

      // Invalidate other auth queries to refresh them
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });

  // --------------------------------------------------------------------------
  // Register Mutation
  // --------------------------------------------------------------------------

  const registerMutation: UseMutationResult<LoginResponse, Error, RegisterDto> = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      // Store tokens and update cache
      tokenStorage.set({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn,
        tokenType: data.tokenType,
      });

      // Set user data in cache
      queryClient.setQueryData(queryKeys.auth.user(), data.user);

      // Invalidate other auth queries to refresh them
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
    onError: (error) => {
      console.error('Registration failed:', error);
    },
  });

  // --------------------------------------------------------------------------
  // Logout Mutation
  // --------------------------------------------------------------------------

  const logoutMutation: UseMutationResult<void, Error, void> = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear all auth data
      tokenStorage.clear();
      queryClient.removeQueries({ queryKey: queryKeys.auth.all });
      queryClient.clear(); // Clear all cached data
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      // Clear tokens even if logout fails
      tokenStorage.clear();
      queryClient.removeQueries({ queryKey: queryKeys.auth.all });
    },
  });

  // --------------------------------------------------------------------------
  // Logout All Devices Mutation
  // --------------------------------------------------------------------------

  const logoutAllMutation: UseMutationResult<void, Error, void> = useMutation({
    mutationFn: authApi.logoutAll,
    onSuccess: () => {
      // Clear all auth data
      tokenStorage.clear();
      queryClient.removeQueries({ queryKey: queryKeys.auth.all });
      queryClient.clear(); // Clear all cached data
    },
    onError: (error) => {
      console.error('Logout all failed:', error);
      // Clear tokens even if logout fails
      tokenStorage.clear();
      queryClient.removeQueries({ queryKey: queryKeys.auth.all });
    },
  });

  // --------------------------------------------------------------------------
  // Change Password Mutation
  // --------------------------------------------------------------------------

  const changePasswordMutation: UseMutationResult<void, Error, ChangePasswordDto> = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => {
      // Optionally refresh user data
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
    },
    onError: (error) => {
      console.error('Password change failed:', error);
    },
  });

  // --------------------------------------------------------------------------
  // Update Profile Mutation
  // --------------------------------------------------------------------------

  const updateProfileMutation: UseMutationResult<UserProfileDto, Error, UpdateProfileDto> =
    useMutation({
      mutationFn: authApi.updateProfile,
      onMutate: async (newData) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({ queryKey: queryKeys.auth.user() });

        // Snapshot the previous value
        const previousUser = queryClient.getQueryData<UserProfileDto>(queryKeys.auth.user());

        // Optimistically update to the new value
        if (previousUser) {
          queryClient.setQueryData<UserProfileDto>(queryKeys.auth.user(), {
            ...previousUser,
            ...newData,
          });
        }

        // Return a context object with the snapshotted value
        return { previousUser };
      },
      onError: (error, newData, context) => {
        console.error('Profile update failed:', error);

        // If the mutation fails, use the context returned from onMutate to roll back
        if (context?.previousUser) {
          queryClient.setQueryData(queryKeys.auth.user(), context.previousUser);
        }
      },
      onSettled: () => {
        // Always refetch after error or success
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
      },
    });

  // --------------------------------------------------------------------------
  // Computed Values
  // --------------------------------------------------------------------------

  const tokens = tokenStorage.get();
  const isAuthenticated = !!tokens?.accessToken && !!currentUser;

  // Ensure consistent loading state to prevent hydration mismatches
  const isLoading =
    typeof window !== 'undefined'
      ? isUserLoading ||
        loginMutation.isPending ||
        registerMutation.isPending ||
        logoutMutation.isPending
      : false;

  const user: UserContext | null = currentUser
    ? {
        userId: currentUser.id,
        email: currentUser.email,
        status: currentUser.status,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        lastLoginAt: currentUser.lastLoginAt,
      }
    : null;

  // --------------------------------------------------------------------------
  // Callback Functions
  // --------------------------------------------------------------------------

  const login = useCallback(
    async (credentials: LoginDto): Promise<LoginResponse> => {
      return new Promise((resolve, reject) => {
        loginMutation.mutate(credentials, {
          onSuccess: (data) => resolve(data),
          onError: (error) => reject(error),
        });
      });
    },
    [loginMutation],
  );

  const register = useCallback(
    async (userData: RegisterDto): Promise<LoginResponse> => {
      return new Promise((resolve, reject) => {
        registerMutation.mutate(userData, {
          onSuccess: (data) => resolve(data),
          onError: (error) => reject(error),
        });
      });
    },
    [registerMutation],
  );

  const logout = useCallback(async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      logoutMutation.mutate(undefined, {
        onSuccess: () => resolve(),
        onError: (error) => reject(error),
      });
    });
  }, [logoutMutation]);

  const logoutAll = useCallback(async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      logoutAllMutation.mutate(undefined, {
        onSuccess: () => resolve(),
        onError: (error) => reject(error),
      });
    });
  }, [logoutAllMutation]);

  const refreshTokensAsync = useCallback(async (): Promise<AuthTokens> => {
    return new Promise((resolve, reject) => {
      refreshTokens(undefined, {
        onSuccess: (data) => resolve(data),
        onError: (error) => reject(error),
      });
    });
  }, [refreshTokens]);

  const changePassword = useCallback(
    async (data: ChangePasswordDto): Promise<void> => {
      return new Promise((resolve, reject) => {
        changePasswordMutation.mutate(data, {
          onSuccess: () => resolve(),
          onError: (error) => reject(error),
        });
      });
    },
    [changePasswordMutation],
  );

  const updateProfile = useCallback(
    async (data: UpdateProfileDto): Promise<UserProfileDto> => {
      return new Promise((resolve, reject) => {
        updateProfileMutation.mutate(data, {
          onSuccess: (result) => resolve(result),
          onError: (error) => reject(error),
        });
      });
    },
    [updateProfileMutation],
  );

  // --------------------------------------------------------------------------
  // Return Auth Context
  // --------------------------------------------------------------------------

  return {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    logoutAll,
    refreshTokens: refreshTokensAsync,
    changePassword,
    updateProfile,
  };
};

// ============================================================================
// Export Default
// ============================================================================

export default useAuth;
