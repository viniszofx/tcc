import { prisma } from "@/lib/prisma";
import { createSupabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      // Novo fluxo: dados já processados no frontend
      const body = await request.json();
      const {
        commissionId,
        description,
        fileName,
        fileSize,
        processedData,
        metadata,
      } = body;

      if (!commissionId || !processedData || !Array.isArray(processedData)) {
        return NextResponse.json(
          {
            error:
              "Dados inválidos: commissionId e processedData são obrigatórios",
          },
          { status: 400 }
        );
      }

      console.log(
        `📊 Recebidos ${processedData.length} itens para processamento`
      );

      // Verificar se a comissão existe
      const commission = await prisma.commission.findUnique({
        where: { id: commissionId },
        include: { campus: true },
      });

      if (!commission) {
        return NextResponse.json(
          { error: "Comissão não encontrada" },
          { status: 404 }
        );
      }

      // Usar transação para salvar todos os dados de uma vez
      const result = await prisma.$transaction(async (tx) => {
        // 1. Limpar dados existentes da comissão (se houver)
        const deletedCount = await tx.inventoryItem.deleteMany({
          where: { commissionId },
        });

        console.log(`🗑️ Removidos ${deletedCount.count} itens existentes`);

        // 2. Criar novos itens de inventário
        const inventoryItems = await Promise.all(
          processedData.map(async (item: any, index: number) => {
            return await tx.inventoryItem.create({
              data: {
                commissionId,
                campusId: commission.campusId,
                number: item.NUMERO || `ITEM-${index + 1}`,
                description: item.DESCRICAO || `Item ${index + 1}`,
                brandModel: item.MARCA_MODELO || null,
                currentResponsibility: item.RESPONSABILIDADE_ATUAL || null,
                conservationState: item.ESTADO_DE_CONSERVACAO || "BOM",
                location: item.SALA || null,
                tags: item.ROTULOS
                  ? item.ROTULOS.split(";")
                      .map((tag: string) => tag.trim())
                      .filter(Boolean)
                  : [],
                ed: item.ED || null,
                sector: item.SETOR_DO_RESPONSAVEL || null,
              },
            });
          })
        );

        console.log(`✅ Criados ${inventoryItems.length} novos itens`);

        // 3. Atualizar metadados da comissão
        const updatedCommission = await tx.commission.update({
          where: { id: commissionId },
          data: {
            description: description || commission.description,
            updatedAt: new Date(),
          },
        });

        return { inventoryItems, commission: updatedCommission };
      });

      return NextResponse.json({
        success: true,
        message: "Dados processados e salvos com sucesso no banco",
        itemsCreated: result.inventoryItems.length,
        commission: result.commission,
        metadata: {
          processedAt: new Date().toISOString(),
          fileName: fileName || "unknown",
          recordCount: result.inventoryItems.length,
        },
      });
    } else {
      // Fluxo de backup: upload de arquivo para Supabase Storage
      const formData = await request.formData();
      const file = formData.get("file") as File;
      const commissionId = formData.get("commissionId") as string;
      const description = formData.get("description") as string;

      if (!file) {
        return NextResponse.json(
          { error: "Arquivo é obrigatório" },
          { status: 400 }
        );
      }

      if (!commissionId) {
        return NextResponse.json(
          { error: "ID da comissão é obrigatório" },
          { status: 400 }
        );
      }

      console.log(
        `📁 Iniciando backup do arquivo: ${file.name} (${file.size} bytes)`
      );

      // Verificar se a comissão existe
      const commission = await prisma.commission.findUnique({
        where: { id: commissionId },
        include: { campus: true },
      });

      if (!commission) {
        return NextResponse.json(
          { error: "Comissão não encontrada" },
          { status: 404 }
        );
      }

      // Configurar Supabase Admin
      const supabaseAdmin = createSupabaseAdmin();
      if (!supabaseAdmin) {
        return NextResponse.json(
          { error: "Configuração do Supabase não disponível" },
          { status: 500 }
        );
      }

      // Gerar nome único para o arquivo
      const fileExtension = file.name.split(".").pop();
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `${commission.name}-${timestamp}.${fileExtension}`;
      const filePath = `commissions/${commissionId}/${fileName}`;

      // Converter arquivo para ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      // Upload para o Supabase Storage
      console.log(`☁️ Fazendo upload para: ${filePath}`);

      const { data: uploadData, error: uploadError } =
        await supabaseAdmin.storage
          .from("spreadsheets")
          .upload(filePath, buffer, {
            contentType: file.type,
            upsert: false,
          });

      if (uploadError) {
        console.error("❌ Erro no upload:", uploadError);
        return NextResponse.json(
          { error: `Erro ao fazer upload do arquivo: ${uploadError.message}` },
          { status: 500 }
        );
      }

      // Obter URL pública do arquivo
      const { data: urlData } = supabaseAdmin.storage
        .from("spreadsheets")
        .getPublicUrl(filePath);

      if (!urlData.publicUrl) {
        return NextResponse.json(
          { error: "Erro ao obter URL do arquivo" },
          { status: 500 }
        );
      }

      // Atualizar a comissão com a URL da planilha
      const updatedCommission = await prisma.commission.update({
        where: { id: commissionId },
        data: {
          spreadsheetUrl: urlData.publicUrl,
          updatedAt: new Date(),
        },
        include: {
          campus: true,
          members: {
            include: {
              user: true,
            },
          },
        },
      });

      console.log(`✅ Backup concluído: ${urlData.publicUrl}`);

      return NextResponse.json({
        success: true,
        message: "Backup do arquivo realizado com sucesso",
        commission: updatedCommission,
        fileUrl: urlData.publicUrl,
        filePath: uploadData.path,
        metadata: {
          backupAt: new Date().toISOString(),
          fileName: file.name,
          fileSize: file.size,
        },
      });
    }
  } catch (error) {
    console.error("❌ Erro interno:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
