"use client";

import type {
  InventoryHistoryWithRelations,
  InventoryItem,
  InventoryItemWithRelations,
} from "@/interface";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Hook para buscar itens de inventário (com filtros opcionais)
export function useInventoryItems(commissionId?: string, userId?: string) {
  return useQuery({
    queryKey: ["inventory-items", commissionId, userId],
    queryFn: async (): Promise<InventoryItemWithRelations[]> => {
      let url = "/api/inventory";
      const params = new URLSearchParams();

      if (commissionId) params.append("commissionId", commissionId);
      if (userId) params.append("userId", userId);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch inventory items");
      }
      return response.json();
    },
  });
}

// Hook para buscar um item de inventário específico
export function useInventoryItem(id: string) {
  return useQuery({
    queryKey: ["inventory-item", id],
    queryFn: async (): Promise<InventoryItemWithRelations> => {
      const response = await fetch(`/api/inventory/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch inventory item");
      }
      return response.json();
    },
    enabled: !!id,
  });
}

// Hook para buscar histórico de inventários
export function useInventoryHistory(
  commissionId?: string,
  inventoryItemId?: string
) {
  return useQuery({
    queryKey: ["inventory-history", commissionId, inventoryItemId],
    queryFn: async (): Promise<InventoryHistoryWithRelations[]> => {
      let url = "/api/inventory-history";
      const params = new URLSearchParams();

      if (commissionId) params.append("commissionId", commissionId);
      if (inventoryItemId) params.append("inventoryItemId", inventoryItemId);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch inventory history");
      }
      return response.json();
    },
  });
}

// Hook para criar item de inventário
export function useCreateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemData: Omit<InventoryItem, "id" | "updatedAt">) => {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(itemData),
      });

      if (!response.ok) {
        throw new Error("Failed to create inventory item");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      if (variables.commissionId) {
        queryClient.invalidateQueries({
          queryKey: ["inventory-items", variables.commissionId],
        });
      }
    },
  });
}

// Hook para atualizar item de inventário
export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<InventoryItem>;
    }) => {
      const response = await fetch(`/api/inventory/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update inventory item");
      }

      return response.json();
    },
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-item", id] });
      if (data.commissionId) {
        queryClient.invalidateQueries({
          queryKey: ["inventory-items", data.commissionId],
        });
      }
    },
  });
}

// Hook para deletar item de inventário
export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/inventory/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete inventory item");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
    },
  });
}

// Hook para fazer upload de inventário via arquivo
export function useUploadInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commissionId,
      file,
    }: {
      commissionId: string;
      file: File;
    }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("commissionId", commissionId);

      const response = await fetch("/api/inventory/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload inventory");
      }

      return response.json();
    },
    onSuccess: (_, { commissionId }) => {
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      queryClient.invalidateQueries({
        queryKey: ["inventory-items", commissionId],
      });
      queryClient.invalidateQueries({
        queryKey: ["inventory-history", commissionId],
      });
    },
  });
}
