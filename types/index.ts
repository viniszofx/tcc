// Centralized type exports for the application
// This file serves as the main entry point for all type definitions

// Import types for type guards
import type { User, Organization, Campus, Commission, InventoryItem } from './core';

// ============================================================================
// CORE SYSTEM TYPES
// ============================================================================
export * from './core';

// ============================================================================
// AUTHENTICATION AND PERMISSIONS
// ============================================================================
export type {
  Actions,
  Subjects,
  AppAbility,
  AuthState,
  AuthContextType,
  ResourceWithConditions,
  UserContext,
  UserPermissions,
  CommissionAccessPermissions,
  PermissionCheck,
  AuthorizedUser,
  Role,
  Permission,
  RolePermission,
  UserRoleAssignment,
  SafeUserResponse
} from './auth';

// ============================================================================
// API AND VALIDATION TYPES
// ============================================================================
export * from './api';

// ============================================================================
// UI COMPONENT TYPES
// ============================================================================
export * from './ui';

// ============================================================================
// CONFIGURATION AND CONSTANTS
// ============================================================================
export * from './config';

// ============================================================================
// LEGACY TYPES (for backward compatibility)
// ============================================================================
// Export legacy types with explicit naming to avoid conflicts
export type {
  EstadoConservacao,
  StatusBem,
  Usuario,
  Comissao,
  Organizacao,
  Campus as LegacyCampus,
  Responsavel,
  BemOriginal,
  BemCopia,
  Inventario,
  HistoricoBem,
  Grupo,
  Role as LegacyRole,
  Permission as LegacyPermission,
  RolePermission as LegacyRolePermission,
  UserRole as LegacyUserRole,
  Setting as LegacySetting,
  LegacyUser,
  LegacyOrganization,
  LegacyCommission,
  LegacyInventoryItem,
  LegacyInventory
} from './legacy';

// Export legacy migration functions
export {
  migrateLegacyUser,
  migrateLegacyOrganization,
  migrateLegacyCampus,
  migrateLegacyCommission
} from './legacy';

// ============================================================================
// RE-EXPORTS FOR COMMON USAGE
// ============================================================================

// Most commonly used types for easy access
export type {
  // Core entities
  User,
  UserProfile,
  Organization,
  Campus,
  Commission,
  InventoryItem,
} from './core';

// Auth types already exported above

export type {
  // API types
  ApiResponse,
  ApiError,
} from './api';

export type {
  // UI types
  Theme,
  LoadingState,
} from './ui';

export type {
  // Config types
  SystemConfig
} from './config';

// ============================================================================
// TYPE GUARDS AND UTILITIES
// ============================================================================

// Type guard for checking if a user has a specific role
export function hasRole(user: any, role: string): boolean {
  return user?.role === role || user?.papel === role;
}

// Type guard for checking if an object is a valid User
export function isUser(obj: any): obj is User {
  return obj && typeof obj.id === 'string' && typeof obj.email === 'string';
}

// Type guard for checking if an object is a valid Organization
export function isOrganization(obj: any): obj is Organization {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string';
}

// Type guard for checking if an object is a valid Campus
export function isCampus(obj: any): obj is Campus {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string' && typeof obj.organizationId === 'string';
}

// Type guard for checking if an object is a valid Commission
export function isCommission(obj: any): obj is Commission {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string' && typeof obj.campusId === 'string';
}

// Type guard for checking if an object is a valid InventoryItem
export function isInventoryItem(obj: any): obj is InventoryItem {
  return obj && typeof obj.id === 'string' && typeof obj.number === 'string';
}