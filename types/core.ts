// Tipos principais do sistema - Interfaces unificadas
// Este arquivo contém as interfaces principais usadas em todo o projeto

// ============================================================================
// TIPOS BÁSICOS
// ============================================================================

export type InventoryAction = "create" | "update" | "delete" | "move";

export type UserRole = "admin global" | "admin" | "member";

export type CommissionRole = "Presidente" | "Membro" | "Secretário";

export type ConservationState = "NOVO" | "BOM" | "REGULAR" | "RUIM" | "INSERVIVEL";

export type ItemStatus = "ATIVO" | "EM_USO" | "BAIXA_SOLICITADA" | "BAIXADO";

// ============================================================================
// INTERFACES PRINCIPAIS
// ============================================================================

// Usuário básico
export interface User {
  id: string;
  name: string;
  email: string;
  status: boolean;
}

// Perfil completo do usuário
export interface UserProfile {
  id: string; // corresponde a auth.users.id
  name: string;
  email: string;
  description: string;
  role: UserRole; // papel no sistema
  avatar: string | null;
  active: boolean;
}

// Usuário permitido no sistema
export interface AllowedUser {
  id: string;
  name: string;
  email: string;
  status: boolean; // true = "ativo", false = "inativo"
}

// Organização
export interface Organization {
  id: string;
  name: string;
  shortName: string;
  active: boolean;
}

// Membro de organização
export interface OrganizationMember {
  userId: string;
  organizationId: string;
  role: UserRole;
}

// Campus
export interface Campus {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  active: boolean;
}

// Membro de campus
export interface CampusMember {
  userId: string;
  campusId: string;
}

// Comissão
export interface Commission {
  id: string;
  campusId: string;
  name: string;
  type: string;
  description?: string;
  spreadsheet_url?: string;
  active: boolean;
  year: number;
}

// Membro de comissão
export interface CommissionMember {
  userId: string;
  commissionId: string;
  roleInCommission: CommissionRole;
}

// Item de inventário
export interface InventoryItem {
  id: string;
  commissionId: string;
  campusId: string;
  number: string;
  description: string;
  brandModel?: string;
  currentResponsibility?: string;
  conservationState?: ConservationState;
  location?: string;
  tags: string[];
  ed?: string;
  updatedAt: string | Date;
  sector?: string;
}

// Histórico de inventário
export interface InventoryHistory {
  id: string;
  inventoryItemId: string;
  userId: string;
  action: InventoryAction;
  changes?: string;
  observation?: string;
  image_url: string[];
  timestamp: string | Date;
}

// ============================================================================
// INTERFACES COM RELACIONAMENTOS
// ============================================================================

// Histórico com relacionamentos
export interface InventoryHistoryWithRelations extends InventoryHistory {
  inventoryItem?: InventoryItemWithRelations;
  user?: UserProfile;
}

// Comissão com relacionamentos
export interface CommissionWithRelations extends Commission {
  campus?: Campus;
  members?: (CommissionMember & {
    user?: UserProfile;
  })[];
}

// Campus com relacionamentos
export interface CampusWithRelations extends Campus {
  organization?: Organization;
  commissions?: Commission[];
}

// Perfil de usuário com relacionamentos
export interface UserProfileWithRelations extends UserProfile {
  organizationMembers?: (OrganizationMember & {
    organization?: Organization;
  })[];
  campusMembers?: (CampusMember & {
    campus?: Campus;
  })[];
  commissionMembers?: (CommissionMember & {
    commission?: Commission;
  })[];
}

// Item de inventário com relacionamentos
export interface InventoryItemWithRelations extends InventoryItem {
  campus: Campus;
  commission: Commission;
}

// ============================================================================
// METADADOS E CONFIGURAÇÕES
// ============================================================================

// Metadados de inventário
export interface InventoryMetadata {
  fileName: string;
  timestamp: string;
  recordCount: number;
  usedAcceleration: boolean;
  syncStatus?: "synced" | "pending" | "unknown" | "syncing";
  lastSyncUpdate?: string;
  commissionId?: string;
  campusId?: string;
  fileSize?: number;
  processingTime?: number;
  errorCount?: number;
  successCount?: number;
  skippedCount?: number;
  totalItems?: number;
  lastSyncInfo?: any;
  pendingCount?: number;
}

// Configurações do sistema
export interface Setting {
  id: string;
  key: string;
  value: string;
  description?: string | null;
  updated_at: Date;
  created_at: Date;
}