"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserRole } from "../use-user-permissions";

// Query Keys
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: string) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  role: (email?: string) => [...userKeys.all, "role", email] as const,
};

// Hook para buscar role do usuário atual
export function useUserRole() {
  return useQuery({
    queryKey: userKeys.role(),
    queryFn: async (): Promise<{
      user: UserRole;
      role: string;
      isPresident: boolean;
      isFirstAccess?: boolean;
    }> => {
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
    staleTime: 2 * 60 * 1000, // 2 minutos
    retry: (failureCount, error: any) => {
      // Não tentar novamente se for erro de autenticação
      if (error?.message?.includes("401") || error?.message?.includes("403")) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

// Hook para buscar todos os usuários
export function useUsers() {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: async () => {
      const response = await fetch("/api/user");

      if (!response.ok) {
        throw new Error("Erro ao buscar usuários");
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para buscar um usuário específico
export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/user?id=${id}`);

      if (!response.ok) {
        throw new Error("Erro ao buscar usuário");
      }

      return response.json();
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Mutation para criar usuário
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: any) => {
      const response = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao criar usuário");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidar cache dos usuários
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

// Mutation para atualizar usuário
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...userData }: any) => {
      const response = await fetch("/api/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, ...userData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao atualizar usuário");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      // Atualizar cache específico
      queryClient.setQueryData(userKeys.detail(variables.id), data);
    },
  });
}

// Mutation para deletar usuário
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch("/api/user", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao deletar usuário");
      }

      return response.json();
    },
    onSuccess: (_, id) => {
      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      // Remover do cache específico
      queryClient.removeQueries({ queryKey: userKeys.detail(id) });
    },
  });
}
