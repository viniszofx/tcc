"use client";

import { useEffect, useState } from "react";

export interface UserRole {
  id: string;
  name: string;
  email: string;
  role: "admin" | "presidente" | "member";
  organization?: {
    id: string;
    name: string;
    shortName: string;
  };
  commissions?: {
    id: string;
    name: string;
    roleInCommission: string;
  }[];
  campuses?: {
    id: string;
    name: string;
  }[];
}

export interface UserPermissions {
  // Nível Organização
  canManageOrganizations: boolean;
  canManageCampuses: boolean;
  canManageUsers: boolean;

  // Nível Comissão
  canManageCommissions: boolean;
  canUploadSpreadsheets: boolean;
  canManageCommissionMembers: boolean;

  // Nível Acesso
  canAccessCommission: boolean;
  canViewInventory: boolean;

  // Estado
  loading: boolean;
  error: string | null;
  user: UserRole | null;
}

export function useUserPermissions() {
  const [permissions, setPermissions] = useState<UserPermissions>({
    // Nível Organização
    canManageOrganizations: false,
    canManageCampuses: false,
    canManageUsers: false,

    // Nível Comissão
    canManageCommissions: false,
    canUploadSpreadsheets: false,
    canManageCommissionMembers: false,

    // Nível Acesso
    canAccessCommission: false,
    canViewInventory: false,

    // Estado
    loading: true,
    error: null,
    user: null,
  });

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        // Buscar dados completos do usuário e suas roles
        const response = await fetch("/api/auth/get-user-role", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Erro ao verificar permissões");
        }

        const data = await response.json();
        const user: UserRole = data.user;
        const isFirstAccess = data.isFirstAccess;

        console.log("DEBUG - Dados do usuário carregados:", {
          user,
          commissions: user.commissions,
          isFirstAccess,
        });
        const isAdmin = user.role === "admin";
        const isPresident = user.role === "presidente";
        const isMember = user.role === "member";

        // Se é primeiro acesso, dar permissões de admin temporário
        if (isFirstAccess) {
          setPermissions({
            // Nível Organização - permitir tudo no primeiro acesso
            canManageOrganizations: true,
            canManageCampuses: true,
            canManageUsers: true,

            // Nível Comissão - permitir tudo no primeiro acesso
            canManageCommissions: true,
            canUploadSpreadsheets: true,
            canManageCommissionMembers: true,

            // Nível Acesso - permitir tudo no primeiro acesso
            canAccessCommission: true,
            canViewInventory: true,

            // Estado
            loading: false,
            error: null,
            user,
          });
          return;
        }

        setPermissions({
          // Nível Organização - apenas admins
          canManageOrganizations: isAdmin,
          canManageCampuses: isAdmin,
          canManageUsers: isAdmin,

          // Nível Comissão - admins e presidentes
          canManageCommissions: isAdmin || isPresident,
          canUploadSpreadsheets: isAdmin || isPresident,
          canManageCommissionMembers: isAdmin || isPresident,

          // Nível Acesso - todos os usuários autorizados
          canAccessCommission: isAdmin || isPresident || isMember,
          canViewInventory: isAdmin || isPresident || isMember,

          // Estado
          loading: false,
          error: null,
          user,
        });
      } catch (error) {
        console.error("Erro ao verificar permissões:", error);
        setPermissions((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Erro desconhecido",
        }));
      }
    };

    checkPermissions();
  }, []);

  return permissions;
}

// Hook para verificar permissão específica
export function useHasPermission(
  permission: keyof Omit<UserPermissions, "loading" | "error" | "user">
) {
  const permissions = useUserPermissions();
  return {
    hasPermission: permissions[permission],
    loading: permissions.loading,
    error: permissions.error,
  };
}
