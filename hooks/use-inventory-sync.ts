"use client";

import type { BemCopia, InventoryMetadata } from "@/lib/interface";
import {
  clearProcessedData,
  getProcessedData,
  storeProcessedData,
} from "@/utils/data-storage";
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

export function useInventorySync(commissionId: string) {
  const [localData, setLocalData] = useState<BemCopia[]>([]);
  const [apiData, setApiData] = useState<InventoryItem[]>([]);
  const [metadata, setMetadata] = useState<InventoryMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<
    "synced" | "pending" | "unknown" | "syncing"
  >("unknown");
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Carregar dados da API
  const loadFromAPI = useCallback(async () => {
    if (!commissionId) return [];

    try {
      setError(null);
      const response = await fetch(
        `/api/inventory?commissionId=${commissionId}`
      );
      if (response.ok) {
        const data = await response.json();
        setApiData(data);
        return data;
      } else {
        throw new Error(`API retornou status ${response.status}`);
      }
    } catch (error) {
      console.error("Erro ao carregar dados da API:", error);
      setError(error instanceof Error ? error.message : "Erro desconhecido");
    }
    return [];
  }, [commissionId]);

  // Carregar dados locais do IndexedDB
  const loadFromLocal = useCallback(async () => {
    if (!commissionId) return [];

    try {
      setError(null);
      const { data, metadata: localMetadata } = await getProcessedData();
      setLocalData(data || []);
      setMetadata(localMetadata);

      // Verificar status de sincronização
      if (localMetadata && "syncStatus" in localMetadata) {
        const currentStatus = (localMetadata as any).syncStatus || "unknown";
        setSyncStatus(currentStatus);

        // Se o status for "pending", verificar se já deveria estar sincronizado
        if (currentStatus === "pending") {
          const uploadTime = new Date(localMetadata.timestamp).getTime();
          const now = new Date().getTime();
          const timeDiff = now - uploadTime;

          // Se passou mais de 5 minutos e ainda está pending, verificar servidor
          if (timeDiff > 5 * 60 * 1000) {
            console.log(
              "🔍 Verificando status de sincronização no servidor..."
            );
            checkServerSyncStatus();
          }
        }
      } else {
        setSyncStatus("unknown");
      }

      console.log("📱 Dados carregados localmente:", {
        items: data?.length || 0,
        syncStatus: (localMetadata as any)?.syncStatus || "unknown",
      });

      return data || [];
    } catch (error) {
      console.error("Erro ao carregar dados locais:", error);
      setError(
        error instanceof Error ? error.message : "Erro ao carregar dados locais"
      );
      return [];
    }
  }, [commissionId]);

  // Sincronizar dados da API para o local
  const syncToLocal = useCallback(
    async (apiItems: InventoryItem[]) => {
      try {
        setIsSyncing(true);

        // Converter dados da API para o formato local (BemCopia)
        const convertedData: BemCopia[] = apiItems.map((item) => ({
          bem_id: item.id,
          inventario_id: `inv_${commissionId}`,
          grupo_id: `grupo_${commissionId}`,
          campus_id: item.campusId,
          NUMERO: item.number || "",
          STATUS: "ATIVO" as any, // Usando valor padrão
          ED: item.ed || "",
          DESCRICAO: item.description || "",
          ROTULOS: Array.isArray(item.tags)
            ? item.tags.join(", ")
            : item.tags || "",
          RESPONSABILIDADE_ATUAL: item.currentResponsibility || "",
          SETOR_DO_RESPONSAVEL: item.sector || "",
          CAMPUS_DA_LOTACAO_DO_BEM: item.campusId,
          SALA: item.location || "",
          ESTADO_DE_CONSERVACAO: "BOM" as any, // Usando valor padrão
          DESCRICAO_PRINCIPAL: item.description || "",
          MARCA_MODELO: item.brandModel || "",
          ultimo_atualizado_por: "sistema",
          data_ultima_atualizacao: item.updatedAt || new Date(),
          observacoes: null,
          comissao_id: commissionId,
        }));

        const newMetadata: InventoryMetadata = {
          recordCount: convertedData.length,
          timestamp: new Date().toISOString(),
          fileName: `sync_${commissionId}_${Date.now()}.json`,
          usedAcceleration: false,
          syncStatus: "synced", // Marcar como sincronizado quando vem da API
          lastSyncUpdate: new Date().toISOString(),
          commissionId,
        };

        await storeProcessedData(convertedData, newMetadata);
        setLocalData(convertedData);
        setMetadata(newMetadata);
        setLastSync(new Date());

        console.log(
          `Sincronizados ${convertedData.length} itens da API para o local`
        );
      } catch (error) {
        console.error("Erro ao sincronizar para local:", error);
      } finally {
        setIsSyncing(false);
      }
    },
    [commissionId]
  );

  // Verificar status de sincronização no servidor
  const checkServerSyncStatus = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/commission/sync-status?commissionId=${commissionId}`
      );

      if (response.ok) {
        const data = await response.json();

        // Se há dados no servidor, marcar como sincronizado
        if (data.inventory.count > 0) {
          await updateSyncStatus("synced");
          console.log("✅ Status atualizado para sincronizado");
        }
      }
    } catch (error) {
      console.error("Erro ao verificar status no servidor:", error);
    }
  }, [commissionId]);

  // Atualizar status de sincronização no metadata local
  const updateSyncStatus = useCallback(
    async (newStatus: "synced" | "pending" | "unknown" | "syncing") => {
      try {
        const { data, metadata } = await getProcessedData();

        if (metadata) {
          const updatedMetadata = {
            ...metadata,
            syncStatus: newStatus,
            lastSyncUpdate: new Date().toISOString(),
          };

          await storeProcessedData(data, updatedMetadata);
          setSyncStatus(newStatus);
          setMetadata(updatedMetadata);
        }
      } catch (error) {
        console.error("Erro ao atualizar status de sincronização:", error);
      }
    },
    []
  );

  // Função para salvar item localmente E enviar para servidor (se já sincronizado)
  const addItemWithAutoSync = useCallback(
    async (item: BemCopia, campusId: string) => {
      try {
        // 1. Sempre salvar localmente primeiro
        const { data, metadata } = await getProcessedData();
        const updatedData = [...data, item];

        const updatedMetadata: InventoryMetadata = {
          recordCount: updatedData.length,
          timestamp: new Date().toISOString(),
          fileName: metadata?.fileName || "manual_entry.json",
          usedAcceleration: false,
          syncStatus: metadata?.syncStatus === "synced" ? "synced" : "pending",
        };

        await storeProcessedData(updatedData, updatedMetadata);
        setLocalData(updatedData);
        setMetadata(updatedMetadata);

        console.log("💾 Item salvo localmente");

        // 2. Se já está sincronizado, enviar para servidor imediatamente
        if (metadata?.syncStatus === "synced") {
          console.log("🔄 Enviando para servidor (sistema já sincronizado)...");

          // Mapear dados para formato da API
          const apiData = {
            commissionId,
            campusId,
            number: item.NUMERO,
            description: item.DESCRICAO,
            brandModel: item.MARCA_MODELO || null,
            currentResponsibility: item.RESPONSABILIDADE_ATUAL || null,
            conservationState: item.ESTADO_DE_CONSERVACAO || null,
            location: item.SALA || null,
            tags: item.ROTULOS
              ? item.ROTULOS.split(",")
                  .map((tag) => tag.trim())
                  .filter((tag) => tag.length > 0)
              : [],
            ed: item.ED || null,
            sector: item.SETOR_DO_RESPONSAVEL || null,
          };

          const response = await fetch("/api/inventory", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(apiData),
          });

          if (response.ok) {
            console.log("✅ Item enviado para servidor com sucesso");
          } else {
            console.warn(
              "⚠️ Falha ao enviar para servidor, mas salvo localmente"
            );
            // Marcar como pending para tentar sincronizar depois
            await updateSyncStatus("pending");
          }
        } else {
          console.log(
            "📋 Item salvo localmente (aguardando sincronização inicial)"
          );
        }
      } catch (error) {
        console.error("Erro ao adicionar item:", error);
        throw error;
      }
    },
    [commissionId, updateSyncStatus]
  );

  // Carregar todos os dados (API + local) e sincronizar
  const loadAndSync = useCallback(async () => {
    setIsLoading(true);
    try {
      // Carregar dados da API e local em paralelo
      const [apiItems, localItems] = await Promise.all([
        loadFromAPI(),
        loadFromLocal(),
      ]);

      // Se temos dados da API, sincronizar para local
      if (apiItems.length > 0) {
        await syncToLocal(apiItems);
      } else if (localItems.length > 0) {
        // Se não temos dados da API mas temos locais, usar os locais
        console.log("Usando dados locais (API indisponível)");
      }
    } catch (error) {
      console.error("Erro ao carregar e sincronizar dados:", error);
    } finally {
      setIsLoading(false);
    }
  }, [loadFromAPI, loadFromLocal, syncToLocal]);

  // Forçar sincronização
  const forceSync = useCallback(async () => {
    const apiItems = await loadFromAPI();
    if (apiItems.length > 0) {
      await syncToLocal(apiItems);
    }
  }, [loadFromAPI, syncToLocal]);

  // Limpar dados locais
  const clearLocal = useCallback(async () => {
    try {
      await clearProcessedData();
      setLocalData([]);
      setMetadata(null);
      setLastSync(null);
    } catch (error) {
      console.error("Erro ao limpar dados locais:", error);
    }
  }, []);

  // Carregar dados na inicialização
  useEffect(() => {
    loadAndSync();
  }, [loadAndSync]);

  return {
    localData,
    apiData,
    metadata,
    isLoading,
    isSyncing,
    lastSync,
    syncStatus,
    loadAndSync,
    forceSync,
    clearLocal,
    syncToLocal,
    addItemWithAutoSync,
    updateSyncStatus,
    checkServerSyncStatus,
  };
}
