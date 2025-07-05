"use client";

import type { Campus, Organization } from '@/types';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cacheConfig, invalidationUtils, queryKeys } from "./query-keys";

/**
 * Hook otimizado para organizações (dados globais, cache longo)
 */
export function useOptimizedOrganizations() {
  return useQuery({
    queryKey: queryKeys.organizations.lists(),
    queryFn: async (): Promise<Organization[]> => {
      const response = await fetch("/api/organization");
      if (!response.ok) {
        throw new Error("Failed to fetch organizations");
      }
      return response.json();
    },
    ...cacheConfig.static, // Cache longo para dados que raramente mudam
  });
}

/**
 * Hook otimizado para campus (semi-estático)
 */
export function useOptimizedCampuses(organizationId?: string) {
  return useQuery({
    queryKey: queryKeys.campuses.list(organizationId),
    queryFn: async (): Promise<Campus[]> => {
      const url = organizationId
        ? `/api/campus?organizationId=${organizationId}`
        : "/api/campus";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch campuses");
      }
      return response.json();
    },
    ...cacheConfig.semiStatic,
  });
}

/**
 * Hook para campus específico com prefetch de dados relacionados
 */
export function useOptimizedCampus(campusId: string) {
  const queryClient = useQueryClient();

  const campusQuery = useQuery({
    queryKey: queryKeys.campuses.detail(campusId),
    queryFn: async (): Promise<Campus> => {
      const response = await fetch(`/api/campus/${campusId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch campus");
      }
      return response.json();
    },
    ...cacheConfig.semiStatic,
    enabled: !!campusId,
  });

  // Prefetch dados relacionados em background
  if (campusId && campusQuery.data) {
    // Prefetch comissões do campus
    queryClient.prefetchQuery({
      queryKey: queryKeys.commissions.list(campusId),
      queryFn: async () => {
        const response = await fetch(`/api/commission?campusId=${campusId}`);
        if (response.ok) {
          return response.json();
        }
        return [];
      },
      staleTime: cacheConfig.dynamic.staleTime,
    });

    // Prefetch membros do campus
    queryClient.prefetchQuery({
      queryKey: queryKeys.campuses.members(campusId),
      queryFn: async () => {
        const response = await fetch(`/api/campus-member?campusId=${campusId}`);
        if (response.ok) {
          return response.json();
        }
        return [];
      },
      staleTime: cacheConfig.dynamic.staleTime,
    });
  }

  return campusQuery;
}

/**
 * Hook otimizado para dados do usuário atual
 */
export function useOptimizedCurrentUser() {
  return useQuery({
    queryKey: queryKeys.users.role(),
    queryFn: async () => {
      const response = await fetch("/api/auth/get-user-role", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao buscar dados do usuário");
      }

      return response.json();
    },
    ...cacheConfig.user,
    retry: (failureCount, error: any) => {
      if (error?.message?.includes("401") || error?.message?.includes("403")) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * Mutation otimizada para criar organização
 */
export function useOptimizedCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      orgData: Omit<Organization, "id" | "createdAt" | "updatedAt">
    ) => {
      const response = await fetch("/api/organization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orgData),
      });

      if (!response.ok) {
        throw new Error("Failed to create organization");
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Adiciona nova organização ao cache existente
      queryClient.setQueryData(
        queryKeys.organizations.lists(),
        (old: Organization[] = []) => [...old, data]
      );

      // Invalida listas relacionadas
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.lists(),
      });
    },
  });
}

/**
 * Mutation otimizada para atualizar organização
 */
export function useOptimizedUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: Partial<Organization> & { id: string }) => {
      const response = await fetch(`/api/organization/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update organization");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Atualiza o cache específico da organização
      queryClient.setQueryData(
        queryKeys.organizations.detail(variables.id),
        data
      );

      // Atualiza na lista de organizações
      queryClient.setQueryData(
        queryKeys.organizations.lists(),
        (old: Organization[] = []) =>
          old.map((org) => (org.id === variables.id ? data : org))
      );

      // Invalida dados relacionados
      invalidationUtils.invalidateOrganization(queryClient, variables.id);
    },
  });
}

/**
 * Hook para limpar cache seletivamente (útil em páginas de gerenciamento)
 */
export function useCacheManagement() {
  const queryClient = useQueryClient();

  return {
    clearOrganizations: () => {
      queryClient.removeQueries({ queryKey: queryKeys.organizations.all });
    },
    clearCampuses: () => {
      queryClient.removeQueries({ queryKey: queryKeys.campuses.all });
    },
    clearInventory: () => {
      queryClient.removeQueries({ queryKey: queryKeys.inventory.all });
    },
    clearAll: () => {
      queryClient.clear();
    },
    refreshAll: () => {
      queryClient.invalidateQueries();
    },
  };
}
