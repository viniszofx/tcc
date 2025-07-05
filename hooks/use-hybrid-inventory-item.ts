"use client";

import { useInventoryItemDetailData } from "@/hooks/queries/use-page-data";
import type { InventoryItemWithRelations } from '@/types';
import {
  convertIndexedDBItemToInventoryItem,
  findItemInIndexedDB,
  hasIndexedDBData,
} from "@/utils/indexeddb-helpers";
import { useEffect, useState } from "react";

interface UseHybridInventoryItemOptions {
  itemId: string;
  commissionId?: string;
  campusId?: string;
  allowOfflineAccess?: boolean;
}

interface UseHybridInventoryItemReturn {
  item: InventoryItemWithRelations | null;
  isLoading: boolean;
  error: string | null;
  isOfflineMode: boolean;
  hasLocalData: boolean;
  refetch: () => void;
}

/**
 * Hook híbrido que busca dados do servidor primeiro,
 * mas permite acesso offline usando IndexedDB quando necessário
 */
export function useHybridInventoryItem({
  itemId,
  commissionId,
  campusId,
  allowOfflineAccess = true,
}: UseHybridInventoryItemOptions): UseHybridInventoryItemReturn {
  const [offlineItem, setOfflineItem] =
    useState<InventoryItemWithRelations | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [hasLocalData, setHasLocalData] = useState(false);
  const [isLoadingOffline, setIsLoadingOffline] = useState(false);

  // Tentar buscar dados do servidor primeiro
  const {
    item: serverItem,
    isLoading: isLoadingServer,
    error: serverError,
    refetch: refetchServer,
  } = useInventoryItemDetailData(itemId);

  // Verificar se há dados locais disponíveis
  useEffect(() => {
    const checkLocalData = async () => {
      if (!allowOfflineAccess) return;

      try {
        const localDataInfo = await hasIndexedDBData(commissionId);
        setHasLocalData(
          localDataInfo.hasData && localDataInfo.isCorrectCommission
        );

        console.log(
          `📊 Dados locais disponíveis: ${localDataInfo.hasData}, ${localDataInfo.itemCount} itens, comissão correta: ${localDataInfo.isCorrectCommission}`
        );
      } catch (error) {
        console.error("Erro ao verificar dados locais:", error);
        setHasLocalData(false);
      }
    };

    checkLocalData();
  }, [allowOfflineAccess, commissionId]);

  // Buscar dados offline quando necessário
  useEffect(() => {
    const loadOfflineData = async () => {
      if (
        !allowOfflineAccess ||
        !hasLocalData ||
        serverItem ||
        isLoadingServer
      ) {
        return;
      }

      // Se há erro do servidor e temos dados locais, tentar buscar offline
      if (serverError && hasLocalData) {
        console.log(
          `🔄 Erro do servidor detectado, tentando buscar item ${itemId} no IndexedDB...`
        );

        setIsLoadingOffline(true);
        setIsOfflineMode(true);

        try {
          // Primeiro, tentar buscar por ID
          let localItem = await findItemInIndexedDB(itemId, "id", commissionId);

          // Se não encontrar por ID, tentar por número
          if (!localItem) {
            localItem = await findItemInIndexedDB(
              itemId,
              "number",
              commissionId
            );
          }

          if (localItem && commissionId && campusId) {
            const convertedItem = convertIndexedDBItemToInventoryItem(
              localItem,
              commissionId,
              campusId
            );

            setOfflineItem(convertedItem);
            console.log(
              `✅ Item encontrado no IndexedDB e convertido:`,
              convertedItem
            );
          } else {
            console.log(`❌ Item ${itemId} não encontrado no IndexedDB`);
            setOfflineItem(null);
          }
        } catch (error) {
          console.error("Erro ao buscar dados offline:", error);
          setOfflineItem(null);
        } finally {
          setIsLoadingOffline(false);
        }
      }
    };

    loadOfflineData();
  }, [
    itemId,
    commissionId,
    campusId,
    serverError,
    hasLocalData,
    serverItem,
    isLoadingServer,
    allowOfflineAccess,
  ]);

  // Reset offline mode when server data becomes available
  useEffect(() => {
    if (serverItem && !serverError) {
      setIsOfflineMode(false);
      setOfflineItem(null);
    }
  }, [serverItem, serverError]);

  const refetch = () => {
    setIsOfflineMode(false);
    setOfflineItem(null);
    refetchServer();
  };

  // Retornar dados do servidor se disponível, senão dados offline
  const finalItem = serverItem || offlineItem;
  const finalIsLoading = isLoadingServer || isLoadingOffline;
  const finalError =
    !finalItem && !finalIsLoading
      ? typeof serverError === "string"
        ? serverError
        : serverError?.message || "Item não encontrado"
      : null;

  return {
    item: finalItem,
    isLoading: finalIsLoading,
    error: finalError,
    isOfflineMode,
    hasLocalData,
    refetch,
  };
}
