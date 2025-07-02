export type InventoryAction = "create" | "update" | "delete" | "move";

export interface AllowedUser {
  id: string;
  name: string;
  email: string;
  status: boolean; // true = "ativo", false = "inativo"
}

export interface Organization {
  id: string;
  name: string;
  shortName: string;
  active: boolean;
}

export interface UserProfile {
  id: string; // corresponde a auth.users.id
  name: string;
  email: string;
  description: string;
  avatar: string | null;
  active: boolean;
}

export interface OrganizationMember {
  userId: string;
  organizationId: string;
  role: "admin" | "member";
}

export interface Campus {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  active: boolean;
}

export interface CampusMember {
  userId: string;
  campusId: string;
}

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

export interface CommissionMember {
  userId: string;
  commissionId: string;
  roleInCommission: "Presidente" | "Membro" | "Secretário";
}

export interface InventoryItem {
  id: string;
  commissionId: string;
  campusId: string;
  number: string;
  description: string;
  brandModel?: string;
  currentResponsibility?: string;
  conservationState?: string;
  location?: string;
  tags: string[];
  ed?: string;
  updatedAt: string | Date;
  sector?: string;
}

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

export interface InventoryHistoryWithRelations extends InventoryHistory {
  inventoryItem?: InventoryItemWithRelations;
  user?: UserProfile;
}

// Interfaces expandidas para incluir relacionamentos do Prisma
export interface CommissionWithRelations extends Commission {
  campus?: Campus;
  members?: (CommissionMember & {
    user?: UserProfile;
  })[];
}

export interface CampusWithRelations extends Campus {
  organization?: Organization;
  commissions?: Commission[];
}

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

export interface InventoryItemWithRelations extends InventoryItem {
  campus: Campus;
  commission: Commission;
}
