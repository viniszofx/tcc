import type { BemCopia } from '@/types';
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

// Função para validar e converter UUID
function ensureValidUUID(id: string, fallback?: string): string {
  // Regex para validar UUID
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (id && uuidRegex.test(id)) {
    return id;
  }

  if (fallback && uuidRegex.test(fallback)) {
    return fallback;
  }

  // Gerar novo UUID se inválido
  return randomUUID();
}

export async function saveInventoryItemsToDatabase(
  items: BemCopia[],
  commissionId: string,
  campusId: string,
  userId: string
) {
  try {
    console.log("Iniciando salvamento de", items.length, "itens no banco");

    // Validar UUIDs de entrada
    const validCommissionId = ensureValidUUID(commissionId);
    const validCampusId = ensureValidUUID(campusId);
    const validUserId = ensureValidUUID(userId);

    console.log("UUIDs validados:", {
      commissionId: validCommissionId,
      campusId: validCampusId,
      userId: validUserId,
    });

    // Mapear os dados para o formato do banco
    const inventoryItems = items.map((item, index) => {
      const mappedItem = {
        id: randomUUID(),
        commissionId: validCommissionId,
        campusId: validCampusId,
        number: String(item.NUMERO || `ITEM-${index + 1}`),
        description: String(item.DESCRICAO || "Sem descrição"),
        brandModel: item.MARCA_MODELO ? String(item.MARCA_MODELO) : null,
        currentResponsibility: item.RESPONSABILIDADE_ATUAL
          ? String(item.RESPONSABILIDADE_ATUAL)
          : null,
        conservationState: item.ESTADO_DE_CONSERVACAO
          ? String(item.ESTADO_DE_CONSERVACAO)
          : null,
        location: item.SALA ? String(item.SALA) : null,
        tags: item.ROTULOS
          ? String(item.ROTULOS)
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
        ed: item.ED ? String(item.ED) : null,
        sector: item.SETOR_DO_RESPONSAVEL
          ? String(item.SETOR_DO_RESPONSAVEL)
          : null,
      };

      if (index < 3) {
        // Log apenas os primeiros 3 itens para evitar spam
        console.log(
          `Item ${index + 1} mapeado:`,
          JSON.stringify(mappedItem, null, 2)
        );
      }

      return mappedItem;
    });

    // Salvar os itens no banco
    console.log("Salvando", inventoryItems.length, "itens no banco de dados");
    const savedItems = await prisma.inventoryItem.createMany({
      data: inventoryItems,
      skipDuplicates: true,
    });

    console.log("Itens salvos:", savedItems.count);

    // Criar histórico para cada item criado
    const historyRecords = inventoryItems.map((item) => ({
      id: randomUUID(),
      inventoryItemId: item.id,
      userId: validUserId,
      action: "create" as const,
      changes: JSON.stringify({
        created: {
          number: item.number,
          description: item.description,
          brandModel: item.brandModel,
          currentResponsibility: item.currentResponsibility,
          conservationState: item.conservationState,
          location: item.location,
          sector: item.sector,
        },
      }),
      observation: "Item criado através de importação de arquivo",
      imageUrl: [],
    }));

    console.log("Criando histórico para", historyRecords.length, "itens");
    await prisma.inventoryHistory.createMany({
      data: historyRecords,
    });

    console.log("Histórico criado com sucesso");

    return {
      success: true,
      itemsCreated: savedItems.count,
      message: `${savedItems.count} itens salvos com sucesso no banco de dados`,
    };
  } catch (error) {
    console.error("Erro detalhado ao salvar itens no banco:", error);
    if (error instanceof Error) {
      console.error("Stack trace:", error.stack);
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
      message: "Falha ao salvar itens no banco de dados",
    };
  }
}
