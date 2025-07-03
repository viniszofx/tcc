import { MongoAbility } from "@casl/ability";

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

// Tipos para recursos específicos com condições
export interface ResourceWithConditions {
  id?: string;
  userId?: string;
  organizationId?: string;
  commissionId?: string;
  campusId?: string;
}

// Interface para contexto do usuário
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
