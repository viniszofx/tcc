"use client";

import { useAbility } from "@/lib/permissions/hooks";
import { useEffect, useState } from "react";
import { useUserPermissions } from "./use-consolidated-user";

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
  const ability = useAbility();
  const [permissions, setPermissions] = useState<CommissionAccessPermissions>({
    canAccessCommission: false,
    canManageCommission: false,
    canUploadToCommission: false,
    canManageMembers: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (userLoading || !user) {
      setPermissions((prev) => ({ ...prev, loading: true }));
      return;
    }

    // Verificar se é admin global ou admin de organização
    const isGlobalAdmin = user.role === "admin global";
    const isOrgAdmin = user.organizationMembers?.some((member) => member.role === "admin") || false;
    const isAdmin = isGlobalAdmin || isOrgAdmin || user.role === "admin";

    // Verificar se é presidente da comissão específica
    const isPresidentOfCommission = user.commissions?.some(
      (commission) => 
        commission.id === commissionId && 
        commission.roleInCommission === "Presidente"
    ) || false;

    // Verificar se é membro da comissão
    const isMemberOfCommission = user.commissions?.some(
      (commission) => commission.id === commissionId
    ) || false;

    // Se for admin global pelo CASL, libera tudo
    if (ability && ability.can("manage", "all")) {
      setPermissions({
        canAccessCommission: true,
        canManageCommission: true,
        canUploadToCommission: true,
        canManageMembers: true,
        loading: false,
        error: null,
      });
      return;
    }

    // Definir permissões baseadas no papel do usuário
    const canAccess = isAdmin || isMemberOfCommission;
    const canManage = isAdmin || isPresidentOfCommission;
    const canUpload = isAdmin || isPresidentOfCommission;
    const canManageMembers = isAdmin || isPresidentOfCommission;

    // Debug logs
    console.log('Commission Permissions Debug:', {
      commissionId,
      user: user ? {
        id: user.id,
        role: user.role,
        commissions: user.commissions,
        organizationMembers: user.organizationMembers
      } : null,
      isGlobalAdmin,
      isOrgAdmin,
      isAdmin,
      isPresidentOfCommission,
      isMemberOfCommission,
      permissions: {
        canAccess,
        canManage,
        canUpload,
        canManageMembers
      }
    });

    setPermissions({
      canAccessCommission: canAccess,
      canManageCommission: canManage,
      canUploadToCommission: canUpload,
      canManageMembers: canManageMembers,
      loading: false,
      error: null,
    });
  }, [user, userLoading, ability, commissionId]);

  return permissions;
}
