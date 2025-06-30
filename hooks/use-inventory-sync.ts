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
    "synced" | "pending" | "unknown"
  >("unknown");

  // Carregar dados da API
  const loadFromAPI = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/inventory?commissionId=${commissionId}`
      );
      if (response.ok) {
        const data = await response.json();
        setApiData(data);
        return data;
      }
    } catch (error) {
      console.error("Erro ao carregar dados da API:", error);
    }
    return [];
  }, [commissionId]);

  // Carregar dados locais do IndexedDB
  const loadFromLocal = useCallback(async () => {
    try {
      const { data, metadata: localMetadata } = await getProcessedData();
      setLocalData(data || []);
      setMetadata(localMetadata);

      // Verificar status de sincronização
      if (localMetadata && "syncStatus" in localMetadata) {
        setSyncStatus((localMetadata as any).syncStatus || "unknown");
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
      return [];
    }
  }, []);

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
  };
}
