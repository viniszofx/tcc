"use client";

import { useEffect, useState } from "react";
import { useUserPermissions } from "./use-user-permissions-rq";

interface CommissionAccessPermissions {
  canAccessCommission: boolean;
  canManageCommission: boolean;
  canUploadToCommission: boolean;
  canManageMembers: boolean;
  loading: boolean;
  error: string | null;
}

export function useCommissionPermissions(commissionId: string) {
  const { user, loading: userLoading } = useUserPermissions();
  const [permissions, setPermissions] = useState<CommissionAccessPermissions>({
    canAccessCommission: false,
    canManageCommission: false,
    canUploadToCommission: false,
    canManageMembers: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const checkCommissionPermissions = async () => {
      if (userLoading || !user || !commissionId) {
        return;
      }

      console.log(
        "DEBUG - Iniciando verificação de permissões para comissão:",
        {
          commissionId,
          user: user,
          userCommissions: user.commissions,
        }
      );

      try {
        // Buscar dados da comissão específica
        const response = await fetch(`/api/commission/${commissionId}`);
        if (!response.ok) {
          throw new Error("Comissão não encontrada");
        }

        const commission = await response.json();

        // Verificar permissões baseadas no role e na comissão
        const isGlobalAdmin = user.organizationMembers?.some(
          (member: any) => member.role === "admin global"
        ) || false;
        
        // Verificar se é admin direto (user.role === "admin")
        const isDirectAdmin = user.role === "admin";
        
        // Converter IDs para string para comparação consistente
        const commissionIdStr = String(commissionId);

        // Verificar se é presidente da comissão
        const isPresidentOfThisCommission =
          user.commissions?.some(
            (c) =>
              String(c.id) === commissionIdStr &&
              c.roleInCommission === "Presidente"
          ) || false;
          
        // Verificar se é membro da comissão
        const isMemberOfThisCommission =
          user.commissions?.some((c) => String(c.id) === commissionIdStr) ||
          false;

        // Verificar se é admin da organização que contém a comissão
        const isAdminOfOrganization = user.organizationMembers?.some(
          (member: any) => 
            member.role === "admin" && 
            member.organizationId === commission.campus?.organizationId
        ) || false;

        console.log("DEBUG - Verificação de permissões:", {
          commissionId: commissionIdStr,
          userRole: user.role,
          userCommissions: user.commissions,
          userOrganizationMembers: user.organizationMembers,
          isGlobalAdmin,
          isDirectAdmin,
          isPresidentOfThisCommission,
          isMemberOfThisCommission,
          isAdminOfOrganization,
          commissionOrganizationId: commission.campus?.organizationId,
        });

        // Regras de acesso:
        // 1. Administrador direto (user.role === "admin") pode tudo
        // 2. Administrador global pode tudo
        // 3. Administrador da organização pode acessar comissões dos campus da sua organização
        // 4. Presidente da comissão pode gerenciar a comissão
        // 5. Membro da comissão pode acessar mas não gerenciar
        const canAccess =
          isDirectAdmin ||
          isGlobalAdmin ||
          isAdminOfOrganization ||
          isPresidentOfThisCommission ||
          isMemberOfThisCommission;

        const canManage =
          isDirectAdmin ||
          isGlobalAdmin ||
          isAdminOfOrganization ||
          isPresidentOfThisCommission;

        setPermissions({
          canAccessCommission: canAccess,
          canManageCommission: canManage,
          canUploadToCommission: canManage, // Apenas quem pode gerenciar pode fazer upload
          canManageMembers: canManage, // Apenas quem pode gerenciar pode gerenciar membros
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error("Erro ao verificar permissões da comissão:", error);
        setPermissions({
          canAccessCommission: false,
          canManageCommission: false,
          canUploadToCommission: false,
          canManageMembers: false,
          loading: false,
          error: error instanceof Error ? error.message : "Erro desconhecido",
        });
      }
    };

    checkCommissionPermissions();
  }, [user, userLoading, commissionId]);

  return permissions;
}
