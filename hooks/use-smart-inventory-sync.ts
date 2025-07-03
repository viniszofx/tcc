"use client";

import type {
  BemCopia,
  EstadoConservacao,
  InventoryMetadata,
  StatusBem,
} from "@/lib/interface";
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

export interface SyncInfo {
  serverCount: number;
  localCount: number;
  lastServerUpdate?: Date | undefined;
  lastLocalUpdate?: Date | undefined;
  needsSync: boolean;
  syncReason?:
    | "count_mismatch"
    | "newer_server_data"
    | "no_local_data"
    | "forced";
}

export function useSmartInventorySync(commissionId: string) {
  const [localData, setLocalData] = useState<BemCopia[]>([]);
  const [apiData, setApiData] = useState<InventoryItem[]>([]);
  const [metadata, setMetadata] = useState<InventoryMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncInfo, setSyncInfo] = useState<SyncInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingItems, setPendingItems] = useState<BemCopia[]>([]);

  // Verificar contagem no servidor
  const checkServerCount = useCallback(async (): Promise<{
    count: number;
    lastUpdated: Date | null;
  }> => {
    if (!commissionId) return { count: 0, lastUpdated: null };

    try {
      const response = await fetch(
        `/api/inventory/count?commissionId=${commissionId}`
      );
      if (response.ok) {
        const data = await response.json();
        return {
          count: data.count,
          lastUpdated: data.lastUpdated ? new Date(data.lastUpdated) : null,
        };
      }
    } catch (error) {
      console.error("Erro ao verificar contagem no servidor:", error);
    }
    return { count: 0, lastUpdated: null };
  }, [commissionId]);

  // Verificar se precisa sincronizar
  const shouldSync = useCallback(
    async (forceSync = false): Promise<SyncInfo> => {
      const { data: localItems, metadata: localMetadata } =
        await getProcessedData();
      const localCount = localItems?.length || 0;
      const serverInfo = await checkServerCount();

      const lastLocalUpdate = localMetadata?.timestamp
        ? new Date(localMetadata.timestamp)
        : null;

      const syncInfo: SyncInfo = {
        serverCount: serverInfo.count,
        localCount,
        lastServerUpdate: serverInfo.lastUpdated || undefined,
        lastLocalUpdate: lastLocalUpdate || undefined,
        needsSync: false,
      };

      if (forceSync) {
        syncInfo.needsSync = true;
        syncInfo.syncReason = "forced";
      } else if (localCount === 0 && serverInfo.count > 0) {
        syncInfo.needsSync = true;
        syncInfo.syncReason = "no_local_data";
      } else if (localCount !== serverInfo.count) {
        syncInfo.needsSync = true;
        syncInfo.syncReason = "count_mismatch";
      } else if (
        serverInfo.lastUpdated &&
        lastLocalUpdate &&
        serverInfo.lastUpdated > lastLocalUpdate
      ) {
        syncInfo.needsSync = true;
        syncInfo.syncReason = "newer_server_data";
      }

      console.log("🔍 Verificação de sincronização:", {
        local: localCount,
        server: serverInfo.count,
        needsSync: syncInfo.needsSync,
        reason: syncInfo.syncReason,
      });

      return syncInfo;
    },
    [commissionId, checkServerCount]
  );

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

      // Separar itens pendentes (não sincronizados) dos sincronizados
      const syncedItems = data?.filter((item) => !item.isPending) || [];
      const pendingItems = data?.filter((item) => item.isPending) || [];

      setLocalData(syncedItems);
      setPendingItems(pendingItems);
      setMetadata(localMetadata);

      console.log("📱 Dados carregados localmente:", {
        synced: syncedItems.length,
        pending: pendingItems.length,
        total: data?.length || 0,
      });

      return syncedItems;
    } catch (error) {
      console.error("Erro ao carregar dados locais:", error);
      setError(error instanceof Error ? error.message : "Erro desconhecido");
      return [];
    }
  }, [commissionId]);

  // Sincronização inteligente
  const smartSync = useCallback(
    async (forceSync = false) => {
      if (!commissionId || isSyncing) return;

      setIsSyncing(true);
      setError(null);

      try {
        // Verificar se precisa sincronizar
        const info = await shouldSync(forceSync);
        setSyncInfo(info);

        if (!info.needsSync && !forceSync) {
          console.log("✅ Dados já sincronizados, usando cache local");
          await loadFromLocal();
          setIsSyncing(false);
          return;
        }

        console.log(`🔄 Iniciando sincronização: ${info.syncReason}`);

        // Buscar dados atualizados do servidor
        const apiItems = await loadFromAPI();

        // Converter dados da API para formato local
        const convertedData: BemCopia[] = apiItems.map(
          (item: InventoryItem) => ({
            bem_id: item.id,
            inventario_id: "",
            grupo_id: "",
            campus_id: item.campusId,
            NUMERO: item.number || "",
            STATUS: "ATIVO" as StatusBem,
            ED: item.ed || "",
            DESCRICAO: item.description || "",
            ROTULOS: item.tags?.join(", ") || "",
            RESPONSABILIDADE_ATUAL: item.currentResponsibility || "",
            SETOR_DO_RESPONSAVEL: item.sector || "",
            CAMPUS_DA_LOTACAO_DO_BEM: "",
            SALA: item.location || "",
            ESTADO_DE_CONSERVACAO:
              (item.conservationState as EstadoConservacao) || "BOM",
            DESCRICAO_PRINCIPAL: item.description || "",
            MARCA_MODELO: item.brandModel || "",
            ultimo_atualizado_por: "",
            data_ultima_atualizacao: item.updatedAt || new Date(),

            // Novos campos
            id: item.id,
            isPending: false, // Dados do servidor são considerados sincronizados
            createdAt:
              item.createdAt?.toISOString() || new Date().toISOString(),
            updatedAt:
              item.updatedAt?.toISOString() || new Date().toISOString(),
          })
        );

        // Adicionar itens pendentes de volta
        const allData = [...convertedData, ...pendingItems];

        // Atualizar metadata com informações de sincronização
        const newMetadata: InventoryMetadata = {
          fileName: "smart_sync",
          recordCount: convertedData.length,
          usedAcceleration: true,
          timestamp: new Date().toISOString(),
          totalItems: convertedData.length,
          commissionId,
          lastSyncInfo: info,
          pendingCount: pendingItems.length,
        };

        await storeProcessedData(allData, newMetadata);
        setLocalData(convertedData);
        setMetadata(newMetadata);
        setLastSync(new Date());

        console.log(`✅ Sincronização concluída:`, {
          serverItems: convertedData.length,
          pendingItems: pendingItems.length,
          reason: info.syncReason,
        });
      } catch (error) {
        console.error("Erro na sincronização inteligente:", error);
        setError(
          error instanceof Error ? error.message : "Erro na sincronização"
        );
      } finally {
        setIsSyncing(false);
      }
    },
    [
      commissionId,
      isSyncing,
      shouldSync,
      loadFromAPI,
      loadFromLocal,
      pendingItems,
    ]
  );

  // Adicionar item local (será marcado como pendente)
  const addLocalItem = useCallback(
    async (newItem: Omit<BemCopia, "id" | "isPending">) => {
      try {
        const itemWithMeta: BemCopia = {
          ...newItem,
          id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          isPending: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Adicionar ao estado local
        const updatedPending = [...pendingItems, itemWithMeta];
        setPendingItems(updatedPending);

        // Salvar no IndexedDB
        const allData = [...localData, ...updatedPending];
        const updatedMetadata: InventoryMetadata = {
          ...metadata,
          timestamp: new Date().toISOString(),
          totalItems: localData.length,
          pendingCount: updatedPending.length,
        } as InventoryMetadata;

        await storeProcessedData(allData, updatedMetadata);
        setMetadata(updatedMetadata);

        console.log(
          "📝 Item adicionado localmente (pendente):",
          itemWithMeta.id || "temp_item"
        );
        return itemWithMeta;
      } catch (error) {
        console.error("Erro ao adicionar item local:", error);
        throw error;
      }
    },
    [localData, pendingItems, metadata]
  );

  // Sincronizar apenas itens pendentes
  const syncPendingItems = useCallback(async () => {
    if (pendingItems.length === 0 || isSyncing) return;

    setIsSyncing(true);
    try {
      console.log(`🔄 Sincronizando ${pendingItems.length} itens pendentes...`);

      for (const item of pendingItems) {
        // Converter para formato da API
        const apiItem = {
          commissionId,
          number: item.NUMERO,
          description: item.DESCRICAO,
          brandModel: item.MARCA_MODELO,
          currentResponsibility: item.RESPONSABILIDADE_ATUAL,
          conservationState: item.ESTADO_DE_CONSERVACAO,
          location: item.SALA,
          tags: item.ROTULOS ? item.ROTULOS.split(", ") : [],
          ed: item.ED,
          sector: item.SETOR_DO_RESPONSAVEL,
          campusId: item.campus_id,
        };

        // Enviar para o servidor
        const response = await fetch("/api/inventory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apiItem),
        });

        if (!response.ok) {
          throw new Error(
            `Erro ao sincronizar item ${item.id || "desconhecido"}`
          );
        }
      }

      // Limpar itens pendentes e forçar nova sincronização
      setPendingItems([]);
      console.log("✅ Itens pendentes sincronizados com sucesso");

      // Forçar sincronização completa para obter IDs corretos
      await smartSync(true);
    } catch (error) {
      console.error("Erro ao sincronizar itens pendentes:", error);
      setError("Erro ao sincronizar itens pendentes");
    } finally {
      setIsSyncing(false);
    }
  }, [pendingItems, commissionId, metadata, smartSync, isSyncing]);

  // Inicialização
  useEffect(() => {
    if (!commissionId) return;

    const initialize = async () => {
      setIsLoading(true);

      // Carregar dados locais primeiro
      await loadFromLocal();

      // Verificar se precisa sincronizar
      await smartSync();

      setIsLoading(false);
    };

    initialize();
  }, [commissionId]);

  // Limpar dados
  const clearData = useCallback(async () => {
    await clearProcessedData();
    setLocalData([]);
    setPendingItems([]);
    setApiData([]);
    setMetadata(null);
    setSyncInfo(null);
    setLastSync(null);
  }, []);

  return {
    // Dados
    localData,
    apiData,
    pendingItems,
    allData: [...localData, ...pendingItems], // Combinação para exibição
    metadata,
    syncInfo,

    // Estados
    isLoading,
    isSyncing,
    error,
    lastSync,

    // Ações
    smartSync,
    addLocalItem,
    syncPendingItems,
    clearData,
    forceSync: () => smartSync(true),

    // Informações
    hasPendingItems: pendingItems.length > 0,
    totalItems: localData.length + pendingItems.length,
    syncedItems: localData.length,
    pendingCount: pendingItems.length,
  };
}
