"use client";

import type { CommissionWithRelations } from '@/types';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query Keys
export const commissionKeys = {
  all: ["commissions"] as const,
  lists: () => [...commissionKeys.all, "list"] as const,
  list: (filters: string) => [...commissionKeys.lists(), { filters }] as const,
  details: () => [...commissionKeys.all, "detail"] as const,
  detail: (id: string) => [...commissionKeys.details(), id] as const,
  members: (id: string) => [...commissionKeys.detail(id), "members"] as const,
  member: (commissionId: string, memberId: string) =>
    [...commissionKeys.members(commissionId), memberId] as const,
};

// Hook para buscar todas as comissões
export function useCommissions() {
  return useQuery({
    queryKey: commissionKeys.lists(),
    queryFn: async (): Promise<CommissionWithRelations[]> => {
      const response = await fetch("/api/commission");

      if (!response.ok) {
        throw new Error("Erro ao buscar comissões");
      }

      return response.json();
    },
    staleTime: 3 * 60 * 1000, // 3 minutos
  });
}

// Hook para buscar uma comissão específica
export function useCommission(id: string) {
  return useQuery({
    queryKey: commissionKeys.detail(id),
    queryFn: async (): Promise<CommissionWithRelations> => {
      const response = await fetch(`/api/commission/${id}`);

      if (!response.ok) {
        throw new Error("Comissão não encontrada");
      }

      return response.json();
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para buscar membros de uma comissão
export function useCommissionMembers(commissionId: string) {
  return useQuery({
    queryKey: commissionKeys.members(commissionId),
    queryFn: async () => {
      const response = await fetch(
        `/api/commission-member?commissionId=${commissionId}`
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar membros");
      }

      return response.json();
    },
    enabled: !!commissionId,
    staleTime: 2 * 60 * 1000,
  });
}

// Hook para buscar um membro específico de uma comissão
export function useCommissionMember(commissionId: string, memberId: string) {
  return useQuery({
    queryKey: commissionKeys.member(commissionId, memberId),
    queryFn: async () => {
      const response = await fetch(
        `/api/commission-member?commissionId=${commissionId}&userId=${memberId}`
      );

      if (!response.ok) {
        throw new Error("Membro não encontrado");
      }

      const data = await response.json();
      // Se retornar array, pegar o primeiro item
      return Array.isArray(data) ? data[0] : data;
    },
    enabled: !!(commissionId && memberId),
    staleTime: 5 * 60 * 1000,
  });
}

// Mutation para criar comissão
export function useCreateCommission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commissionData: any) => {
      const response = await fetch("/api/commission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(commissionData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Erro ao criar comissão");
      }

      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commissionKeys.lists() });
    },
  });
}

// Mutation para atualizar comissão
export function useUpdateCommission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...commissionData }: any) => {
      const response = await fetch(`/api/commission/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(commissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao atualizar comissão");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: commissionKeys.lists() });
      queryClient.setQueryData(commissionKeys.detail(variables.id), data);
    },
  });
}

// Mutation para adicionar membro à comissão
export function useAddCommissionMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberData: any) => {
      const response = await fetch("/api/commission-member", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(memberData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao adicionar membro");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidar membros da comissão
      queryClient.invalidateQueries({
        queryKey: commissionKeys.members(variables.commissionId),
      });
    },
  });
}

// Mutation para remover membro da comissão
export function useRemoveCommissionMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commissionId,
      userId,
    }: {
      commissionId: string;
      userId: string;
    }) => {
      const response = await fetch("/api/commission-member", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ commissionId, userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao remover membro");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: commissionKeys.members(variables.commissionId),
      });
      queryClient.removeQueries({
        queryKey: commissionKeys.member(
          variables.commissionId,
          variables.userId
        ),
      });
    },
  });
}
