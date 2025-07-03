"use client";

import { useAbility } from "@/lib/permissions/hooks";
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

    // Se precisar de permissões específicas por comissão, pode customizar aqui
    // Exemplo: checar se pode acessar/gerenciar comissão específica
    // Para simplificação, vamos assumir que o ability já está configurado corretamente
    setPermissions({
      canAccessCommission: ability ? ability.can("read", "Commission") : false,
      canManageCommission: ability
        ? ability.can("manage", "Commission")
        : false,
      canUploadToCommission: ability
        ? ability.can("upload", "Commission")
        : false,
      canManageMembers: ability
        ? ability.can("update", "CommissionMember")
        : false,
      loading: false,
      error: null,
    });
  }, [user, userLoading, ability]);

  return permissions;
}
