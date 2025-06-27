export type InventoryAction = "create" | "update" | "delete" | "move";

export interface AllowedUser {
  id: string;
  name: string;
  email: string;
  status: boolean;
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
  avatar: string;
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
  description: string;
  spreadsheet_url: string;
  active: boolean;
  year: number;
}

export interface CommissionMember {
  userId: string;
  commissionId: string;
  roleInCommission: "presidente" | "Membro";
}

export interface InventoryItem {
  id: string;
  commissionId: string;
  campusId: string;
  number: string;
  description: string;
  brandModel: string;
  currentResponsibility: string;
  conservationState: string;
  location: string;
  tags: string[];
  ed: string;
  updatedAt: string | Date;
  sector: string;
}

export interface InventoryHistory {
  id: string;
  inventoryItemId: string;
  userId: string;
  action: InventoryAction;
  changes: string;
  observation: string;
  image_url: string[];
  timestamp: string | Date;
}
