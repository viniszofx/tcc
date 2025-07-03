import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Função de autenticação reutilizável
async function authenticateUser() {
  const supabase = await createServerSupabaseClient();

  // Obter o usuário atual autenticado via Supabase
  const {
    data: { user: realUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !realUser) {
    throw new Error("Não autorizado");
  }

  // Verificar se o usuário existe no banco de dados UserProfile
  const userProfile = await prisma.userProfile.findUnique({
    where: { id: realUser.id },
  });

  // Se não existir no UserProfile, não permitir a operação
  if (!userProfile) {
    console.error(
      "❌ Usuário autenticado não encontrado no UserProfile:",
      realUser.id
    );
    throw new Error(
      "Usuário autenticado não encontrado no sistema. Por favor, verifique se seu usuário foi configurado corretamente."
    );
  }

  return realUser;
}

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
  return "bom"; // estado padrão
};

export async function GET(request: Request) {
  try {
    const user = await authenticateUser();

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
    const user = await authenticateUser();
    const data = await request.json();
    const { commissionId, item, items } = data;

    if (!commissionId) {
      return NextResponse.json(
        { error: "Dados inválidos: commissionId é obrigatório" },
        { status: 400 }
      );
    }

    const commission = await prisma.commission.findUnique({
      where: { id: commissionId },
      include: { members: true },
    });

    if (!commission) {
      return NextResponse.json(
        { error: "Comissão não encontrada" },
        { status: 404 }
      );
    }

    // Criação de item individual
    if (item) {
      console.log(
        "📦 Dados recebidos para criação de item:",
        JSON.stringify(item, null, 2)
      );

      // Verificar se todos os campos obrigatórios estão presentes
      if (!item.number) {
        return NextResponse.json(
          { error: "O número do item é obrigatório" },
          { status: 400 }
        );
      }

      if (!item.description) {
        return NextResponse.json(
          { error: "A descrição do item é obrigatória" },
          { status: 400 }
        );
      }

      if (!item.campusId) {
        return NextResponse.json(
          { error: "O ID do campus é obrigatório" },
          { status: 400 }
        );
      }

      // Verificação de número único
      const existingItem = await prisma.inventoryItem.findFirst({
        where: { number: item.number },
      });

      if (existingItem) {
        console.log(`❌ Erro: Item com número '${item.number}' já existe`);
        return NextResponse.json(
          { error: `Já existe um item com o número '${item.number}'` },
          { status: 400 }
        );
      }

      try {
        const newItem = await prisma.inventoryItem.create({
          data: {
            ...item,
            commissionId,
            conservationState: normalizeConservationState(
              item.conservationState
            ),
          },
        });

        // Registrar no histórico com tratamento de erro específico
        try {
          // Usar o usuário autenticado para criar o histórico
          await prisma.inventoryHistory.create({
            data: {
              inventoryItemId: newItem.id,
              userId: user.id, // Usando o usuário autenticado
              action: "create",
              changes: JSON.stringify({
                before: null,
                after: newItem,
              }),
              observation: "Novo item criado manualmente",
              imageUrl: [],
            },
          });
          console.log(
            "✅ Histórico criado com sucesso para o item:",
            newItem.id
          );
        } catch (historyError) {
          console.error(
            "⚠️ Erro ao criar histórico, mas o item foi criado:",
            historyError
          );
          // Não falhar a operação se apenas o histórico não puder ser criado
        }

        return NextResponse.json(newItem);
      } catch (error) {
        console.error("❌ Erro ao criar item de inventário:", error);
        return NextResponse.json(
          { error: `Erro ao criar item: ${(error as Error).message}` },
          { status: 500 }
        );
      }
    }

    // Criação em lote
    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        {
          error:
            "Dados inválidos: é necessário fornecer um item individual ou uma lista de itens",
        },
        { status: 400 }
      );
    }

    // Verificar números duplicados na lista
    const numbers = items.map((item) => item.number);
    const uniqueNumbers = new Set(numbers);
    if (numbers.length !== uniqueNumbers.size) {
      return NextResponse.json(
        { error: "Existem números duplicados na lista de itens" },
        { status: 400 }
      );
    }

    // Verificar se algum número já existe no banco
    const existingItems = await prisma.inventoryItem.findMany({
      where: { number: { in: numbers } },
      select: { number: true },
    });

    if (existingItems.length > 0) {
      const existingNumbers = existingItems
        .map((item) => item.number)
        .join(", ");
      return NextResponse.json(
        { error: `Já existem itens com os números: ${existingNumbers}` },
        { status: 400 }
      );
    }

    // Cria todos os itens
    const createdItems = await prisma.inventoryItem.createMany({
      data: items.map((item) => ({
        ...item,
        commissionId,
        conservationState: normalizeConservationState(item.conservationState),
      })),
    });

    // Buscar os itens criados para adicionar ao histórico
    const createdItemList = await prisma.inventoryItem.findMany({
      where: {
        number: { in: numbers },
        commissionId: commissionId,
      },
    });

    // Registrar cada item no histórico
    for (const createdItem of createdItemList) {
      try {
        await prisma.inventoryHistory.create({
          data: {
            inventoryItemId: createdItem.id,
            userId: user.id, // Usar o usuário autenticado
            action: "create",
            changes: JSON.stringify({
              before: null,
              after: createdItem,
            }),
            observation: "Item criado em importação em lote",
            imageUrl: [],
          },
        });
      } catch (historyError) {
        console.error(
          `⚠️ Erro ao criar histórico para o item ${createdItem.id}:`,
          historyError
        );
        // Continuar mesmo com erro no histórico
      }
    }

    // Registrar no log
    console.log(
      `✅ Importação concluída: ${items.length} itens processados, ${createdItemList.length} históricos criados`
    );

    return NextResponse.json(createdItems);
  } catch (error: any) {
    console.error("Erro ao criar item(s) de inventário:", error);
    return NextResponse.json(
      { error: "Erro ao criar item(s) de inventário" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await authenticateUser();

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
    const user = await authenticateUser();

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

    // Criar registro no histórico antes de deletar
    try {
      await prisma.inventoryHistory.create({
        data: {
          inventoryItemId: id,
          userId: user.id,
          action: "delete",
          changes: JSON.stringify({
            before: itemToDelete,
            after: null,
          }),
          observation: "Item removido do inventário",
          imageUrl: [],
        },
      });
    } catch (historyError) {
      console.error("Erro ao criar histórico de exclusão:", historyError);
      // Continuar mesmo com erro no histórico
    }

    return NextResponse.json({ message: "Item removido com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar item:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
