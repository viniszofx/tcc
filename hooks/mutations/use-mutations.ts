"use client";

import { queryKeys } from "@/hooks/queries/query-keys";
import type {
  Campus,
  Commission,
  InventoryItem,
  Organization,
} from "@/interface";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Hook para criar organizações com invalidação automática de cache
 */
export function useCreateOrganization() {
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
    onSuccess: () => {
      // Invalidar cache para atualizar listas de organizações
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all });
      queryClient.invalidateQueries({ queryKey: ["user-permissions"] });
    },
  });
}

/**
 * Hook para atualizar organizações com invalidação automática de cache
 */
export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...orgData
    }: { id: string } & Partial<Organization>) => {
      const response = await fetch("/api/organization", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, ...orgData }),
      });

      if (!response.ok) {
        throw new Error("Failed to update organization");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidar cache para atualizar listas e detalhes
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.detail(variables.id),
      });
    },
  });
}

/**
 * Hook para deletar organizações com invalidação automática de cache
 */
export function useDeleteOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/organization?id=${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete organization");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidar cache para atualizar listas
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all });
      queryClient.invalidateQueries({ queryKey: ["user-permissions"] });
    },
  });
}

/**
 * Hook para criar campus com invalidação automática de cache
 */
export function useCreateCampus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      campusData: Omit<Campus, "id" | "createdAt" | "updatedAt">
    ) => {
      const response = await fetch("/api/campus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(campusData),
      });

      if (!response.ok) {
        throw new Error("Failed to create campus");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidar cache para atualizar listas
      queryClient.invalidateQueries({ queryKey: queryKeys.campuses.all });
    },
  });
}

/**
 * Hook para atualizar campus com invalidação automática de cache
 */
export function useUpdateCampus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...campusData
    }: { id: string } & Partial<Campus>) => {
      const response = await fetch(`/api/campus/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(campusData),
      });

      if (!response.ok) {
        throw new Error("Failed to update campus");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidar cache para atualizar listas e detalhes
      queryClient.invalidateQueries({ queryKey: queryKeys.campuses.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.campuses.detail(variables.id),
      });
    },
  });
}

/**
 * Hook para criar usuário com invalidação automática de cache
 */
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
        throw new Error("Failed to create user");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidar cache para atualizar listas de usuários
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

/**
 * Hook para criar comissão com invalidação automática de cache
 */
export function useCreateCommission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      commissionData: Omit<Commission, "id" | "createdAt" | "updatedAt">
    ) => {
      const response = await fetch("/api/commission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(commissionData),
      });

      if (!response.ok) {
        throw new Error("Failed to create commission");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidar cache para atualizar listas de comissões
      queryClient.invalidateQueries({ queryKey: queryKeys.commissions.all });
    },
  });
}

/**
 * Hook para adicionar membro à comissão com invalidação automática de cache
 */
export function useAddCommissionMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      commissionId,
      roleInCommission,
    }: {
      userId: string;
      commissionId: string;
      roleInCommission: string;
    }) => {
      const response = await fetch("/api/commission-member", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          commissionId,
          roleInCommission,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add commission member");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidar cache para atualizar membros da comissão
      queryClient.invalidateQueries({
        queryKey: queryKeys.commissions.members(variables.commissionId),
      });
      queryClient.invalidateQueries({ queryKey: ["commission-members"] });
    },
  });
}

/**
 * Hook para remover membro da comissão com invalidação automática de cache
 */
export function useRemoveCommissionMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      commissionId,
    }: {
      userId: string;
      commissionId: string;
    }) => {
      const response = await fetch(
        `/api/commission-member?userId=${userId}&commissionId=${commissionId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove commission member");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidar cache para atualizar membros da comissão
      queryClient.invalidateQueries({
        queryKey: queryKeys.commissions.members(variables.commissionId),
      });
      queryClient.invalidateQueries({ queryKey: ["commission-members"] });
    },
  });
}

/**
 * Hook para criar/atualizar item de inventário com invalidação automática de cache
 */
export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: InventoryItem) => {
      const response = await fetch("/api/inventory", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        throw new Error("Failed to update inventory item");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidar cache para atualizar inventários
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({
        queryKey: ["inventory-item", variables.id],
      });

      // Se o item tem uma comissão associada, invalidar cache da comissão também
      if (variables.commissionId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.commissions.detail(variables.commissionId),
        });
      }
    },
  });
}

/**
 * Hook para deletar item de inventário com invalidação automática de cache
 */
export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/inventory?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete inventory item");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidar cache para atualizar inventários
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}

/**
 * Hook para processar upload de inventário com invalidação automática de cache
 */
export function useProcessInventoryUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      processedData,
      commissionId,
      description,
    }: {
      processedData: any[];
      commissionId: string;
      description: string;
    }) => {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: processedData,
          commissionId,
          description,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process inventory upload");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidar cache para atualizar inventários
      queryClient.invalidateQueries({ queryKey: ["inventory"] });

      // Invalidar cache da comissão específica
      queryClient.invalidateQueries({
        queryKey: queryKeys.commissions.detail(variables.commissionId),
      });

      // Invalidar histórico de inventário
      queryClient.invalidateQueries({
        queryKey: ["commission-history", variables.commissionId],
      });
    },
  });
}

/**
 * Hook para deletar comissão com invalidação automática de cache
 */
export function useDeleteCommission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/commission?id=${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete commission");
      }

      return response.json();
    },
    onSuccess: (_, id) => {
      // Invalidar cache para atualizar listas de comissões
      queryClient.invalidateQueries({ queryKey: queryKeys.commissions.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.commissions.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.commissions.lists(),
      });
      // Invalidar dados relacionados que podem ter dependência de comissões
      queryClient.invalidateQueries({ queryKey: queryKeys.campuses.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all });
    },
  });
}

/**
 * Hook para atualizar papel do membro na comissão com invalidação automática de cache
 */
export function useUpdateCommissionMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      commissionId,
      roleInCommission,
    }: {
      userId: string;
      commissionId: string;
      roleInCommission: string;
    }) => {
      const response = await fetch("/api/commission-member", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          commissionId,
          roleInCommission,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update commission member");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidar cache para atualizar membros da comissão
      queryClient.invalidateQueries({
        queryKey: queryKeys.commissions.members(variables.commissionId),
      });
      queryClient.invalidateQueries({ queryKey: ["commission-members"] });
      queryClient.invalidateQueries({
        queryKey: queryKeys.commissions.detail(variables.commissionId),
      });
    },
  });
}
