"use client";

import {
  createUserContext,
  defineAbilitiesFor,
} from "@/lib/permissions/abilities";
import { AppAbility } from "@/lib/permissions/types";
import { useEffect, useState } from "react";
import { useAuth } from "./use-auth";

/**
 * Hook para obter as habilidades/permissões do usuário autenticado
 */
export function useAbilities(): {
  ability: AppAbility | null;
  loading: boolean;
  can: (action: string, subject: string, resource?: any) => boolean;
  cannot: (action: string, subject: string, resource?: any) => boolean;
} {
  const { user, loading: authLoading } = useAuth();
  const [ability, setAbility] = useState<AppAbility | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setAbility(null);
      setLoading(false);
      return;
    }

    try {
      // Criar contexto do usuário a partir dos dados do banco
      const userContext = createUserContext(user);

      // Definir habilidades baseadas no contexto
      const userAbility = defineAbilitiesFor(userContext);

      setAbility(userAbility);
    } catch (error) {
      console.error("Erro ao definir habilidades do usuário:", error);
      setAbility(null);
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  const can = (action: string, subject: string, resource?: any): boolean => {
    if (!ability) return false;
    return resource
      ? ability.can(action as any, subject as any, resource)
      : ability.can(action as any, subject as any);
  };

  const cannot = (action: string, subject: string, resource?: any): boolean => {
    return !can(action, subject, resource);
  };

  return {
    ability,
    loading,
    can,
    cannot,
  };
}

/**
 * Hook para verificar se o usuário pode acessar uma página específica
 */
export function usePageAccess(
  requiredAction: string,
  requiredSubject: string,
  resource?: any
): {
  canAccess: boolean;
  loading: boolean;
} {
  const { can, loading } = useAbilities();

  return {
    canAccess: can(requiredAction, requiredSubject, resource),
    loading,
  };
}

/**
 * Hook para verificar múltiplas permissões
 */
export function usePermissions(
  permissions: Array<{
    action: string;
    subject: string;
    resource?: any;
  }>
): {
  hasAllPermissions: boolean;
  hasAnyPermission: boolean;
  loading: boolean;
  checkPermission: (action: string, subject: string, resource?: any) => boolean;
} {
  const { can, loading } = useAbilities();

  const hasAllPermissions = permissions.every(({ action, subject, resource }) =>
    can(action, subject, resource)
  );

  const hasAnyPermission = permissions.some(({ action, subject, resource }) =>
    can(action, subject, resource)
  );

  return {
    hasAllPermissions,
    hasAnyPermission,
    loading,
    checkPermission: can,
  };
}
