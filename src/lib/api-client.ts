/**
 * API Client for ArvaForm Frontend
 *
 * Provides a centralized API client with automatic token management,
 * refresh logic, and comprehensive error handling for use with TanStack Query.
 *
 * Features:
 * - Automatic JWT token attachment
 * - Token refresh on 401 errors
 * - Request/response interceptors
 * - Type-safe API responses
 * - Proper error handling
 */

import type {
  AuthTokens,
  ChangePasswordDto,
  ChangePasswordResponse,
  LoginDto,
  LoginResponse,
  LogoutResponse,
  RefreshTokenResponse,
  RegisterDto,
  UpdateProfileDto,
  UpdateUserResponse,
  UserProfileDto,
} from '@/types/user.types';

// ============================================================================
// Constants & Configuration
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const TOKEN_STORAGE_KEY = 'arvaform_tokens';

// ============================================================================
// Storage Utilities
// ============================================================================

export const tokenStorage = {
  get: (): AuthTokens | null => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  set: (tokens: AuthTokens | null): void => {
    if (typeof window === 'undefined') return;
    try {
      if (tokens) {
        localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
      } else {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    } catch {
      // Silently fail if storage is not available
    }
  },

  clear: (): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {
      // Silently fail if storage is not available
    }
  },
};

// ============================================================================
// API Error Classes
// ============================================================================

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public field?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class AuthError extends ApiError {
  constructor(message: string, code?: string) {
    super(message, 401, code);
    this.name = 'AuthError';
  }
}

export class ValidationError extends ApiError {
  constructor(
    message: string,
    public errors: Record<string, string[]>,
  ) {
    super(message, 422);
    this.name = 'ValidationError';
  }
}

// ============================================================================
// Request/Response Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  code?: string;
  field?: string;
  errors?: Record<string, string[]>;
  timestamp: string;
}

// ============================================================================
// Core API Client
// ============================================================================

class ApiClient {
  private baseURL: string;
  private refreshPromise: Promise<AuthTokens> | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  // --------------------------------------------------------------------------
  // Request Configuration
  // --------------------------------------------------------------------------

  private async getRequestConfig(options: RequestInit = {}): Promise<RequestInit> {
    const tokens = tokenStorage.get();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add authorization header if tokens exist
    if (tokens?.accessToken) {
      headers.Authorization = `Bearer ${tokens.accessToken}`;
    }

    return {
      ...options,
      headers,
    };
  }

  // --------------------------------------------------------------------------
  // Token Refresh Logic
  // --------------------------------------------------------------------------

  private async refreshTokens(): Promise<AuthTokens> {
    // Prevent multiple concurrent refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();

    try {
      const tokens = await this.refreshPromise;
      this.refreshPromise = null;
      return tokens;
    } catch (error) {
      this.refreshPromise = null;
      throw error;
    }
  }

  private async performTokenRefresh(): Promise<AuthTokens> {
    const currentTokens = tokenStorage.get();

    if (!currentTokens?.refreshToken) {
      throw new AuthError('No refresh token available');
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: currentTokens.refreshToken,
        }),
      });

      if (!response.ok) {
        throw new AuthError('Token refresh failed');
      }

      const result: ApiResponse<RefreshTokenResponse> = await response.json();
      const newTokens = result.data;

      // Update stored tokens
      tokenStorage.set(newTokens);

      return newTokens;
    } catch (error) {
      // Clear invalid tokens
      tokenStorage.clear();
      throw error;
    }
  }

  // --------------------------------------------------------------------------
  // HTTP Methods
  // --------------------------------------------------------------------------

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const config = await this.getRequestConfig(options);

    try {
      const response = await fetch(url, config);

      // Handle 401 errors with token refresh
      if (response.status === 401) {
        try {
          await this.refreshTokens();
          // Retry the request with new tokens
          const retryConfig = await this.getRequestConfig(options);
          const retryResponse = await fetch(url, retryConfig);

          if (!retryResponse.ok) {
            throw await this.handleErrorResponse(retryResponse);
          }

          return await retryResponse.json();
        } catch {
          // If refresh fails, clear tokens and throw auth error
          tokenStorage.clear();
          throw new AuthError('Authentication failed');
        }
      }

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Handle network errors
      throw new ApiError('Network error occurred', 0);
    }
  }

  private async handleErrorResponse(response: Response): Promise<ApiError> {
    try {
      const errorData: ApiErrorResponse = await response.json();

      if (errorData.errors) {
        return new ValidationError(errorData.message, errorData.errors);
      }

      return new ApiError(errorData.message, response.status, errorData.code, errorData.field);
    } catch {
      return new ApiError(`HTTP ${response.status}`, response.status);
    }
  }

  // Convenience methods
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// ============================================================================
// API Client Instance
// ============================================================================

export const apiClient = new ApiClient();

// ============================================================================
// Authentication API Methods
// ============================================================================

export const authApi = {
  // Login user
  login: async (credentials: LoginDto): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);

    // Store tokens after successful login
    tokenStorage.set({
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
      expiresIn: response.data.expiresIn,
      tokenType: response.data.tokenType,
    });

    return response.data;
  },

  // Register new user
  register: async (userData: RegisterDto): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/register', userData);

    // Store tokens after successful registration
    tokenStorage.set({
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
      expiresIn: response.data.expiresIn,
      tokenType: response.data.tokenType,
    });

    return response.data;
  },

  // Refresh access token
  refreshToken: async (): Promise<AuthTokens> => {
    const tokens = tokenStorage.get();
    if (!tokens?.refreshToken) {
      throw new AuthError('No refresh token available');
    }

    const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken: tokens.refreshToken,
    });

    // Update stored tokens
    tokenStorage.set(response.data);

    return response.data;
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      await apiClient.post<LogoutResponse>('/auth/logout');
    } finally {
      // Always clear tokens, even if logout request fails
      tokenStorage.clear();
    }
  },

  // Logout from all devices
  logoutAll: async (): Promise<void> => {
    try {
      await apiClient.post<LogoutResponse>('/auth/logout-all');
    } finally {
      // Always clear tokens, even if logout request fails
      tokenStorage.clear();
    }
  },

  // Get current user profile
  getCurrentUser: async (): Promise<UserProfileDto> => {
    const response = await apiClient.get<UserProfileDto>('/auth/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: UpdateProfileDto): Promise<UserProfileDto> => {
    const response = await apiClient.patch<UpdateUserResponse>('/auth/profile', data);
    return response.data.user;
  },

  // Change password
  changePassword: async (data: ChangePasswordDto): Promise<void> => {
    await apiClient.post<ChangePasswordResponse>('/auth/change-password', data);
  },
};

// ============================================================================
// Utility Functions
// ============================================================================

export const isTokenExpired = (token: string): boolean => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[1]) return true;

    const payload = JSON.parse(atob(parts[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= exp;
  } catch {
    return true;
  }
};

export const shouldRefreshToken = (tokens: AuthTokens | null): boolean => {
  if (!tokens?.accessToken) return false;

  try {
    const parts = tokens.accessToken.split('.');
    if (parts.length !== 3 || !parts[1]) return true;

    const payload = JSON.parse(atob(parts[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    const timeToExpiry = exp - now;

    // Refresh if token expires within 5 minutes
    return timeToExpiry <= 5 * 60 * 1000;
  } catch {
    return true;
  }
};

// ============================================================================
// Export Default
// ============================================================================

export default apiClient;
