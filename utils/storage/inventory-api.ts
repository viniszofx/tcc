import type { BemCopia, InventoryMetadata } from '@/types';
import { getProcessedData, storeProcessedData } from "./storage-manager";

export async function addInventoryItem(
  item: BemCopia,
  commissionId: string,
  campusId?: string
): Promise<void> {
  try {
    console.log("Dados recebidos para criação:", {
      item,
      commissionId,
      campusId,
    });

    // Validações básicas
    if (!commissionId) {
      throw new Error("ID da comissão é obrigatório");
    }

    if (!item.NUMERO) {
      throw new Error("Número do item é obrigatório");
    }

    if (!item.DESCRICAO) {
      throw new Error("Descrição do item é obrigatória");
    }

    // Validar se temos campusId válido
    if (!campusId || campusId === "default-campus-id") {
      throw new Error("ID do campus é obrigatório e deve ser válido");
    }

    // Mapear os dados do BemCopia para o formato da API
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

    console.log("Dados enviados para API:", apiData);

    // Fazer chamada à API
    const response = await fetch("/api/inventory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erro da API:", errorData);
      throw new Error(errorData.error || "Erro ao criar item");
    }

    const result = await response.json();
    console.log("Item criado com sucesso na API:", result);

    // Tentar salvar localmente para compatibilidade (não crítico)
    try {
      const { data, metadata } = await getProcessedData();
      const updatedData = [...data, item];
      const usedAcceleration = false;

      const updatedMetadata: InventoryMetadata = {
        recordCount: updatedData.length,
        timestamp: new Date().toISOString(),
        fileName: metadata?.fileName || "arquivo_desconhecido.json",
        usedAcceleration,
      };

      await storeProcessedData(updatedData, updatedMetadata);
      console.log("Item salvo localmente com sucesso");
    } catch (localError) {
      console.warn("Aviso: Não foi possível salvar localmente:", localError);
      // Não propagar este erro, pois a API funcionou
    }

    return Promise.resolve();
  } catch (error) {
    console.error("Error adding inventory item:", error);
    return Promise.reject(error);
  }
}
