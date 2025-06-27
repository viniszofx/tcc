export interface User {
  id: string;
  name: string;
  email: string;
  status: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  active: boolean;
  profile: {
    description: string;
    image: string;
  };
}

export interface Organization {
  id: string;
  name: string;
  shortName: string;
  active: boolean;
}

export interface OrganizationMember {
  userId: string;
  organizationId: string;
  role: 'admin' | 'member';
}

export interface Campus {
  id: string;
  organizationId?: string;
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
  type: 'inventory' | string;
  description: string;
  spreadsheet_url: string | null;
  active: boolean;
  year: number;
}

export interface CommissionMember {
  userId: string;
  commissionId: string;
  roleInCommission: 'Presidente' | 'Membro' | string;
}

export interface InventoryItem {
  id: string;
  commissionId: string;
  number: string;
  description: string;
  brandModel: string;
  currentResponsibility: string;
  conservationState: 'BOM' | 'REGULAR' | 'RUIM' | string;
  location: string;
  tags: string[];
  ed: string;
  updatedAt: string; 
  sector: string;
  campusCode: string;
}

export interface InventoryHistory {
  id: string;
  inventoryItemId: string;
  userId: string;
  action: string;
  changes: Record<string, { old: string; new: string }>;
  timestamp: string;
}
