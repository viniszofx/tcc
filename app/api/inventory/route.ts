import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Verificar autenticação - desenvolvimento vs produção
    const supabase = await createServerSupabaseClient();
    let user;

    if (process.env.NODE_ENV === "development") {
      // Em desenvolvimento, usar um usuário fake com UUID válido
      user = {
        id: "88ae80f0-4c14-44ea-b98a-235cf37bf170",
        email: "dev@example.com",
      };
    } else {
      // Em produção, autenticação real
      const {
        data: { user: realUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !realUser) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }
      user = realUser;
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const commissionId = searchParams.get("commissionId");
    const campusId = searchParams.get("campusId");
    const sector = searchParams.get("sector");
    const ed = searchParams.get("ed");

    if (id) {
      const item = await prisma.inventoryItem.findUnique({
        where: { id },
        include: {
          commission: true,
          campus: true,
        },
      });

      if (!item) {
        return NextResponse.json(
          { error: "Item de inventário não encontrado" },
          { status: 404 }
        );
      }
      return NextResponse.json(item);
    }

    // Buscar itens com filtros
    const where: any = {};

    if (commissionId) {
      where.commissionId = commissionId;
    }

    if (campusId) {
      where.campusId = campusId;
    }

    if (sector) {
      where.sector = sector;
    }

    if (ed) {
      where.ed = ed;
    }

    const items = await prisma.inventoryItem.findMany({
      where,
      include: {
        commission: true,
        campus: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Erro na API de inventário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Verificar autenticação - desenvolvimento vs produção
    const supabase = await createServerSupabaseClient();
    let user;

    if (process.env.NODE_ENV === "development") {
      // Em desenvolvimento, usar um usuário fake com UUID válido
      user = {
        id: "88ae80f0-4c14-44ea-b98a-235cf37bf170",
        email: "dev@example.com",
      };
    } else {
      // Em produção, autenticação real
      const {
        data: { user: realUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !realUser) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }
      user = realUser;
    }

    const body = await request.json();
    const { commissionId, items, metadata } = body;

    if (!commissionId || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Dados inválidos: commissionId e items são obrigatórios" },
        { status: 400 }
      );
    }

    console.log(`📝 Recebendo ${items.length} itens para processamento`);

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

    // Processar itens em lotes para melhor performance
    const batchSize = 100;
    const results = [];
    let processedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);

      try {
        // Preparar dados para inserção em lote
        const itemsToCreate = batch.map((item: any) => ({
          commissionId: commissionId,
          campusId: commission.campusId,
          number:
            item.numeroPatrimonio ||
            `ITEM-${Date.now()}-${Math.random().toString(36).substring(2)}`,
          description: item.item || item.especificacao || "Item importado",
          brandModel: item.especificacao || null,
          currentResponsibility: item.observacoes?.split(" - ")[1] || null,
          conservationState: item.estado || "bom",
          location: item.subsecao || null,
          tags: [],
          ed: item.ed || null,
          sector: item.setor || null,
        }));

        // Inserir lote no banco
        await prisma.inventoryItem.createMany({
          data: itemsToCreate,
          skipDuplicates: true, // Evitar duplicatas
        });

        processedCount += batch.length;
        console.log(
          `✅ Lote ${Math.floor(i / batchSize) + 1} processado: ${
            batch.length
          } itens`
        );
      } catch (batchError) {
        console.error(
          `❌ Erro no lote ${Math.floor(i / batchSize) + 1}:`,
          batchError
        );
        errorCount += batch.length;
      }
    }

    // Criar registro de histórico de upload como observação nos itens criados
    if (metadata && processedCount > 0) {
      try {
        // Como não temos um modelo específico para histórico de upload,
        // vamos log apenas no console por enquanto
        console.log("📋 Histórico de upload:", {
          fileName: metadata.fileName,
          fileSize: metadata.fileSize,
          fileUrl: metadata.fileUrl,
          recordCount: metadata.recordCount,
          uploadedBy: metadata.uploadedBy,
          timestamp: metadata.timestamp,
          processedCount,
          errorCount,
          commissionId,
        });
      } catch (historyError) {
        console.error("⚠️ Erro ao registrar histórico:", historyError);
        // Não falhar o upload por causa do histórico
      }
    }

    console.log(
      `🎉 Upload concluído: ${processedCount} processados, ${errorCount} erros`
    );

    return NextResponse.json({
      message: "Dados processados com sucesso",
      summary: {
        totalItems: items.length,
        processedCount,
        errorCount,
        commissionId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Erro ao processar dados de inventário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    // Verificar autenticação - desenvolvimento vs produção
    const supabase = await createServerSupabaseClient();
    let user;

    if (process.env.NODE_ENV === "development") {
      user = {
        id: "88ae80f0-4c14-44ea-b98a-235cf37bf170",
        email: "dev@example.com",
      };
    } else {
      const {
        data: { user: realUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !realUser) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }
      user = realUser;
    }

    const body = await request.json();
    const {
      id,
      commissionId,
      campusId,
      number,
      description,
      brandModel,
      currentResponsibility,
      conservationState,
      location,
      tags,
      ed,
      sector,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    // Buscar item atual para comparar mudanças
    const currentItem = await prisma.inventoryItem.findUnique({
      where: { id },
    });

    if (!currentItem) {
      return NextResponse.json(
        { error: "Item de inventário não encontrado" },
        { status: 404 }
      );
    }

    const updatedItem = await prisma.inventoryItem.update({
      where: { id },
      data: {
        ...(commissionId && { commissionId }),
        ...(campusId && { campusId }),
        ...(number && { number }),
        ...(description && { description }),
        ...(brandModel !== undefined && { brandModel }),
        ...(currentResponsibility !== undefined && { currentResponsibility }),
        ...(conservationState !== undefined && { conservationState }),
        ...(location !== undefined && { location }),
        ...(tags !== undefined && { tags }),
        ...(ed !== undefined && { ed }),
        ...(sector !== undefined && { sector }),
      },
      include: {
        commission: true,
        campus: true,
      },
    });

    // Criar registro no histórico do item
    await prisma.inventoryHistory.create({
      data: {
        inventoryItemId: id,
        userId: user.id,
        action: "update",
        changes: JSON.stringify({
          before: currentItem,
          after: updatedItem,
        }),
        observation: "Item atualizado",
        imageUrl: [],
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Erro ao atualizar item:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    // Verificar autenticação - desenvolvimento vs produção
    const supabase = await createServerSupabaseClient();
    let user;

    if (process.env.NODE_ENV === "development") {
      user = {
        id: "88ae80f0-4c14-44ea-b98a-235cf37bf170",
        email: "dev@example.com",
      };
    } else {
      const {
        data: { user: realUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !realUser) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }
      user = realUser;
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    // Buscar item antes de deletar para o histórico
    const itemToDelete = await prisma.inventoryItem.findUnique({
      where: { id },
    });

    if (!itemToDelete) {
      return NextResponse.json(
        { error: "Item de inventário não encontrado" },
        { status: 404 }
      );
    }

    // Deletar o item (o histórico relacionado será deletado automaticamente por CASCADE)
    await prisma.inventoryItem.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Item removido com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar item:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
