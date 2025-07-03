"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export interface UserRole {
  id: string;
  name: string;
  email: string;
  role: "admin global" | "admin" | "member";
  organization?: {
    id: string;
    name: string;
    shortName: string;
  };
  organizationMembers?: {
    organizationId: string;
    role: "admin" | "member";
    organization: {
      id: string;
      name: string;
      shortName: string;
    };
  }[];
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

  // Funções específicas
  canDeleteUsers: boolean;
  canRemoveFromCommissions: boolean;
  presidedCommissions: string[];

  // Função para verificar se um usuário específico pode ser excluído
  canDeleteSpecificUser: (targetUser: UserRole | any) => boolean;

  // Estado
  loading: boolean;
  error: string | null;
  user: UserRole | null;
}

// Função para calcular permissões baseadas nos dados do usuário
function calculatePermissions(
  user: UserRole | null,
  isFirstAccess: boolean
): UserPermissions {
  if (!user) {
    return {
      canManageOrganizations: false,
      canManageCampuses: false,
      canManageUsers: false,
      canManageCommissions: false,
      canUploadSpreadsheets: false,
      canManageCommissionMembers: false,
      canAccessCommission: false,
      canViewInventory: false,
      canDeleteUsers: false,
      canRemoveFromCommissions: false,
      presidedCommissions: [],
      canDeleteSpecificUser: () => false,
      loading: false,
      error: null,
      user: null,
    };
  }

  // Sistema baseado em UserProfile.role
  const isGlobalAdmin = user.role === "admin global";

  // Verificar se é administrador de alguma organização
  const isOrgAdmin =
    user.organizationMembers?.some((member) => member.role === "admin") ||
    false;

  // Definir permissões baseadas no role
  const isAdmin = isGlobalAdmin || isOrgAdmin;
  const isMember = user.role === "member";

  // Extrair IDs das comissões que o usuário preside
  const presidedCommissions =
    user.commissions
      ?.filter((commission) => commission.roleInCommission === "Presidente")
      .map((commission) => commission.id) || [];

  // Função estável para verificar se um usuário pode ser excluído
  const canDeleteSpecificUser = (targetUser: UserRole | any) => {
    // Admin global não pode ser excluído
    const isTargetGlobalAdmin = targetUser.role === "admin global";
    return !isTargetGlobalAdmin;
  };

  // Se é primeiro acesso, dar permissões de admin temporário
  if (isFirstAccess) {
    return {
      canManageOrganizations: true,
      canManageCampuses: true,
      canManageUsers: true,
      canManageCommissions: true,
      canUploadSpreadsheets: true,
      canManageCommissionMembers: true,
      canAccessCommission: true,
      canViewInventory: true,
      canDeleteUsers: true,
      canRemoveFromCommissions: true,
      presidedCommissions: [],
      canDeleteSpecificUser,
      loading: false,
      error: null,
      user,
    };
  }

  return {
    // Nível Organização - apenas admins
    canManageOrganizations: isAdmin,
    canManageCampuses: isAdmin,
    canManageUsers: isAdmin,

    // Nível Comissão - admins podem gerenciar, membros podem acessar
    canManageCommissions: isAdmin,
    canUploadSpreadsheets: isAdmin,
    canManageCommissionMembers: isAdmin,

    // Nível Acesso - todos os usuários autorizados
    canAccessCommission: isAdmin || isMember,
    canViewInventory: isAdmin || isMember,

    // Funções específicas
    canDeleteUsers: isAdmin,
    canRemoveFromCommissions: isAdmin,
    presidedCommissions,
    canDeleteSpecificUser,

    // Estado
    loading: false,
    error: null,
    user,
  };
}

// Hook principal usando React Query
export function useUserPermissions() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["user-permissions"],
    queryFn: async () => {
      const response = await fetch("/api/auth/get-user-role", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao verificar permissões");
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 3,
  });

  const permissions = useMemo(() => {
    if (isLoading) {
      return {
        canManageOrganizations: false,
        canManageCampuses: false,
        canManageUsers: false,
        canManageCommissions: false,
        canUploadSpreadsheets: false,
        canManageCommissionMembers: false,
        canAccessCommission: false,
        canViewInventory: false,
        canDeleteUsers: false,
        canRemoveFromCommissions: false,
        presidedCommissions: [],
        canDeleteSpecificUser: () => false,
        loading: true,
        error: null,
        user: null,
      };
    }

    if (error) {
      return {
        canManageOrganizations: false,
        canManageCampuses: false,
        canManageUsers: false,
        canManageCommissions: false,
        canUploadSpreadsheets: false,
        canManageCommissionMembers: false,
        canAccessCommission: false,
        canViewInventory: false,
        canDeleteUsers: false,
        canRemoveFromCommissions: false,
        presidedCommissions: [],
        canDeleteSpecificUser: () => false,
        loading: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
        user: null,
      };
    }

    return calculatePermissions(
      data?.user || null,
      data?.isFirstAccess || false
    );
  }, [data, isLoading, error]);

  return permissions;
}

// Hook para verificar permissão específica
export function useHasPermission(
  permission: keyof Omit<
    UserPermissions,
    "loading" | "error" | "user" | "canDeleteSpecificUser"
  >
) {
  const permissions = useUserPermissions();
  return {
    hasPermission: permissions[permission],
    loading: permissions.loading,
    error: permissions.error,
  };
}
