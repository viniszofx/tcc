"use client";

import type { Campus, CampusMember, UserProfile } from '@/types';

// Tipo para membros de campus com relação user incluída
interface CampusMemberWithUser extends CampusMember {
  user: UserProfile;
}
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Hook para buscar todos os campus
export function useCampuses() {
  return useQuery({
    queryKey: ["campuses"],
    queryFn: async (): Promise<Campus[]> => {
      const response = await fetch("/api/campus");

      if (!response.ok) {
        throw new Error("Failed to fetch campuses");
      }

      const data = await response.json();
      return data;
    },
  });
}

// Hook para buscar um campus específico
export function useCampus(id: string) {
  return useQuery({
    queryKey: ["campus", id],
    queryFn: async (): Promise<Campus> => {
      const response = await fetch(`/api/campus/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch campus");
      }
      return response.json();
    },
    enabled: !!id,
  });
}

// Hook para buscar membros de um campus
export function useCampusMembers(campusId?: string) {
  return useQuery({
    queryKey: campusId ? ["campus-members", campusId] : ["campus-members"],
    queryFn: async (): Promise<CampusMemberWithUser[]> => {
      const url = campusId
        ? `/api/campus-member?campusId=${campusId}`
        : "/api/campus-member";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch campus members");
      }
      return response.json();
    },
  });
}

// Hook para criar campus
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
      queryClient.invalidateQueries({ queryKey: ["campuses"] });
    },
  });
}

// Hook para atualizar campus
export function useUpdateCampus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Campus> }) => {
      const response = await fetch(`/api/campus/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update campus");
      }

      return response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["campuses"] });
      queryClient.invalidateQueries({ queryKey: ["campus", id] });
    },
  });
}

// Hook para deletar campus
export function useDeleteCampus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/campus?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete campus");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campuses"] });
    },
  });
}

// Hook para adicionar membro ao campus
export function useAddCampusMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberData: {
      userId: string;
      campusId: string;
      role?: string;
    }) => {
      const response = await fetch("/api/campus-member", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(memberData),
      });

      if (!response.ok) {
        throw new Error("Failed to add campus member");
      }

      return response.json();
    },
    onSuccess: (_, { campusId }) => {
      queryClient.invalidateQueries({ queryKey: ["campus-members"] });
      queryClient.invalidateQueries({ queryKey: ["campus-members", campusId] });
      queryClient.invalidateQueries({ queryKey: ["campus", campusId] });
    },
  });
}

// Hook para remover membro do campus
export function useRemoveCampusMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/campus-member/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove campus member");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campus-members"] });
    },
  });
}
