"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";

// Interface principal para dados do usuário
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
  redirectPath?: string;
}

// Interface para dados básicos do usuário (compatibilidade)
export interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  organization?: {
    id: string;
    name: string;
    shortName: string;
  };
  redirectPath: string;
}

// Interface unificada para permissões
export interface UserPermissions {
  // Permissões básicas
  isAdmin: boolean;
  isGlobalAdmin: boolean;
  isOrganizationAdmin: boolean;
  
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
  canManageInventory: boolean;
  canViewReports: boolean;

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

interface ConsolidatedUserContextType {
  userData: UserRole | null;
  permissions: UserPermissions;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const ConsolidatedUserContext = createContext<ConsolidatedUserContextType | undefined>(undefined);

// Cache para evitar múltiplas requisições
let userDataCache: UserRole | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Flag para evitar múltiplas requisições simultâneas
let isRequestInProgress = false;
let pendingPromise: Promise<UserRole | null> | null = null;

function calculatePermissions(userData: UserRole | null, isFirstAccess: boolean = false): UserPermissions {
  // Função estável para verificar se um usuário pode ser excluído
  const canDeleteSpecificUser = (targetUser: UserRole | any) => {
    if (!userData) return false;
    // Admin global não pode ser excluído por ninguém
    if (targetUser.role === "admin global") return false;
    // Se o usuário atual não for admin global nem admin, não pode deletar ninguém
    if (userData.role !== "admin global" && userData.role !== "admin") return false;
    // Admin do sistema pode deletar qualquer um, exceto admin global
    return true;
  };

  if (!userData) {
    return {
      isAdmin: false,
      isGlobalAdmin: false,
      isOrganizationAdmin: false,
      canManageOrganizations: false,
      canManageCampuses: false,
      canManageUsers: false,
      canManageCommissions: false,
      canUploadSpreadsheets: false,
      canManageCommissionMembers: false,
      canAccessCommission: false,
      canViewInventory: false,
      canManageInventory: false,
      canViewReports: false,
      canDeleteUsers: false,
      canRemoveFromCommissions: false,
      presidedCommissions: [],
      canDeleteSpecificUser,
      loading: false,
      error: null,
      user: null,
    };
  }

  const isGlobalAdmin = userData.role === "admin global";
  const isSystemAdmin = userData.role === "admin";
  const isAdmin = isGlobalAdmin || isSystemAdmin;
  const isMember = userData.role === "member";
  
  // Verificar se é administrador de alguma organização
  const isOrgAdmin = userData.organizationMembers?.some((member) => member.role === "admin") || false;
  const isOrganizationAdmin = userData.organization && isAdmin;

  // Extrair IDs das comissões que o usuário preside
  const presidedCommissions = userData.commissions
    ?.filter((commission) => commission.roleInCommission === "Presidente")
    .map((commission) => commission.id) || [];

  // Se é primeiro acesso, dar permissões de admin temporário
  if (isFirstAccess) {
    return {
      isAdmin: true,
      isGlobalAdmin: true,
      isOrganizationAdmin: true,
      canManageOrganizations: true,
      canManageCampuses: true,
      canManageUsers: true,
      canManageCommissions: true,
      canUploadSpreadsheets: true,
      canManageCommissionMembers: true,
      canAccessCommission: true,
      canViewInventory: true,
      canManageInventory: true,
      canViewReports: true,
      canDeleteUsers: true,
      canRemoveFromCommissions: true,
      presidedCommissions: [],
      canDeleteSpecificUser,
      loading: false,
      error: null,
      user: userData,
    };
  }

  // Verificar se é presidente de alguma comissão
  const isPresident = presidedCommissions.length > 0;

  return {
    isAdmin,
    isGlobalAdmin,
    isOrganizationAdmin: !!isOrganizationAdmin,
    canManageOrganizations: isAdmin,
    canManageCampuses: isAdmin,
    canManageUsers: isAdmin,
    canManageCommissions: isAdmin,
    canUploadSpreadsheets: isAdmin || isPresident,
    canManageCommissionMembers: isAdmin || isPresident,
    canAccessCommission: isAdmin || isMember,
    canViewInventory: isAdmin || isMember,
    canManageInventory: isAdmin,
    canViewReports: true, // Todos podem ver relatórios
    canDeleteUsers: isAdmin,
    canRemoveFromCommissions: isAdmin,
    presidedCommissions,
    canDeleteSpecificUser,
    loading: false,
    error: null,
    user: userData,
  };
}

async function fetchUserData(email: string): Promise<{ user: UserRole; isFirstAccess?: boolean } | null> {
  // Verificar cache
  const now = Date.now();
  if (userDataCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return { user: userDataCache, isFirstAccess: false };
  }

  // Se já há uma requisição em andamento, aguardar ela
  if (isRequestInProgress && pendingPromise) {
    const result = await pendingPromise;
    return result ? { user: result, isFirstAccess: false } : null;
  }

  // Marcar que uma requisição está em andamento
  isRequestInProgress = true;
  
  pendingPromise = (async () => {
    try {
      const response = await fetch("/api/auth/get-user-role", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        userDataCache = data.user;
        cacheTimestamp = now;
        return data.user;
      } else {
        console.error("Erro ao buscar dados do usuário:", response.statusText);
        return null;
      }
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
      return null;
    } finally {
      isRequestInProgress = false;
      pendingPromise = null;
    }
  })();

  const result = await pendingPromise;
  return result ? { user: result, isFirstAccess: false } : null;
}

export function ConsolidatedUserProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFirstAccess, setIsFirstAccess] = useState(false);
  const { user } = useAuth();

  const loadUserData = useCallback(async () => {
    if (!user?.email || loading) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchUserData(user.email);
      if (data) {
        setUserData(data.user);
        setIsFirstAccess(data.isFirstAccess || false);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
      setError("Erro ao carregar dados do usuário");
    } finally {
      setLoading(false);
    }
  }, [user?.email, loading]);

  useEffect(() => {
    if (user?.email && !userData) {
      loadUserData();
    }
  }, [user?.email, loadUserData]);

  const refetch = () => {
    // Limpar cache
    userDataCache = null;
    cacheTimestamp = 0;
    setUserData(null);
    setIsFirstAccess(false);
    loadUserData();
  };

  const permissions = useMemo(() => calculatePermissions(userData, isFirstAccess), [userData, isFirstAccess]);

  return (
    <ConsolidatedUserContext.Provider 
      value={{ userData, permissions, loading, error, refetch }}
    >
      {children}
    </ConsolidatedUserContext.Provider>
  );
}

export function useConsolidatedUser() {
  const context = useContext(ConsolidatedUserContext);
  if (context === undefined) {
    throw new Error("useConsolidatedUser must be used within a ConsolidatedUserProvider");
  }
  return context;
}

// Hooks de compatibilidade para facilitar migração
export function useUserData() {
  const { userData, loading, error, refetch } = useConsolidatedUser();
  return { userData, loading, error, refetch };
}

export function useUserPermissions() {
  const { permissions } = useConsolidatedUser();
  return permissions;
}

export function useHasPermission(permission: keyof Omit<UserPermissions, 'loading' | 'error' | 'user' | 'canDeleteSpecificUser'>) {
  const { permissions } = useConsolidatedUser();
  return {
    hasPermission: permissions[permission],
    loading: permissions.loading,
    error: permissions.error,
  };
}

// Hook para verificar se o usuário tem uma role específica
export function useUserRole() {
  const { userData } = useConsolidatedUser();
  return {
    data: { user: userData, role: userData?.role },
    isLoading: false,
    error: null,
  };
}

// Função para limpar cache (útil para testes ou logout)
export function clearUserCache() {
  userDataCache = null;
  cacheTimestamp = 0;
}