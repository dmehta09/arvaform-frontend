/**
 * User Types for ArvaForm Frontend
 *
 * These types mirror the backend user schema and authentication DTOs
 * to ensure type safety across the full-stack application.
 */

// ============================================================================
// Core User Types
// ============================================================================

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification';
export type SubscriptionPlan = 'free' | 'basic' | 'premium' | 'enterprise';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trial' | 'expired';
export type OAuthProvider = 'google' | 'github' | 'facebook' | 'microsoft';

// ============================================================================
// User Profile & Account Types
// ============================================================================

export interface UserProfile {
  avatar?: string;
  bio?: string;
  company?: string;
  jobTitle?: string;
  website?: string;
  phoneNumber?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  timezone?: string;
  language?: string;
  notifications: {
    marketing: boolean;
    security: boolean;
    updates: boolean;
  };
}

export interface OAuthProviderData {
  provider: OAuthProvider;
  providerId: string;
  email: string;
  name?: string;
  avatar?: string;
  connectedAt: string; // ISO date string
  accessToken?: string; // Encrypted
  refreshToken?: string; // Encrypted
  expiresAt?: string; // ISO date string
}

export interface UserSubscription {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart?: string; // ISO date string
  currentPeriodEnd?: string; // ISO date string
  trialEnd?: string; // ISO date string
  limits: {
    forms: number;
    submissions: number;
    storage: number; // MB
    integrations: number;
  };
  usage: {
    forms: number;
    submissions: number;
    storage: number; // MB
    integrations: number;
  };
}

// ============================================================================
// Main User Interface
// ============================================================================

export interface User {
  // Basic Information
  id: string;
  email: string;
  firstName: string;
  lastName: string;

  // Profile Information
  profile: UserProfile;

  // OAuth Integration
  oauthProviders: OAuthProviderData[];

  // Subscription Management
  subscription: UserSubscription;

  // Account Status & Security
  status: UserStatus;
  loginAttempts: number;
  lockUntil?: string; // ISO date string
  lastLoginAt?: string; // ISO date string
  lastActiveAt?: string; // ISO date string

  // Email Verification
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: string; // ISO date string

  // Two-Factor Authentication
  twoFactorEnabled: boolean;
  twoFactorBackupCodes: string[];

  // Organization Membership
  organizations: string[]; // Organization IDs

  // GDPR Compliance
  privacyPolicyAcceptedAt?: string; // ISO date string
  termsOfServiceAcceptedAt?: string; // ISO date string
  marketingOptIn?: boolean;
  dataRetentionOptOut?: boolean;

  // Soft Delete
  deletedAt?: string; // ISO date string
  deletedBy?: string; // User ID

  // Timestamps
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// ============================================================================
// User Profile DTO (for API responses)
// ============================================================================

export interface UserProfileDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
  lastLoginAt: string | null;
}

// ============================================================================
// Authentication DTOs
// ============================================================================

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// ============================================================================
// JWT & Token Types
// ============================================================================

export interface JwtPayload {
  sub: string; // User ID
  email: string;
  status: UserStatus;
  iat: number; // Issued at
  exp: number; // Expiration time
  type: 'access' | 'refresh';
  jti?: string; // Unique token identifier (refresh tokens only)
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // Seconds until access token expires
  tokenType: string; // "Bearer"
}

export interface LoginResponse extends AuthTokens {
  user: UserProfileDto;
}

// ============================================================================
// User Context Types (for auth context)
// ============================================================================

export interface UserContext {
  userId: string;
  email: string;
  status: UserStatus;
  firstName: string;
  lastName: string;
  lastLoginAt: string | null;
}

export interface AuthContextType {
  user: UserContext | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginDto) => Promise<LoginResponse>;
  register: (userData: RegisterDto) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshTokens: () => Promise<AuthTokens>;
  changePassword: (data: ChangePasswordDto) => Promise<void>;
  updateProfile: (data: UpdateProfileDto) => Promise<UserProfileDto>;
}

// ============================================================================
// User Preferences & Settings
// ============================================================================

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12' | '24';
  notifications: {
    email: {
      marketing: boolean;
      security: boolean;
      updates: boolean;
      formSubmissions: boolean;
    };
    push: {
      enabled: boolean;
      formSubmissions: boolean;
      comments: boolean;
      mentions: boolean;
    };
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'organization';
    activityTracking: boolean;
    dataCollection: boolean;
  };
}

// ============================================================================
// User Activity & Analytics
// ============================================================================

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string; // ISO date string
}

export interface UserAnalytics {
  totalForms: number;
  totalSubmissions: number;
  totalViews: number;
  conversionRate: number;
  popularForms: Array<{
    formId: string;
    title: string;
    submissions: number;
    views: number;
  }>;
  activityByDay: Array<{
    date: string;
    actions: number;
  }>;
  storageUsed: number; // MB
  lastActive: string; // ISO date string
}

// ============================================================================
// User Validation & Error Types
// ============================================================================

export interface UserValidationError {
  field: keyof User | keyof RegisterDto | keyof UpdateProfileDto;
  message: string;
  code: string;
}

export interface UserError {
  message: string;
  code: string;
  field?: string;
  timestamp: string;
}

// ============================================================================
// User State Management Types
// ============================================================================

export interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  tokens: AuthTokens | null;
  preferences: UserPreferences | null;
  analytics: UserAnalytics | null;
  errors: UserError[];
}

export interface UserActions {
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  setPreferences: (preferences: UserPreferences) => void;
  setAnalytics: (analytics: UserAnalytics) => void;
  addError: (error: UserError) => void;
  clearErrors: () => void;
  setLoading: (loading: boolean) => void;
}

// ============================================================================
// User API Response Types
// ============================================================================

export interface GetUserResponse {
  user: UserProfileDto;
}

export interface UpdateUserResponse {
  user: UserProfileDto;
}

export interface DeleteUserResponse {
  message: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export type RefreshTokenResponse = AuthTokens;

export interface LogoutResponse {
  message: string;
}

// ============================================================================
// User List & Admin Types
// ============================================================================

export interface UserListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface UserListResponse {
  users: UserListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface UserFilters {
  status?: UserStatus;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt' | 'lastLoginAt' | 'email' | 'firstName';
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// Form Validation Schemas (for frontend validation)
// ============================================================================

export interface UserValidationRules {
  email: {
    required: boolean;
    pattern: RegExp;
    message: string;
  };
  password: {
    required: boolean;
    minLength: number;
    pattern: RegExp;
    message: string;
  };
  firstName: {
    required: boolean;
    maxLength: number;
    message: string;
  };
  lastName: {
    required: boolean;
    maxLength: number;
    message: string;
  };
}

// ============================================================================
// Type Guards
// ============================================================================

export const isUser = (obj: unknown): obj is User => {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'id' in obj &&
    'email' in obj &&
    'firstName' in obj &&
    'lastName' in obj &&
    typeof (obj as User).id === 'string' &&
    typeof (obj as User).email === 'string' &&
    typeof (obj as User).firstName === 'string' &&
    typeof (obj as User).lastName === 'string'
  );
};

export const isUserProfileDto = (obj: unknown): obj is UserProfileDto => {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'id' in obj &&
    'email' in obj &&
    'firstName' in obj &&
    'lastName' in obj &&
    'status' in obj &&
    typeof (obj as UserProfileDto).id === 'string' &&
    typeof (obj as UserProfileDto).email === 'string' &&
    typeof (obj as UserProfileDto).firstName === 'string' &&
    typeof (obj as UserProfileDto).lastName === 'string' &&
    typeof (obj as UserProfileDto).status === 'string'
  );
};

export const isLoginResponse = (obj: unknown): obj is LoginResponse => {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'accessToken' in obj &&
    'refreshToken' in obj &&
    'user' in obj &&
    typeof (obj as LoginResponse).accessToken === 'string' &&
    typeof (obj as LoginResponse).refreshToken === 'string' &&
    (obj as LoginResponse).user &&
    isUserProfileDto((obj as LoginResponse).user)
  );
};

// ============================================================================
// Utility Types
// ============================================================================

export type UserWithoutPassword = Omit<User, 'password'>;
export type UserPublicProfile = Pick<User, 'id' | 'firstName' | 'lastName' | 'profile'>;
export type UserBasicInfo = Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'status'>;
