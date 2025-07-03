import type { InventoryItemWithRelations } from "@/interface";
import type { BemCopia } from "@/lib/interface";
import { getProcessedData } from "@/utils/storage";

/**
 * Busca um item específico no IndexedDB pelo número ou ID
 */
export async function findItemInIndexedDB(
  searchValue: string,
  searchField: "number" | "id" = "number",
  commissionId?: string
): Promise<BemCopia | null> {
  try {
    const { data: localData, metadata } = await getProcessedData();

    if (!localData || localData.length === 0) {
      console.log("Nenhum dado local encontrado no IndexedDB");
      return null;
    }

    console.log(
      `🔍 Buscando item com ${searchField}: ${searchValue} no IndexedDB`
    );
    console.log(`📊 Total de itens no IndexedDB: ${localData.length}`);

    // Filtrar por comissão se especificada
    let filteredData = localData;
    if (commissionId && metadata?.commissionId) {
      if (metadata.commissionId !== commissionId) {
        console.log(
          `⚠️ Dados locais pertencem à comissão ${metadata.commissionId}, mas foi solicitada comissão ${commissionId}`
        );
        return null;
      }
    }

    // Buscar por número (mais comum)
    if (searchField === "number") {
      const item = filteredData.find(
        (item) => item.NUMERO === searchValue || item.bem_id === searchValue
      );

      if (item) {
        console.log(`✅ Item encontrado no IndexedDB:`, item);
        return item;
      }
    }

    // Buscar por ID
    if (searchField === "id") {
      const item = filteredData.find(
        (item) => item.bem_id === searchValue || item.id === searchValue
      );

      if (item) {
        console.log(`✅ Item encontrado no IndexedDB:`, item);
        return item;
      }
    }

    console.log(`❌ Item não encontrado no IndexedDB`);
    return null;
  } catch (error) {
    console.error("Erro ao buscar item no IndexedDB:", error);
    return null;
  }
}

/**
 * Converte um item do IndexedDB para o formato InventoryItemWithRelations
 */
export function convertIndexedDBItemToInventoryItem(
  item: BemCopia,
  commissionId: string,
  campusId: string
): InventoryItemWithRelations {
  return {
    id: item.bem_id || item.id || `local-${Date.now()}`,
    commissionId,
    campusId,
    number: item.NUMERO || "N/A",
    description: item.DESCRICAO || "N/A",
    brandModel: item.MARCA_MODELO || undefined,
    currentResponsibility: item.RESPONSABILIDADE_ATUAL || undefined,
    conservationState: item.ESTADO_DE_CONSERVACAO || "bom",
    location: item.SALA || undefined,
    tags: item.ROTULOS
      ? typeof item.ROTULOS === "string"
        ? item.ROTULOS.split(";")
            .map((tag: string) => tag.trim())
            .filter(Boolean)
        : Array.isArray(item.ROTULOS)
        ? item.ROTULOS
        : []
      : [],
    ed: item.ED || undefined,
    sector: item.SETOR_DO_RESPONSAVEL || undefined,
    updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
    // Adicionar relacionamentos vazios para compatibilidade
    commission: {
      id: commissionId,
      name: "Comissão (Offline)",
      type: "Desconhecido",
      campusId,
      active: true,
      year: new Date().getFullYear(),
      updatedAt: new Date(),
    } as any,
    campus: {
      id: campusId,
      name: "Campus (Offline)",
      code: "OFF",
      organizationId: "unknown",
      active: true,
      updatedAt: new Date(),
    } as any,
  };
}

/**
 * Busca múltiplos itens no IndexedDB com filtros
 */
export async function findItemsInIndexedDB(
  filters: {
    sector?: string;
    ed?: string;
    location?: string;
    responsability?: string;
  },
  commissionId?: string
): Promise<BemCopia[]> {
  try {
    const { data: localData, metadata } = await getProcessedData();

    if (!localData || localData.length === 0) {
      return [];
    }

    // Verificar se os dados locais pertencem à comissão correta
    if (commissionId && metadata?.commissionId) {
      if (metadata.commissionId !== commissionId) {
        console.log(
          `⚠️ Dados locais pertencem à comissão ${metadata.commissionId}, mas foi solicitada comissão ${commissionId}. Retornando lista vazia.`
        );
        return [];
      }
    }

    let filteredItems = localData;

    if (filters.sector) {
      filteredItems = filteredItems.filter((item) =>
        (item.SETOR_DO_RESPONSAVEL || "")
          .toLowerCase()
          .includes(filters.sector!.toLowerCase())
      );
    }

    if (filters.ed) {
      filteredItems = filteredItems.filter((item) =>
        (item.ED || "").toLowerCase().includes(filters.ed!.toLowerCase())
      );
    }

    if (filters.location) {
      filteredItems = filteredItems.filter((item) =>
        (item.SALA || "")
          .toLowerCase()
          .includes(filters.location!.toLowerCase())
      );
    }

    if (filters.responsability) {
      filteredItems = filteredItems.filter((item) =>
        (item.RESPONSABILIDADE_ATUAL || "")
          .toLowerCase()
          .includes(filters.responsability!.toLowerCase())
      );
    }

    return filteredItems;
  } catch (error) {
    console.error("Erro ao filtrar itens no IndexedDB:", error);
    return [];
  }
}

/**
 * Verifica se há dados disponíveis no IndexedDB
 */
export async function hasIndexedDBData(commissionId?: string): Promise<{
  hasData: boolean;
  itemCount: number;
  lastUpdate: Date | null;
  isCorrectCommission: boolean;
}> {
  try {
    const { data: localData, metadata } = await getProcessedData();

    let isCorrectCommission = true;
    let actualItemCount = localData?.length || 0;

    // Verificar se os dados pertencem à comissão correta
    if (commissionId && metadata?.commissionId) {
      isCorrectCommission = metadata.commissionId === commissionId;
      if (!isCorrectCommission) {
        console.log(
          `⚠️ Dados locais pertencem à comissão ${metadata.commissionId}, mas foi solicitada comissão ${commissionId}`
        );
        actualItemCount = 0; // Não conta itens se não for da comissão correta
      }
    }

    return {
      hasData: !!(localData && localData.length > 0 && isCorrectCommission),
      itemCount: actualItemCount,
      lastUpdate: metadata?.timestamp ? new Date(metadata.timestamp) : null,
      isCorrectCommission,
    };
  } catch (error) {
    console.error("Erro ao verificar dados do IndexedDB:", error);
    return {
      hasData: false,
      itemCount: 0,
      lastUpdate: null,
      isCorrectCommission: false,
    };
  }
}

/**
 * Limpa dados locais se eles não pertencem à comissão especificada
 */
export async function clearDataIfWrongCommission(
  commissionId: string
): Promise<boolean> {
  try {
    const { metadata } = await getProcessedData();

    if (metadata?.commissionId && metadata.commissionId !== commissionId) {
      console.log(
        `🧹 Limpando dados locais da comissão ${metadata.commissionId} (solicitada: ${commissionId})`
      );

      // Importar função de limpeza
      const { clearProcessedData } = await import("@/utils/storage");
      await clearProcessedData();

      return true; // Dados foram limpos
    }

    return false; // Dados não foram limpos
  } catch (error) {
    console.error("Erro ao verificar/limpar dados locais:", error);
    return false;
  }
}
