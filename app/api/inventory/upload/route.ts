import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdmin } from "@/lib/supabase";

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

    // Tentar fazer upload do arquivo usando service role (mais seguro)
    try {
      const supabaseAdmin = createSupabaseAdmin();
      
      if (supabaseAdmin) {
        // Gerar nome único para o arquivo
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const fileExtension = file.name.split(".").pop();
        const fileName = `${timestamp}-${Math.random()
          .toString(36)
          .substring(2)}.${fileExtension}`;
        
        const filePath = `commissions/${commissionId}/${fileName}`;
        
        // Converter File para ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Upload usando service role (bypassa RLS)
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from('spreadsheets')
          .upload(filePath, uint8Array, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false
          });
        
        if (uploadError) {
          console.warn("⚠️ Erro no upload do arquivo:", uploadError);
        } else {
          // Obter URL pública
          const { data: urlData } = supabaseAdmin.storage
            .from('spreadsheets')
            .getPublicUrl(filePath);
          
          if (urlData?.publicUrl) {
            fileUrl = urlData.publicUrl;
            console.log("✅ Arquivo salvo no Supabase:", fileUrl);
          }
        }
      }
    } catch (uploadError) {
      console.warn("⚠️ Falha no upload para Supabase:", uploadError);
      // Continuar sem o backup do arquivo - os dados processados ainda serão salvos
    }

    // Validar e mapear os dados para o formato correto
    const itemsToCreate = [];
    const validationErrors = [];
    
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

    // Criar todos os itens no banco
    const createdItems = await prisma.inventoryItem.createMany({
      data: itemsToCreate,
    });

    // Buscar os itens criados para adicionar ao histórico
    const createdItemList = await prisma.inventoryItem.findMany({
      where: {
        commissionId: commissionId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: processedData.length,
    });

    // Registrar cada item no histórico
    for (const createdItem of createdItemList) {
      try {
        await prisma.inventoryHistory.create({
          data: {
            inventoryItemId: createdItem.id,
            userId: user.id,
            action: "create",
            changes: JSON.stringify({
              before: null,
              after: createdItem,
            }),
            observation: `Item criado via upload de arquivo: ${file.name}`,
            imageUrl: [],
          },
        });
      } catch (historyError) {
        console.error(
          `⚠️ Erro ao criar histórico para o item ${createdItem.id}:`,
          historyError
        );
      }
    }

    // Atualizar URL da planilha na comissão (se o upload foi bem-sucedido)
    if (fileUrl) {
      try {
        await prisma.commission.update({
          where: { id: commissionId },
          data: {
            spreadsheetUrl: fileUrl,
          },
        });
        console.log("📊 URL da planilha atualizada na comissão");
      } catch (updateError) {
        console.warn(
          "⚠️ Erro ao atualizar URL da planilha na comissão:",
          updateError
        );
      }
    }

    console.log(
      `✅ Upload processado: ${processedData.length} itens criados, ${createdItemList.length} históricos criados`
    );

    return NextResponse.json({
      success: true,
      itemsCreated: createdItems.count,
      fileUrl,
      message: `${processedData.length} itens foram importados com sucesso.`,
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