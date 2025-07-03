"use client";

/**
 * Query Keys centralizados e hierárquicos para React Query
 * Seguindo padrão: [entidade, ...identificadores, ...filtros]
 */

export const queryKeys = {
  // Dados globais do sistema
  system: {
    all: ["system"] as const,
    status: () => [...queryKeys.system.all, "status"] as const,
    config: () => [...queryKeys.system.all, "config"] as const,
  },

  // Organizações (dados globais, cache longo)
  organizations: {
    all: ["organizations"] as const,
    lists: () => [...queryKeys.organizations.all, "list"] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.organizations.lists(), filters] as const,
    details: () => [...queryKeys.organizations.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.organizations.details(), id] as const,
    members: (orgId: string) =>
      [...queryKeys.organizations.detail(orgId), "members"] as const,
  },

  // Campus (semi-estático, cache médio)
  campuses: {
    all: ["campuses"] as const,
    lists: () => [...queryKeys.campuses.all, "list"] as const,
    list: (orgId?: string) =>
      [...queryKeys.campuses.lists(), { orgId }] as const,
    details: () => [...queryKeys.campuses.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.campuses.details(), id] as const,
    members: (campusId: string) =>
      [...queryKeys.campuses.detail(campusId), "members"] as const,
    commissions: (campusId: string) =>
      [...queryKeys.campuses.detail(campusId), "commissions"] as const,
  },

  // Comissões (dinâmico, cache baixo)
  commissions: {
    all: ["commissions"] as const,
    lists: () => [...queryKeys.commissions.all, "list"] as const,
    list: (campusId?: string) =>
      [...queryKeys.commissions.lists(), { campusId }] as const,
    details: () => [...queryKeys.commissions.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.commissions.details(), id] as const,
    members: (commissionId: string) =>
      [...queryKeys.commissions.detail(commissionId), "members"] as const,
    inventory: (commissionId: string) =>
      [...queryKeys.commissions.detail(commissionId), "inventory"] as const,
  },

  // Usuários (dinâmico, cache baixo em gerenciamento)
  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    current: () => [...queryKeys.users.all, "current"] as const,
    role: (email?: string) =>
      [...queryKeys.users.current(), "role", email] as const,
    permissions: (userId: string) =>
      [...queryKeys.users.detail(userId), "permissions"] as const,
  },

  // Inventário (muito dinâmico, invalidação frequente)
  inventory: {
    all: ["inventory"] as const,
    lists: () => [...queryKeys.inventory.all, "list"] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.inventory.lists(), filters] as const,
    byCommission: (commissionId: string) =>
      [...queryKeys.inventory.lists(), { commissionId }] as const,
    byCampus: (campusId: string) =>
      [...queryKeys.inventory.lists(), { campusId }] as const,
    details: () => [...queryKeys.inventory.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.inventory.details(), id] as const,
    history: (itemId: string) =>
      [...queryKeys.inventory.detail(itemId), "history"] as const,
  },
} as const;

/**
 * Configurações de cache otimizadas por tipo de dado
 */
export const cacheConfig = {
  // Dados que raramente mudam
  static: {
    staleTime: 15 * 60 * 1000, // 15 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
  },

  // Dados que mudam ocasionalmente
  semiStatic: {
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
  },

  // Dados dinâmicos
  dynamic: {
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos
  },

  // Dados em tempo real (gerenciamento)
  realtime: {
    staleTime: 0, // Sempre considerado stale
    gcTime: 2 * 60 * 1000, // 2 minutos
  },

  // Dados do usuário atual
  user: {
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  },
} as const;

/**
 * Funções utilitárias para invalidação de cache
 */
export const invalidationUtils = {
  // Invalida dados relacionados a uma organização
  invalidateOrganization: (queryClient: any, orgId: string) => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.organizations.detail(orgId),
    });
    queryClient.invalidateQueries({ queryKey: queryKeys.campuses.list(orgId) });
  },

  // Invalida dados relacionados a um campus
  invalidateCampus: (queryClient: any, campusId: string) => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.campuses.detail(campusId),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.commissions.list(campusId),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.inventory.byCampus(campusId),
    });
  },

  // Invalida dados relacionados a uma comissão
  invalidateCommission: (queryClient: any, commissionId: string) => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.commissions.detail(commissionId),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.inventory.byCommission(commissionId),
    });
  },

  // Invalida dados do usuário atual
  invalidateCurrentUser: (queryClient: any) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.users.current() });
  },

  // Invalida tudo relacionado ao inventário
  invalidateAllInventory: (queryClient: any) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
  },
};
