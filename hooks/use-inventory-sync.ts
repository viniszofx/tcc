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

      // Verificar se os dados pertencem à comissão correta
      if (
        localMetadata?.commissionId &&
        localMetadata.commissionId !== commissionId
      ) {
        console.log(
          `⚠️ Dados locais pertencem à comissão ${localMetadata.commissionId}, mas foi solicitada comissão ${commissionId}. Limpando dados locais.`
        );
        setLocalData([]);
        setMetadata(null);
        setSyncStatus("unknown");
        return [];
      }

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
        commissionId: localMetadata?.commissionId,
        requestedCommissionId: commissionId,
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

  const transformToInventoryItem = (
    bem: BemCopia,
    commissionId: string,
    campusId: string
  ): InventoryItem => {
    return {
      id: bem.bem_id || crypto.randomUUID(),
      commissionId,
      campusId,
      number: bem.NUMERO?.toString(),
      description: bem.DESCRICAO,
      brandModel: bem.MARCA_MODELO,
      currentResponsibility: bem.RESPONSABILIDADE_ATUAL,
      conservationState: bem.ESTADO_DE_CONSERVACAO?.toLowerCase(),
      location: bem.SALA,
      tags: [],
      ed: bem.ED,
      sector: bem.SETOR_DO_RESPONSAVEL,
    };
  };

  // Função para salvar item localmente E enviar para servidor (se já sincronizado)
  const addItemWithAutoSync = useCallback(
    async (newItem: BemCopia) => {
      if (!commissionId) {
        console.error("Commission ID não fornecido");
        return false;
      }

      try {
        setIsSyncing(true);
        setSyncStatus("syncing");

        // Transformar o item para o formato esperado pelo servidor
        const transformedItem = transformToInventoryItem(
          newItem,
          commissionId,
          metadata?.campusId || ""
        );

        // Enviar para a API
        const response = await fetch("/api/inventory", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            commissionId,
            item: transformedItem,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Erro ao adicionar item");
        }

        // Atualizar dados locais
        const addedItem = await response.json();
        setApiData((prev) => [...prev, addedItem]);
        setLocalData((prev) => [...prev, newItem]);

        setIsSyncing(false);
        setSyncStatus("synced");
        setLastSync(new Date());
        return true;
      } catch (error) {
        console.error("Erro ao adicionar item:", error);
        setIsSyncing(false);
        setSyncStatus("unknown");
        setError(error instanceof Error ? error.message : "Erro desconhecido");
        return false;
      }
    },
    [commissionId, metadata?.campusId]
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

  // Enviar dados locais para a API
  const syncLocalToAPI = useCallback(async () => {
    if (!commissionId) return false;

    try {
      setIsSyncing(true);
      console.log("🔄 Iniciando sincronização de dados locais para API...");

      // Carregar dados locais
      const { data: localItems, metadata: localMetadata } =
        await getProcessedData();

      if (!localItems || localItems.length === 0) {
        console.log("📭 Nenhum dado local para sincronizar");
        return false;
      }

      console.log(`📊 Enviando ${localItems.length} itens para a API...`);

      // Enviar para a API no formato correto
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commissionId,
          items: localItems,
          metadata: localMetadata || {
            fileName: `sync_${commissionId}_${Date.now()}.json`,
            timestamp: new Date().toISOString(),
            recordCount: localItems.length,
            uploadedBy: "Sincronização",
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao sincronizar com a API");
      }

      const result = await response.json();
      console.log("✅ Dados sincronizados com sucesso:", result);

      // Atualizar metadata local para marcar como sincronizado
      const updatedMetadata: InventoryMetadata = {
        ...(localMetadata || {}),
        syncStatus: "synced",
        lastSyncUpdate: new Date().toISOString(),
        recordCount: localItems.length,
        timestamp: new Date().toISOString(),
        fileName:
          localMetadata?.fileName || `sync_${commissionId}_${Date.now()}.json`,
        usedAcceleration: localMetadata?.usedAcceleration || false,
      };

      await storeProcessedData(localItems, updatedMetadata);
      setMetadata(updatedMetadata);
      setSyncStatus("synced");
      setLastSync(new Date());

      return true;
    } catch (error) {
      console.error("❌ Erro ao sincronizar dados locais para API:", error);
      setSyncStatus("pending");
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, [commissionId]);

  // Forçar sincronização - agora tenta ambas as direções
  const forceSync = useCallback(async () => {
    try {
      setIsSyncing(true);
      console.log("🔄 Iniciando sincronização forçada...");

      // 1. Primeiro, tentar sincronizar dados locais para a API (se houver dados locais pending)
      const { metadata: localMetadata } = await getProcessedData();
      if (localMetadata && (localMetadata as any).syncStatus === "pending") {
        console.log(
          "📤 Dados locais pendentes detectados, sincronizando para API..."
        );
        await syncLocalToAPI();
      }

      // 2. Depois, carregar dados atualizados da API
      console.log("📥 Carregando dados atualizados da API...");
      const apiItems = await loadFromAPI();
      if (apiItems.length > 0) {
        await syncToLocal(apiItems);
      }

      console.log("✅ Sincronização forçada concluída");
    } catch (error) {
      console.error("❌ Erro na sincronização forçada:", error);
      setError(
        error instanceof Error ? error.message : "Erro na sincronização"
      );
    } finally {
      setIsSyncing(false);
    }
  }, [loadFromAPI, syncToLocal, syncLocalToAPI]);

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
    syncLocalToAPI,
    clearLocal,
    syncToLocal,
    addItemWithAutoSync,
    updateSyncStatus,
    checkServerSyncStatus,
  };
}
