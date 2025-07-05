// Tipos relacionados à autenticação e permissões
// Este arquivo contém todas as interfaces e tipos para autenticação e controle de acesso

import { MongoAbility } from "@casl/ability";

// ============================================================================
// TIPOS DE AÇÕES E RECURSOS
// ============================================================================

// Definição de ações possíveis no sistema
export type Actions =
  | "manage" // Pode fazer tudo
  | "create"
  | "read"
  | "update"
  | "delete"
  | "upload"
  | "download"
  | "assign"
  | "remove";

// Definição de subjects/recursos do sistema
export type Subjects =
  | "Organization"
  | "Campus"
  | "User"
  | "Commission"
  | "InventoryItem"
  | "CommissionMember"
  | "Spreadsheet"
  | "InventoryHistory"
  | "all";

// Tipo principal para habilidades usando MongoAbility
export type AppAbility = MongoAbility<[Actions, Subjects | any]>;

// ============================================================================
// INTERFACES DE AUTENTICAÇÃO
// ============================================================================

// Estado de autenticação
export interface AuthState {
  user: any;
  loading: boolean;
  error: string | null;
}

// Contexto de autenticação
export interface AuthContextType {
  user: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ data: any; error: any }>;
  updatePassword: (password: string) => Promise<{ data: any; error: any }>;
}

// ============================================================================
// INTERFACES DE PERMISSÕES
// ============================================================================

// Recursos específicos com condições
export interface ResourceWithConditions {
  id?: string;
  userId?: string;
  organizationId?: string;
  commissionId?: string;
  campusId?: string;
}

// Contexto do usuário para permissões
export interface UserContext {
  id: string;
  role: "admin global" | "admin" | "member";
  organizationMemberships: Array<{
    organizationId: string;
    role: "admin" | "member";
  }>;
  commissionMemberships: Array<{
    commissionId: string;
    roleInCommission: "Presidente" | "Membro";
    organizationId: string;
  }>;
}

// Permissões do usuário
export interface UserPermissions {
  canManageUsers: boolean;
  canManageOrganizations: boolean;
  canManageCampuses: boolean;
  canManageCommissions: boolean;
  canUploadSpreadsheets: boolean;
  canManageCommissionMembers: boolean;
  canViewInventory: boolean;
  canEditInventory: boolean;
  canDeleteInventory: boolean;
  canManageSystem: boolean;
}

// Permissões específicas de comissão
export interface CommissionAccessPermissions {
  canAccess: boolean;
  canManage: boolean;
  canUpload: boolean;
  canManageMembers: boolean;
}

// ============================================================================
// INTERFACES DE MIDDLEWARE
// ============================================================================

// Verificação de permissão
export interface PermissionCheck {
  hasPermission: boolean;
  user?: any;
  error?: string;
}

// Usuário autorizado
export interface AuthorizedUser {
  id: string;
  email: string;
  role: string;
  organizationId?: string;
  commissions?: Array<{
    id: string;
    roleInCommission: string;
  }>;
}

// ============================================================================
// INTERFACES DE ROLES E PERMISSÕES DO SISTEMA
// ============================================================================

// Role do sistema
export interface Role {
  role_id: string;
  role_name: string;
  // Relations
  permissoes?: RolePermission[];
  usuarios?: UserRoleAssignment[];
}

// Permissão do sistema
export interface Permission {
  permission_id: string;
  permission_name: string;
  description: string;
  // Relations
  roles?: RolePermission[];
}

// Relacionamento Role-Permission
export interface RolePermission {
  role_id: string;
  permission_id: string;
  // Relations
  role?: Role;
  permission?: Permission;
}

// Relacionamento User-Role
export interface UserRoleAssignment {
  user_id: string;
  role_id: string;
  // Relations
  user?: any; // Referência ao usuário
  role?: Role;
}

// ============================================================================
// TIPOS PARA VALIDAÇÃO E RESPOSTA
// ============================================================================

// Resposta segura do usuário (sem dados sensíveis)
export interface SafeUserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  isPresident?: boolean;
  organization?: {
    id: string;
    name: string;
    shortName: string;
  };
  commissions?: Array<{
    id: string;
    name: string;
    roleInCommission: string;
    campus?: any;
    campusId?: string;
  }>;
  redirectPath: string;
}