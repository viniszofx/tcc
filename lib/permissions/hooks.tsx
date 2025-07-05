"use client";

import { useUserPermissions } from "@/hooks/use-consolidated-user";
import { createContext, useContext, useMemo } from "react";
import { createUserContext, defineAbilitiesFor } from "./abilities";
import { Actions, AppAbility, Subjects } from "./types";

// Context para o CASL
const AbilityContext = createContext<AppAbility | undefined>(undefined);

// Provider do CASL
export function AbilityProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUserPermissions();

  const ability = useMemo(() => {
    if (!user) {
      // Retorna ability vazia se não há usuário
      return defineAbilitiesFor({
        id: "",
        role: "member",
        organizationMemberships: [],
        commissionMemberships: [],
      });
    }

    const userContext = createUserContext(user);
    return defineAbilitiesFor(userContext);
  }, [user]);

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
}

// Hook para usar o CASL
export function useAbility(): AppAbility {
  const ability = useContext(AbilityContext);
  if (!ability) {
    throw new Error("useAbility deve ser usado dentro de um AbilityProvider");
  }
  return ability;
}

// Hook para verificar permissões específicas
export function useCan(
  action: Actions,
  subject: Subjects,
  resource?: any
): boolean {
  const ability = useAbility();
  return resource
    ? ability.can(action, subject, resource)
    : ability.can(action, subject);
}

// Hook para verificar se pode acessar uma página
export function useCanAccessPage(page: string): boolean {
  const ability = useAbility();

  switch (page) {
    case "/application/organizations":
      return (
        ability.can("read", "Organization") ||
        ability.can("manage", "Organization")
      );

    case "/application/campus":
      return ability.can("read", "Campus") || ability.can("manage", "Campus");

    case "/application/users":
      return ability.can("read", "User") || ability.can("manage", "User");

    case "/application/commissions":
      return (
        ability.can("read", "Commission") || ability.can("manage", "Commission")
      );

    default:
      return true; // Páginas não restritas
  }
}

// Componente para renderização condicional baseada em permissões
export function Can({
  action,
  subject,
  resource,
  children,
  fallback = null,
}: {
  action: Actions;
  subject: Subjects;
  resource?: any;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const canPerform = useCan(action, subject, resource);

  return canPerform ? <>{children}</> : <>{fallback}</>;
}

// Hook específico para permissões de comissão
function useCommissionPermissions() {
  const ability = useAbility();

  return {
    canAccessCommission: ability.can("read", "Commission"),
    canManageCommissions: ability.can("manage", "Commission"),
    canCreateCommissions: ability.can("create", "Commission"),
    canUploadSpreadsheets: ability.can("upload", "Spreadsheet"),
    canManageCommissionMembers: ability.can("manage", "CommissionMember"),
    canAssignCommissionMembers: ability.can("assign", "CommissionMember"),
    canRemoveCommissionMembers: ability.can("remove", "CommissionMember"),
  };
}

// Hook específico para permissões de organização
function useOrganizationPermissions() {
  const ability = useAbility();

  return {
    canManageOrganizations: ability.can("manage", "Organization"),
    canReadOrganizations: ability.can("read", "Organization"),
    canManageCampuses: ability.can("manage", "Campus"),
    canReadCampuses: ability.can("read", "Campus"),
    canManageUsers: ability.can("manage", "User"),
    canReadUsers: ability.can("read", "User"),
  };
}

// Hook específico para permissões de inventário
function useInventoryPermissions() {
  const ability = useAbility();

  return {
    canCreateInventoryItem: ability.can("create", "InventoryItem"),
    canReadInventoryItem: ability.can("read", "InventoryItem"),
    canUpdateInventoryItem: ability.can("update", "InventoryItem"),
    canDeleteInventoryItem: ability.can("delete", "InventoryItem"),
    canManageInventoryItem: ability.can("manage", "InventoryItem"),
    canReadInventoryHistory: ability.can("read", "InventoryHistory"),
    canCreateInventoryHistory: ability.can("create", "InventoryHistory"),
  };
}

export {
  useCommissionPermissions,
  useInventoryPermissions,
  useOrganizationPermissions,
};
