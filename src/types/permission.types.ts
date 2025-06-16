/**
 * Permission & RBAC Types for ArvaForm Frontend
 *
 * These types mirror the backend permission schema and RBAC system
 * for role-based access control and organization management.
 */

// ============================================================================
// Core Permission Types
// ============================================================================

export type PermissionAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "publish"
  | "manage"
  | "view"
  | "edit";
export type PermissionResource =
  | "form"
  | "submission"
  | "user"
  | "organization"
  | "role"
  | "integration"
  | "analytics"
  | "billing";
export type ContextType = "global" | "organization" | "form" | "submission";

// ============================================================================
// Permission Types
// ============================================================================

export interface Permission {
  id: string;
  name: string; // Unique permission name
  description: string;
  category: string; // Permission category
  resource: PermissionResource;
  actions: PermissionAction[];

  // Metadata
  isSystemPermission: boolean;
  isDeprecated: boolean;

  // Timestamps
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface PermissionCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
  order: number;
  permissions: Permission[];
}

// ============================================================================
// Role Types
// ============================================================================

export interface Role {
  id: string;
  name: string; // Unique role name
  description: string;
  permissions: string[]; // Permission IDs
  isSystemRole: boolean; // System vs custom role
  organizationId?: string; // Organization-specific role

  // Role metadata
  color?: string;
  icon?: string;
  isDefault?: boolean; // Default role for new users

  // Hierarchy
  parentRoleId?: string;
  level: number; // 0 = highest level

  // Timestamps
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface RoleHierarchy {
  role: Role;
  parent?: RoleHierarchy;
  children: RoleHierarchy[];
  inheritedPermissions: string[]; // Permission IDs
}

// ============================================================================
// User Permission Types
// ============================================================================

export interface UserPermissionContext {
  type: ContextType;
  resourceId?: string; // Specific resource ID
  organizationId?: string;
}

export interface UserPermissionConstraints {
  timeRange?: {
    start: string; // ISO date string
    end: string; // ISO date string
  };
  ipWhitelist?: string[];
  conditions?: Record<string, unknown>;
  maxUsage?: number; // Usage limit
  currentUsage?: number;
}

export interface UserPermission {
  id: string;
  userId: string; // User reference
  roleId?: string; // Role reference
  permissionId?: string; // Direct permission
  organizationId?: string; // Organization context
  resourceId?: string; // Specific resource

  // Contextual Permissions
  context: UserPermissionContext;

  // Permission Constraints
  constraints?: UserPermissionConstraints;

  // Grant information
  grantedBy: string; // User ID who granted permission
  grantedAt: string; // ISO date string
  expiresAt?: string; // ISO date string

  // Status
  isActive: boolean;
  reason?: string; // Reason for grant/revoke

  // Timestamps
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// ============================================================================
// Organization Types
// ============================================================================

export interface OrganizationSettings {
  allowUserRegistration: boolean;
  defaultUserRole: string; // Role ID
  maxUsers?: number;
  features: string[];

  // Branding
  logo?: string;
  primaryColor?: string;
  customDomain?: string;

  // Security
  enforceSSO?: boolean;
  passwordPolicy?: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
    maxAge?: number; // days
  };

  // Compliance
  dataRetentionDays?: number;
  requireTwoFactor?: boolean;
  allowedEmailDomains?: string[];
}

export interface OrganizationSubscription {
  plan: string;
  status: string;
  billingEmail: string;
  stripeCustomerId?: string;
  trialEndsAt?: string; // ISO date string

  // Usage limits
  limits: {
    users: number;
    forms: number;
    submissions: number;
    storage: number; // GB
  };

  // Current usage
  usage: {
    users: number;
    forms: number;
    submissions: number;
    storage: number; // GB
  };
}

export interface OrganizationMember {
  userId: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  role: string; // Role ID
  roleDetails?: Role;
  joinedAt: string; // ISO date string
  invitedBy?: string; // User ID
  status: "active" | "pending" | "suspended";

  // Last activity
  lastSeenAt?: string; // ISO date string
  lastActionAt?: string; // ISO date string
}

export interface Organization {
  id: string;
  name: string;
  slug: string; // Unique identifier
  description?: string;

  // Organization Settings
  settings: OrganizationSettings;

  // Subscription
  subscription: OrganizationSubscription;

  // Members
  members: OrganizationMember[];
  memberCount: number;

  // Owner information
  createdBy: string; // User ID
  owner?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };

  // Status
  status: "active" | "suspended" | "deleted";

  // Timestamps
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// ============================================================================
// Permission Check Types
// ============================================================================

export interface PermissionCheckRequest {
  userId: string;
  permission: string;
  resource?: PermissionResource;
  resourceId?: string;
  organizationId?: string;
  context?: Record<string, unknown>;
}

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  source: "role" | "direct" | "inherited" | "system";
  expiresAt?: string; // ISO date string
  constraints?: UserPermissionConstraints;
}

export interface BulkPermissionCheckRequest {
  userId: string;
  checks: Array<{
    permission: string;
    resource?: PermissionResource;
    resourceId?: string;
  }>;
  organizationId?: string;
}

export interface BulkPermissionCheckResult {
  results: Record<string, PermissionCheckResult>;
  userId: string;
  checkedAt: string; // ISO date string
}

// ============================================================================
// Permission Management DTOs
// ============================================================================

export interface CreateRoleDto {
  name: string;
  description: string;
  permissions: string[]; // Permission IDs
  organizationId?: string;
  parentRoleId?: string;
  color?: string;
  icon?: string;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissions?: string[]; // Permission IDs
  color?: string;
  icon?: string;
  isDefault?: boolean;
}

export interface GrantPermissionDto {
  userId: string;
  roleId?: string;
  permissionId?: string;
  resourceId?: string;
  organizationId?: string;
  context?: UserPermissionContext;
  constraints?: UserPermissionConstraints;
  expiresAt?: string; // ISO date string
  reason?: string;
}

export interface RevokePermissionDto {
  userPermissionId: string;
  reason?: string;
}

export interface InviteUserDto {
  email: string;
  roleId: string;
  organizationId: string;
  message?: string;
  expiresAt?: string; // ISO date string
}

export interface UpdateMemberDto {
  userId: string;
  roleId?: string;
  status?: "active" | "suspended";
}

// ============================================================================
// Permission Context & State Types
// ============================================================================

export interface PermissionContext {
  user: {
    id: string;
    email: string;
    organizationIds: string[];
  };
  currentOrganization?: Organization;
  userPermissions: UserPermission[];
  effectivePermissions: Set<string>; // Permission names
  roles: Role[];
}

export interface PermissionState {
  permissions: Permission[];
  roles: Role[];
  userPermissions: UserPermission[];
  organizations: Organization[];
  currentOrganization?: Organization;
  isLoading: boolean;
  errors: string[];
}

export interface PermissionActions {
  // Permission checks
  checkPermission: (
    permission: string,
    resource?: string,
    resourceId?: string,
  ) => boolean;
  checkMultiplePermissions: (permissions: string[]) => Record<string, boolean>;

  // Role management
  createRole: (roleData: CreateRoleDto) => Promise<Role>;
  updateRole: (roleId: string, updates: UpdateRoleDto) => Promise<Role>;
  deleteRole: (roleId: string) => Promise<void>;

  // Permission granting
  grantPermission: (grant: GrantPermissionDto) => Promise<UserPermission>;
  revokePermission: (revoke: RevokePermissionDto) => Promise<void>;

  // Organization management
  inviteUser: (invite: InviteUserDto) => Promise<void>;
  updateMember: (update: UpdateMemberDto) => Promise<OrganizationMember>;
  removeMember: (userId: string, organizationId: string) => Promise<void>;

  // Organization switching
  switchOrganization: (organizationId: string) => Promise<void>;

  // State management
  refreshPermissions: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  addError: (error: string) => void;
  clearErrors: () => void;
}

// ============================================================================
// Permission Lists & Responses
// ============================================================================

export interface PermissionListResponse {
  permissions: Permission[];
  categories: PermissionCategory[];
}

export interface RoleListResponse {
  roles: Role[];
  total: number;
  page: number;
  limit: number;
}

export interface UserPermissionListResponse {
  userPermissions: UserPermission[];
  total: number;
  page: number;
  limit: number;
}

export interface OrganizationListResponse {
  organizations: Organization[];
  total: number;
  page: number;
  limit: number;
}

export interface OrganizationMemberListResponse {
  members: OrganizationMember[];
  total: number;
  page: number;
  limit: number;
}

// ============================================================================
// Permission Audit Types
// ============================================================================

export interface PermissionAuditLog {
  id: string;
  action: "grant" | "revoke" | "modify" | "expire";
  actorId: string; // Who performed the action
  actor?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  targetUserId: string; // Who was affected
  targetUser?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  permissionId?: string;
  roleId?: string;
  organizationId?: string;
  resourceId?: string;

  // Change details
  changes: {
    before?: unknown;
    after?: unknown;
  };

  // Context
  reason?: string;
  ipAddress?: string;
  userAgent?: string;

  // Timestamps
  timestamp: string; // ISO date string
}

export interface PermissionAuditFilters {
  actorId?: string;
  targetUserId?: string;
  action?: "grant" | "revoke" | "modify" | "expire";
  permissionId?: string;
  roleId?: string;
  organizationId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

// ============================================================================
// Permission Templates & Presets
// ============================================================================

export interface PermissionTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  permissions: string[]; // Permission IDs
  isSystemTemplate: boolean;

  // Template metadata
  usageCount: number;
  lastUsed?: string; // ISO date string

  // Organization specific
  organizationId?: string;
}

export interface RolePreset {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  permissions: string[]; // Permission IDs
  isPopular: boolean;
  category: "basic" | "advanced" | "custom";

  // Usage statistics
  usageCount: number;
  organizations: string[]; // Organization IDs using this preset
}

// ============================================================================
// API Response Types
// ============================================================================

export interface GetPermissionsResponse {
  permissions: Permission[];
  categories: PermissionCategory[];
}

export interface GetRolesResponse {
  roles: Role[];
}

export interface GetUserPermissionsResponse {
  userPermissions: UserPermission[];
  effectivePermissions: string[];
}

export interface GetOrganizationResponse {
  organization: Organization;
}

export interface CheckPermissionResponse {
  allowed: boolean;
  reason?: string;
  expiresAt?: string;
}

export interface InviteUserResponse {
  invitation: {
    id: string;
    email: string;
    roleId: string;
    organizationId: string;
    expiresAt: string;
    inviteUrl: string;
  };
}

// ============================================================================
// Type Guards
// ============================================================================

/* eslint-disable @typescript-eslint/no-explicit-any */
export const isPermission = (obj: unknown): obj is Permission => {
  return (
    obj !== null &&
    typeof obj === "object" &&
    typeof (obj as any).id === "string" &&
    typeof (obj as any).name === "string" &&
    Array.isArray((obj as any).actions)
  );
};

export const isRole = (obj: unknown): obj is Role => {
  return (
    obj !== null &&
    typeof obj === "object" &&
    typeof (obj as any).id === "string" &&
    typeof (obj as any).name === "string" &&
    Array.isArray((obj as any).permissions)
  );
};

export const isOrganization = (obj: unknown): obj is Organization => {
  return (
    obj !== null &&
    typeof obj === "object" &&
    typeof (obj as any).id === "string" &&
    typeof (obj as any).name === "string" &&
    typeof (obj as any).slug === "string"
  );
};

/* eslint-enable @typescript-eslint/no-explicit-any */

// ============================================================================
// Utility Types
// ============================================================================

export type UserPermissionSummary = Pick<
  UserPermission,
  "id" | "roleId" | "permissionId" | "context" | "expiresAt"
>;
export type RoleBasicInfo = Pick<
  Role,
  "id" | "name" | "description" | "isSystemRole"
>;
export type OrganizationBasicInfo = Pick<
  Organization,
  "id" | "name" | "slug" | "memberCount"
>;

// ============================================================================
// Permission Constants
// ============================================================================

export const SYSTEM_PERMISSIONS = {
  // Form permissions
  FORM_CREATE: "form.create",
  FORM_READ: "form.read",
  FORM_UPDATE: "form.update",
  FORM_DELETE: "form.delete",
  FORM_PUBLISH: "form.publish",

  // Submission permissions
  SUBMISSION_READ: "submission.read",
  SUBMISSION_UPDATE: "submission.update",
  SUBMISSION_DELETE: "submission.delete",
  SUBMISSION_EXPORT: "submission.export",

  // User permissions
  USER_READ: "user.read",
  USER_UPDATE: "user.update",
  USER_DELETE: "user.delete",
  USER_INVITE: "user.invite",

  // Organization permissions
  ORG_READ: "organization.read",
  ORG_UPDATE: "organization.update",
  ORG_MANAGE: "organization.manage",
  ORG_BILLING: "organization.billing",

  // Role permissions
  ROLE_CREATE: "role.create",
  ROLE_UPDATE: "role.update",
  ROLE_DELETE: "role.delete",
  ROLE_ASSIGN: "role.assign",

  // Analytics permissions
  ANALYTICS_READ: "analytics.read",
  ANALYTICS_EXPORT: "analytics.export",

  // Integration permissions
  INTEGRATION_CREATE: "integration.create",
  INTEGRATION_UPDATE: "integration.update",
  INTEGRATION_DELETE: "integration.delete",
} as const;

export const SYSTEM_ROLES = {
  SUPER_ADMIN: "super_admin",
  ORG_ADMIN: "org_admin",
  ORG_MEMBER: "org_member",
  FORM_CREATOR: "form_creator",
  FORM_VIEWER: "form_viewer",
  GUEST: "guest",
} as const;
