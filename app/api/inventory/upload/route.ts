import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadCommissionSpreadsheet } from "@/lib/supabase-spreadsheets";

import { authenticateUser } from "@/lib/auth/server";

// Função utilitária para normalizar o estado de conservação
const normalizeConservationState = (state?: string) => {
  if (!state) return "bom";
  const normalized = state?.toLowerCase()?.trim() || "bom";
  if (normalized.includes("bom") || normalized.includes("novo")) return "bom";
  if (normalized.includes("regular") || normalized.includes("médio"))
    return "regular";
  if (normalized.includes("ruim") || normalized.includes("péssimo"))
    return "ruim";
  if (normalized.includes("inservível") || normalized.includes("irreversível"))
    return "inservível";
  return "bom";
};

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateUser();
    
    // Parse do FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const commissionId = formData.get('commissionId') as string;
    const description = formData.get('description') as string;
    const processedDataStr = formData.get('processedData') as string;
    const metadataStr = formData.get('metadata') as string;

    if (!file || !commissionId || !processedDataStr) {
      return NextResponse.json(
        { error: "Dados obrigatórios não fornecidos" },
        { status: 400 }
      );
    }

    // Parse dos dados processados
    let processedData;
    let metadata;
    try {
      processedData = JSON.parse(processedDataStr);
      metadata = metadataStr ? JSON.parse(metadataStr) : {};
    } catch (parseError) {
      return NextResponse.json(
        { error: "Dados JSON inválidos" },
        { status: 400 }
      );
    }

    // Verificar se a comissão existe
    const commission = await prisma.commission.findUnique({
      where: { id: commissionId },
      include: {
        members: true,
        campus: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!commission) {
      return NextResponse.json(
        { error: "Comissão não encontrada" },
        { status: 404 }
      );
    }

    let fileUrl = null;

    // PRIORIDADE: Fazer upload da planilha e salvar URL na comissão PRIMEIRO
    try {
      console.log(`📁 PRIORIDADE: Iniciando upload da planilha: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
      
      const uploadResult = await uploadCommissionSpreadsheet(file, commissionId);
      
      if (uploadResult.success && uploadResult.url) {
        fileUrl = uploadResult.url;
        console.log(`✅ Planilha enviada com sucesso: ${fileUrl}`);
        
        // Salvar URL da planilha na comissão IMEDIATAMENTE
        await prisma.commission.update({
          where: { id: commissionId },
          data: {
            spreadsheetUrl: fileUrl,
            updatedAt: new Date(),
          },
        });
        console.log(`📊 URL da planilha salva na comissão: ${fileUrl}`);
      } else {
        console.warn("⚠️ Erro no upload da planilha:", uploadResult.error);
        // Continuar mesmo se o upload falhar - os dados processados ainda serão salvos
      }
    } catch (uploadError) {
      console.warn("⚠️ Falha no upload da planilha para Supabase:", uploadError);
      // Continuar sem o backup do arquivo - os dados processados ainda serão salvos
    }

    // Validar e mapear os dados para o formato correto
    const itemsToCreate: Array<{
      number: string;
      description: string;
      brandModel?: string;
      currentResponsibility?: string;
      conservationState?: string;
      location?: string;
      tags: string[];
      ed?: string;
      sector?: string;
      commissionId: string;
      campusId: string;
    }> = [];
    const validationErrors: string[] = [];
    
    for (let i = 0; i < processedData.length; i++) {
      const item = processedData[i];
      
      // Validar campos obrigatórios
      const number = item.NUMERO || item.number;
      const description = item.DESCRICAO || item.description;
      
      if (!number || typeof number !== 'string' || number.trim() === '') {
        validationErrors.push(`Linha ${i + 1}: Número do item é obrigatório`);
        continue;
      }
      
      if (!description || typeof description !== 'string' || description.trim() === '') {
        validationErrors.push(`Linha ${i + 1}: Descrição do item é obrigatória`);
        continue;
      }
      
      // Determinar o campusId
      let itemCampusId = item.campusId || item.campus_id;
      if (!itemCampusId) {
        itemCampusId = commission.campusId;
      }

      // Garantir que tags seja sempre um array de strings
      let tags: string[] = [];
      if (Array.isArray(item.ROTULOS)) {
        tags = item.ROTULOS.filter((t: string) => typeof t === 'string' && t.trim() !== '');
      } else if (
        typeof item.ROTULOS === "string" &&
        item.ROTULOS.trim() !== ""
      ) {
        tags = item.ROTULOS.split(",")
          .map((t: string) => t.trim())
          .filter(Boolean);
      } else if (Array.isArray(item.tags)) {
        tags = item.tags.filter((t: string) => typeof t === 'string' && t.trim() !== '');
      } else if (typeof item.tags === "string" && item.tags.trim() !== "") {
        tags = item.tags
          .split(",")
          .map((t: string) => t.trim())
          .filter(Boolean);
      }

      itemsToCreate.push({
        number: number.trim(),
        description: description.trim(),
        brandModel: (item.MARCA_MODELO || item.brandModel || "").toString().trim(),
        currentResponsibility:
          (item.RESPONSABILIDADE_ATUAL || item.currentResponsibility || "").toString().trim(),
        conservationState: normalizeConservationState(
          item.ESTADO_DE_CONSERVACAO ||
            item.conservationState
        ),
        location: (item.SALA || item.location || "").toString().trim(),
        tags,
        ed: (item.ED || item.ed || "").toString().trim(),
        sector: (item.SETOR_DO_RESPONSAVEL || item.sector || "").toString().trim(),
        commissionId,
        campusId: itemCampusId,
      });
    }
    
    // Se houver erros de validação, retornar erro
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: "Erros de validação encontrados",
          details: validationErrors
        },
        { status: 400 }
      );
    }
    
    // Se não há itens válidos para criar
    if (itemsToCreate.length === 0) {
      return NextResponse.json(
        { error: "Nenhum item válido encontrado para importar" },
        { status: 400 }
      );
    }

    // Criar todos os itens no banco usando operação em lote para melhor performance
    console.log(`📦 Criando ${itemsToCreate.length} itens em lote...`);
    
    const createdItemList = await prisma.$transaction(async (tx) => {
      // Criar todos os itens de uma vez usando createMany
      await tx.inventoryItem.createMany({
        data: itemsToCreate,
        skipDuplicates: false, // Falhar se houver duplicatas
      });
      
      // Buscar os itens criados para obter os IDs
      const createdItems = await tx.inventoryItem.findMany({
        where: {
          commissionId: commissionId,
          number: {
            in: itemsToCreate.map(item => item.number)
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: itemsToCreate.length
      });
      
      // Criar histórico para todos os itens criados
      const historyData = createdItems.map(item => ({
        inventoryItemId: item.id,
        userId: user.id,
        action: "create" as const,
        changes: JSON.stringify({
          before: null,
          after: item,
        }),
        observation: `Item criado via upload de arquivo: ${file.name}`,
        imageUrl: [],
      }));
      
      await tx.inventoryHistory.createMany({
        data: historyData,
      });
      
      console.log(`✅ ${createdItems.length} itens e históricos criados com sucesso`);
      return createdItems;
    }, {
      timeout: 30000, // 30 segundos de timeout
    });

    // URL da planilha já foi salva na comissão no início do processo
    console.log(`📊 Processamento concluído. URL da planilha: ${fileUrl || 'não disponível'}`);

    console.log(
      `✅ Upload processado: ${createdItemList.length} itens criados, ${createdItemList.length} históricos criados`
    );

    return NextResponse.json({
      success: true,
      itemsCreated: createdItemList.length,
      fileUrl,
      message: `${createdItemList.length} itens foram importados com sucesso.`,
    });
  } catch (error: any) {
    console.error("❌ Erro no upload:", error);
    return NextResponse.json(
      { 
        error: "Erro ao processar upload",
        details: error?.message || "Erro desconhecido"
      },
      { status: 500 }
    );
  }
}