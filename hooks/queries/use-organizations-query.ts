"use client";

import type { Organization } from '@/types';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Hook para buscar todas as organizações
export function useOrganizations() {
  return useQuery({
    queryKey: ["organizations"],
    queryFn: async (): Promise<Organization[]> => {
      const response = await fetch("/api/organization");
      if (!response.ok) {
        throw new Error("Failed to fetch organizations");
      }
      return response.json();
    },
  });
}

// Hook para buscar uma organização específica
export function useOrganization(id: string) {
  return useQuery({
    queryKey: ["organization", id],
    queryFn: async (): Promise<Organization> => {
      const response = await fetch(`/api/organization/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch organization");
      }
      return response.json();
    },
    enabled: !!id,
  });
}

// Hook para criar organização
export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      organizationData: Omit<Organization, "id" | "createdAt" | "updatedAt">
    ) => {
      const response = await fetch("/api/organization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(organizationData),
      });

      if (!response.ok) {
        throw new Error("Failed to create organization");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidar cache das organizações para refetch
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
}

// Hook para atualizar organização
export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Organization>;
    }) => {
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
    onSuccess: (_, { id }) => {
      // Invalidar cache das organizações e da organização específica
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      queryClient.invalidateQueries({ queryKey: ["organization", id] });
    },
  });
}