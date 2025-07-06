"use client";

import type { BemCopia, InventoryMetadata } from '@/types';
import { getProcessedData, storeProcessedData } from "@/utils/data-storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

export interface InventoryItem {
  id: string;
  commissionId: string;
  number?: string;
  description?: string;
  brandModel?: string;
  currentResponsibility?: string;
  conservationState?: string;
  location?: string;
  tags?: string[];
  ed?: string;
  sector?: string;
  campusId: string;
  updatedAt?: Date;
  createdAt?: Date;
}

export interface LocalInventoryItem extends Omit<InventoryItem, "id"> {
  localId: string;
  id?: string; // Pode não ter ID do servidor ainda
  synced: boolean;
  pendingSync: boolean;
  action: "create" | "update" | "delete";
}

// Converter BemCopia para InventoryItem
function convertBemCopiaToInventoryItem(
  item: BemCopia,
  commissionId: string,
  campusId: string
): Omit<InventoryItem, "id"> {
  return {
    commissionId,
    campusId,
    number:
      item.NUMERO ||
      `ITEM-${Date.now()}-${Math.random().toString(36).substring(2)}`,
    description: item.DESCRICAO || "Item importado",
    brandModel: item.MARCA_MODELO || item.DESCRICAO_PRINCIPAL || undefined,
    currentResponsibility: item.RESPONSABILIDADE_ATUAL || undefined,
    conservationState: item.ESTADO_DE_CONSERVACAO?.toLowerCase() || "bom",
    location: item.SALA || undefined,
    tags: item.ROTULOS
      ? item.ROTULOS.split(",")
          .map((tag: string) => tag.trim())
          .filter(Boolean)
      : [],
    ed: item.ED || undefined,
    sector: item.SETOR_DO_RESPONSAVEL || undefined,
  };
}

export function useInventoryWithSync(commissionId: string) {
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingItems, setPendingItems] = useState<LocalInventoryItem[]>([]);

  // Detectar mudanças de conectividade
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Query para buscar dados do servidor com paginação e timeout
  const {
    data: serverResponse,
    isLoading: isLoadingServer,
    error: serverError,
  } = useQuery({
    queryKey: ["inventory", commissionId],
    queryFn: async (): Promise<{ items: InventoryItem[]; pagination: any }> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
      
      try {
        console.log(`🔍 Buscando inventário para comissão: ${commissionId}`);
        const startTime = Date.now();
        
        const response = await fetch(
          `/api/inventory?commissionId=${commissionId}&limit=1000`,
          {
            signal: controller.signal,
            headers: {
              'Cache-Control': 'no-cache',
            },
          }
        );
        
        const duration = Date.now() - startTime;
        console.log(`⏱️ Requisição de inventário concluída em ${duration}ms`);
        
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Verificar se a resposta tem o formato esperado (com paginação)
        if (data.items && Array.isArray(data.items)) {
          console.log(`✅ Carregados ${data.items.length} itens de inventário`);
          return data;
        } else if (Array.isArray(data)) {
          // Formato antigo (sem paginação)
          console.log(`✅ Carregados ${data.length} itens de inventário (formato legado)`);
          return { items: data, pagination: null };
        } else {
          throw new Error('Formato de resposta inválido');
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.error('🔥 Timeout na requisição de inventário');
          throw new Error('Timeout: A requisição demorou muito para responder');
        }
        console.error('❌ Erro ao buscar inventário:', error.message);
        throw error;
      } finally {
        clearTimeout(timeoutId);
      }
    },
    enabled: !!commissionId && isOnline,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: (failureCount, error: any) => {
      // Retry até 2 vezes para erros de rede, mas não para erros 4xx
      if (failureCount >= 2) return false;
      if (error?.message?.includes('4')) return false; // Não retry para erros 4xx
      return true;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
  
  // Extrair dados do servidor
  const serverData = serverResponse?.items || [];

  // Query para buscar dados locais
  const { data: localData, isLoading: isLoadingLocal } = useQuery({
    queryKey: ["inventory-local", commissionId],
    queryFn: async () => {
      const { data, metadata } = await getProcessedData();

      // Verificar se os dados pertencem à comissão correta
      if (metadata?.commissionId && metadata.commissionId !== commissionId) {
        console.log(
          `⚠️ Dados locais pertencem à comissão ${metadata.commissionId}, mas foi solicitada comissão ${commissionId}. Retornando dados vazios.`
        );
        return { data: [], metadata: null };
      }

      return { data: data || [], metadata };
    },
    staleTime: 0, // Sempre verificar dados locais
  });

  // Mutation para criar item no servidor
  const createItemMutation = useMutation({
    mutationFn: async (itemData: Omit<InventoryItem, "id">) => {
      const response = await fetch("/api/inventory/item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData),
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidar cache para recarregar dados
      queryClient.invalidateQueries({ queryKey: ["inventory", commissionId] });
    },
  });

  // Mutation para atualizar item no servidor
  const updateItemMutation = useMutation({
    mutationFn: async (itemData: InventoryItem) => {
      const response = await fetch("/api/inventory/item", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData),
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", commissionId] });
    },
  });

  // Mutation para deletar item no servidor
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await fetch(`/api/inventory/item?id=${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", commissionId] });
    },
  });

  // Adicionar item com sincronização inteligente
  const addItem = useCallback(
    async (itemData: Omit<InventoryItem, "id">) => {
      const localId = `local-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}`;

      // Criar item local imediatamente
      const localItem: LocalInventoryItem = {
        ...itemData,
        localId,
        synced: false,
        pendingSync: true,
        action: "create",
      };

      // Adicionar aos itens pendentes
      setPendingItems((prev) => [...prev, localItem]);

      // Salvar no IndexedDB
      try {
        const { data: currentLocal = [] } = await getProcessedData();
        const newLocalData = [
          ...currentLocal,
          convertItemToLocalFormat(localItem),
        ];

        await storeProcessedData(newLocalData, {
          fileName: "manual-add",
          timestamp: new Date().toISOString(),
          recordCount: newLocalData.length,
          syncStatus: "pending",
        } as InventoryMetadata);

        // Invalidar query local
        queryClient.invalidateQueries({
          queryKey: ["inventory-local", commissionId],
        });
      } catch (error) {
        console.error("Erro ao salvar item localmente:", error);
      }

      // Tentar sincronizar se online
      if (isOnline) {
        try {
          const result = await createItemMutation.mutateAsync(itemData);

          // Atualizar item com ID do servidor
          setPendingItems((prev) =>
            prev.map((item) =>
              item.localId === localId
                ? {
                    ...item,
                    id: result.item.id,
                    synced: true,
                    pendingSync: false,
                  }
                : item
            )
          );

          console.log("✅ Item sincronizado com sucesso:", result.item.id);
        } catch (error) {
          console.error("❌ Erro ao sincronizar item:", error);
          // Manter como pendente para tentar depois
        }
      }

      return localId;
    },
    [commissionId, isOnline, createItemMutation, queryClient]
  );

  // Atualizar item com sincronização
  const updateItem = useCallback(
    async (itemData: InventoryItem) => {
      // Atualizar localmente primeiro
      try {
        const { data: currentLocal = [] } = await getProcessedData();
        const updatedLocal = currentLocal.map((item) =>
          item.bem_id === itemData.id
            ? { ...item, ...convertItemToLocalFormat(itemData) }
            : item
        );

        await storeProcessedData(updatedLocal, {
          fileName: "manual-update",
          timestamp: new Date().toISOString(),
          recordCount: updatedLocal.length,
          syncStatus: "pending",
        } as InventoryMetadata);

        queryClient.invalidateQueries({
          queryKey: ["inventory-local", commissionId],
        });
      } catch (error) {
        console.error("Erro ao atualizar item localmente:", error);
      }

      // Tentar sincronizar se online
      if (isOnline && itemData.id) {
        try {
          await updateItemMutation.mutateAsync(itemData);
          console.log("✅ Item atualizado no servidor:", itemData.id);
        } catch (error) {
          console.error("❌ Erro ao atualizar item no servidor:", error);
        }
      }
    },
    [commissionId, isOnline, updateItemMutation, queryClient]
  );

  // Deletar item com sincronização
  const deleteItem = useCallback(
    async (itemId: string) => {
      // Remover localmente primeiro
      try {
        const { data: currentLocal = [] } = await getProcessedData();
        const filteredLocal = currentLocal.filter(
          (item) => item.bem_id !== itemId
        );

        await storeProcessedData(filteredLocal, {
          fileName: "manual-delete",
          timestamp: new Date().toISOString(),
          recordCount: filteredLocal.length,
          syncStatus: "pending",
        } as InventoryMetadata);

        queryClient.invalidateQueries({
          queryKey: ["inventory-local", commissionId],
        });
      } catch (error) {
        console.error("Erro ao deletar item localmente:", error);
      }

      // Tentar sincronizar se online
      if (isOnline) {
        try {
          await deleteItemMutation.mutateAsync(itemId);
          console.log("✅ Item deletado do servidor:", itemId);
        } catch (error) {
          console.error("❌ Erro ao deletar item do servidor:", error);
        }
      }
    },
    [isOnline, deleteItemMutation, queryClient]
  );

  // Sincronizar itens pendentes
  const syncPendingItems = useCallback(async () => {
    if (!isOnline || pendingItems.length === 0) return;

    console.log(`🔄 Sincronizando ${pendingItems.length} itens pendentes...`);

    for (const item of pendingItems) {
      try {
        if (item.action === "create" && !item.id) {
          const result = await createItemMutation.mutateAsync(item);

          // Atualizar item com ID do servidor
          setPendingItems((prev) =>
            prev.map((p) =>
              p.localId === item.localId
                ? { ...p, id: result.item.id, synced: true, pendingSync: false }
                : p
            )
          );
        }
      } catch (error) {
        console.error(`❌ Erro ao sincronizar item ${item.localId}:`, error);
      }
    }

    // Remover itens sincronizados
    setPendingItems((prev) => prev.filter((item) => !item.synced));
  }, [isOnline, createItemMutation]);

  // Auto-sincronizar quando voltar online
  useEffect(() => {
    if (isOnline && pendingItems.length > 0) {
      syncPendingItems();
    }
  }, [isOnline, pendingItems.length]);

  // Converter item para formato local (BemCopia)
  function convertItemToLocalFormat(
    item: LocalInventoryItem | InventoryItem
  ): BemCopia {
    return {
      bem_id: item.id || ("localId" in item ? item.localId : ""),
      inventario_id: commissionId,
      grupo_id: `grupo-${commissionId}`,
      campus_id: item.campusId,
      NUMERO: item.number || "",
      STATUS: "ATIVO" as any,
      ED: item.ed || "",
      DESCRICAO: item.description || "",
      ROTULOS: item.tags?.join(", ") || "",
      RESPONSABILIDADE_ATUAL: item.currentResponsibility || "",
      SETOR_DO_RESPONSAVEL: item.sector || "",
      CAMPUS_DA_LOTACAO_DO_BEM: item.campusId,
      SALA: item.location || "",
      ESTADO_DE_CONSERVACAO: (item.conservationState?.toUpperCase() ||
        "BOM") as any,
      DESCRICAO_PRINCIPAL: item.description || "",
      MARCA_MODELO: item.brandModel || "",
      ultimo_atualizado_por: "Sistema",
      data_ultima_atualizacao: new Date(),
    };
  }

  // Combinar dados locais e do servidor, priorizando dados locais
  const combinedData = (() => {
    if (!localData?.data || localData.data.length === 0) {
      return serverData;
    }

    // Se temos dados locais, usar eles como prioridade
    const localItems = localData.data.map((item) => ({
      id: item.bem_id || `local-${Date.now()}-${Math.random()}`,
      commissionId,
      number: item.NUMERO,
      description: item.DESCRICAO,
      brandModel: item.MARCA_MODELO || item.DESCRICAO_PRINCIPAL,
      currentResponsibility: item.RESPONSABILIDADE_ATUAL,
      conservationState: item.ESTADO_DE_CONSERVACAO?.toLowerCase() || "bom",
      location: item.SALA,
      tags: item.ROTULOS
        ? item.ROTULOS.split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      ed: item.ED,
      sector: item.SETOR_DO_RESPONSAVEL,
      campusId: item.campus_id,
      updatedAt: item.data_ultima_atualizacao || new Date(),
      createdAt: new Date(),
    })) as InventoryItem[];

    return localItems;
  })();

  return {
    data: combinedData,
    isLoading: isLoadingServer || isLoadingLocal,
    error: serverError,
    isOnline,
    pendingItemsCount: pendingItems.length,
    localData: localData?.data || [],
    serverData: serverData || [],
    metadata: localData?.metadata,
    pagination: serverResponse?.pagination,

    // Actions
    addItem,
    updateItem,
    deleteItem,
    syncPendingItems,

    // Mutation states
    isCreating: createItemMutation.isPending,
    isUpdating: updateItemMutation.isPending,
    isDeleting: deleteItemMutation.isPending,
    
    // Performance info
    hasTimeout: serverError?.message?.includes('Timeout'),
    errorType: serverError?.message?.includes('fetch failed') ? 'network' : 
               serverError?.message?.includes('Timeout') ? 'timeout' : 
               serverError ? 'server' : null,
  };
}
