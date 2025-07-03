"use client";

import { useCallback, useEffect, useState } from "react";

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
  canDeleteUsers: boolean; // Apenas admins podem excluir usuários
  canRemoveFromCommissions: boolean; // Apenas admins podem remover de comissões
  presidedCommissions: string[]; // IDs das comissões que o usuário preside (baseado em roleInCommission)

  // Função para verificar se um usuário específico pode ser excluído
  canDeleteSpecificUser: (targetUser: UserRole | any) => boolean;

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

    // Funções específicas
    canDeleteUsers: false,
    canRemoveFromCommissions: false,
    presidedCommissions: [],

    // Função placeholder - será sobrescrita
    canDeleteSpecificUser: () => false,

    // Estado
    loading: true,
    error: null,
    user: null,
  });

  // Função estável para verificar se um usuário pode ser excluído
  const canDeleteSpecificUser = useCallback(
    (targetUser: UserRole | any) => {
      // Admin global não pode ser excluído por ninguém
      if (targetUser.role === "admin global") return false;
      // Se o usuário atual não for admin global nem admin, não pode deletar ninguém
      if (
        !permissions.user ||
        (permissions.user.role !== "admin global" &&
          permissions.user.role !== "admin")
      )
        return false;
      // Admin do sistema pode deletar qualquer um, exceto admin global
      return true;
    },
    [permissions.user]
  );

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
          organizationMembers: user.organizationMembers,
          isFirstAccess,
        });

        // Sistema baseado em UserProfile.role
        const isGlobalAdmin = user.role === "admin global";
        const isSystemAdmin = user.role === "admin";
        // Verificar se é administrador de alguma organização
        const isOrgAdmin =
          user.organizationMembers?.some((member) => member.role === "admin") ||
          false;
        const isAdmin = isGlobalAdmin || isSystemAdmin;
        const isMember = user.role === "member";

        // Se é primeiro acesso, dar permissões de admin temporário
        if (isFirstAccess) {
          setPermissions({
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
          });
          return;
        }

        // Extrair IDs das comissões que o usuário preside
        const presidedCommissions =
          user.commissions
            ?.filter(
              (commission) => commission.roleInCommission === "Presidente"
            )
            .map((commission) => commission.id) || [];

        // Se for admin global ou admin do sistema, libera tudo
        if (isGlobalAdmin || isSystemAdmin) {
          setPermissions({
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
            presidedCommissions,
            canDeleteSpecificUser,
            loading: false,
            error: null,
            user,
          });
          return;
        }

        // Se NÃO for admin global nem admin do sistema, mas for admin de organização, libera apenas nível organização
        // (Este bloco foi removido para garantir que apenas o papel global define permissões totais)

        // Usuário comum
        setPermissions({
          canManageOrganizations: false,
          canManageCampuses: false,
          canManageUsers: false,
          canManageCommissions: false,
          canUploadSpreadsheets: false,
          canManageCommissionMembers: false,
          canAccessCommission: isMember,
          canViewInventory: isMember,
          canDeleteUsers: false,
          canRemoveFromCommissions: false,
          presidedCommissions,
          canDeleteSpecificUser,
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
  }, []); // Array vazio - executa apenas uma vez

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
