"use client";

import { useEffect, useState } from "react";
import { useUserPermissions } from "./use-user-permissions";

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
        const isAdmin = user.role === "admin";

        // Converter IDs para string para comparação consistente
        const commissionIdStr = String(commissionId);

        const isPresidentOfThisCommission =
          user.commissions?.some(
            (c) =>
              String(c.id) === commissionIdStr &&
              c.roleInCommission === "Presidente"
          ) || false;
        const isMemberOfThisCommission =
          user.commissions?.some((c) => String(c.id) === commissionIdStr) ||
          false;

        // Admin da organização tem acesso às comissões dos campus da sua organização
        const isAdminOfOrganization = isAdmin && !!user.organization;
        const commissionBelongsToUserOrganization =
          commission.campus?.organizationId === user.organization?.id;

        console.log("DEBUG - Verificação de permissões:", {
          commissionId: commissionIdStr,
          userCommissions: user.commissions,
          isAdmin,
          isPresidentOfThisCommission,
          isMemberOfThisCommission,
          isAdminOfOrganization,
          commissionBelongsToUserOrganization,
          userOrganizationId: user.organization?.id,
          commissionOrganizationId: commission.campus?.organizationId,
        });

        const canAccess =
          isAdmin ||
          isPresidentOfThisCommission ||
          isMemberOfThisCommission ||
          (isAdminOfOrganization && !!commissionBelongsToUserOrganization);

        setPermissions({
          canAccessCommission: canAccess,
          canManageCommission:
            isAdmin ||
            isPresidentOfThisCommission ||
            (isAdminOfOrganization && !!commissionBelongsToUserOrganization),
          canUploadToCommission:
            isAdmin ||
            isPresidentOfThisCommission ||
            (isAdminOfOrganization && !!commissionBelongsToUserOrganization),
          canManageMembers:
            isAdmin ||
            isPresidentOfThisCommission ||
            (isAdminOfOrganization && !!commissionBelongsToUserOrganization),
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
