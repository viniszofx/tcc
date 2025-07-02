"use client";

import type { CommissionMember, UserProfile } from "@/interface";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Tipo para membro com dados do usuário
export type CommissionMemberWithUser = CommissionMember & {
  user: UserProfile;
};

// Hook para buscar membros de uma comissão
export function useCommissionMembers(commissionId: string) {
  return useQuery({
    queryKey: ["commission-members", commissionId],
    queryFn: async (): Promise<CommissionMemberWithUser[]> => {
      const response = await fetch(
        `/api/commission-member?commissionId=${commissionId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch commission members");
      }
      return response.json();
    },
    enabled: !!commissionId,
  });
}

// Hook para buscar um membro específico da comissão
export function useCommissionMember(commissionId: string, memberId: string) {
  return useQuery({
    queryKey: ["commission-member", commissionId, memberId],
    queryFn: async (): Promise<CommissionMemberWithUser> => {
      const response = await fetch(
        `/api/commission-member/${memberId}?commissionId=${commissionId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch commission member");
      }
      return response.json();
    },
    enabled: !!(commissionId && memberId),
  });
}

// Hook para adicionar membro à comissão
export function useAddCommissionMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberData: {
      userId: string;
      commissionId: string;
      roleInCommission: "Presidente" | "Membro" | "Secretário";
    }) => {
      const response = await fetch("/api/commission-member", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(memberData),
      });

      if (!response.ok) {
        throw new Error("Failed to add commission member");
      }

      return response.json();
    },
    onSuccess: (_, { commissionId }) => {
      queryClient.invalidateQueries({
        queryKey: ["commission-members", commissionId],
      });
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
      queryClient.invalidateQueries({ queryKey: ["commission", commissionId] });
    },
  });
}

// Hook para atualizar membro da comissão
export function useUpdateCommissionMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      memberId,
      commissionId,
      data,
    }: {
      memberId: string;
      commissionId: string;
      data: Partial<CommissionMember>;
    }) => {
      const response = await fetch(`/api/commission-member/${memberId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update commission member");
      }

      return response.json();
    },
    onSuccess: (_, { commissionId, memberId }) => {
      queryClient.invalidateQueries({
        queryKey: ["commission-members", commissionId],
      });
      queryClient.invalidateQueries({
        queryKey: ["commission-member", commissionId, memberId],
      });
      queryClient.invalidateQueries({ queryKey: ["commission", commissionId] });
    },
  });
}

// Hook para remover membro da comissão
export function useRemoveCommissionMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      memberId,
      commissionId,
    }: {
      memberId: string;
      commissionId: string;
    }) => {
      const response = await fetch(`/api/commission-member/${memberId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove commission member");
      }

      return response.json();
    },
    onSuccess: (_, { commissionId }) => {
      queryClient.invalidateQueries({
        queryKey: ["commission-members", commissionId],
      });
      queryClient.invalidateQueries({ queryKey: ["commission", commissionId] });
    },
  });
}
