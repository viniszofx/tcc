import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { withDatabaseTimeout, OPTIMIZED_QUERY_CONFIG } from "@/lib/database-utils";
import { OperationTimer } from "@/lib/performance-monitor";

// Função de autenticação reutilizável
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
  return "bom"; // estado padrão
};

export async function GET(request: Request) {
  const requestTimer = new OperationTimer('GET /api/inventory');
  
  try {
    const authTimer = new OperationTimer('Authentication');
    const user = await authenticateUser();
    authTimer.finish(`User: ${user.email}`);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const commissionId = searchParams.get("commissionId");
    const campusId = searchParams.get("campusId");
    const sector = searchParams.get("sector");
    const ed = searchParams.get("ed");
    
    // Parâmetros de paginação
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 10000); // Máximo 10000 itens
    const skip = (page - 1) * limit;

    console.log(commissionId);

    if (id) {
      const item = await withDatabaseTimeout(
        () => prisma.inventoryItem.findUnique({
          where: { id },
          include: {
            commission: true,
            campus: true,
          },
        }),
        OPTIMIZED_QUERY_CONFIG.SIMPLE_QUERY_TIMEOUT
      );

      if (!item) {
        return NextResponse.json(
          { error: "Item de inventário não encontrado" },
          { status: 404 }
        );
      }

      // Verificar se o usuário tem permissão para ver este item
      // Buscar informações da comissão e verificar permissões
      const commission = await withDatabaseTimeout(
        () => prisma.commission.findUnique({
          where: { id: item.commissionId },
          include: {
            members: true,
            campus: {
              include: {
                organization: true,
              },
            },
          },
        }),
        OPTIMIZED_QUERY_CONFIG.COMPLEX_QUERY_TIMEOUT
      );

      if (!commission) {
        return NextResponse.json(
          { error: "Comissão não encontrada" },
          { status: 404 }
        );
      }

      // Remover verificação de permissão - todos podem acessar

      return NextResponse.json(item);
    }

    // Buscar itens com filtros
    const where: any = {};

    if (commissionId) {
      where.commissionId = commissionId;

      // Verificar se o usuário tem acesso à comissão especificada
      const commission = await withDatabaseTimeout(
        () => prisma.commission.findUnique({
          where: { id: commissionId },
          include: {
            members: true,
            campus: {
              include: {
                organization: true,
              },
            },
          },
        }),
        OPTIMIZED_QUERY_CONFIG.COMPLEX_QUERY_TIMEOUT
      );

      if (!commission) {
        return NextResponse.json(
          { error: "Comissão não encontrada" },
          { status: 404 }
        );
      }

      // Remover verificação de permissão - todos podem acessar
    } else {
      // Remover verificação de permissão para listagem geral - todos podem ver todos os itens
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

    // Buscar itens com paginação e contagem total em paralelo
    const [items, totalCount] = await Promise.all([
      withDatabaseTimeout(
        () => prisma.inventoryItem.findMany({
          where,
          include: {
            commission: true,
            campus: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          skip,
          take: limit,
        }),
        OPTIMIZED_QUERY_CONFIG.COMPLEX_QUERY_TIMEOUT
      ),
      withDatabaseTimeout(
        () => prisma.inventoryItem.count({ where }),
        OPTIMIZED_QUERY_CONFIG.SIMPLE_QUERY_TIMEOUT
      )
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    const response = NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
    
    requestTimer.finish(`Returned ${items.length} items (page ${page}/${totalPages})`);
    return response;
  } catch (error) {
    requestTimer.finish(`ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

    // Remover verificação de permissão - todos podem criar itens

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

      // Verificar se já existe um item com o mesmo número na comissão
      let finalNumber = item.number;
      const existingItem = await prisma.inventoryItem.findFirst({
        where: {
          number: finalNumber,
          commissionId: commissionId,
        },
      });

      // Se já existe, gerar um número único
      if (existingItem) {
        let counter = 1;
        let newNumber = `${finalNumber}-${counter}`;
        
        while (await prisma.inventoryItem.findFirst({
          where: {
            number: newNumber,
            commissionId: commissionId,
          },
        })) {
          counter++;
          newNumber = `${finalNumber}-${counter}`;
        }
        
        finalNumber = newNumber;
        console.log(`⚠️ Número ${item.number} já existe na comissão. Usando ${finalNumber} em vez disso.`);
      }

      try {
        const newItem = await prisma.inventoryItem.create({
          data: {
            ...item,
            number: finalNumber,
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

    // Verificar se todos os itens têm os campos obrigatórios
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.NUMERO && !item.number) {
        return NextResponse.json(
          { error: `Item ${i + 1}: número é obrigatório` },
          { status: 400 }
        );
      }
      if (!item.DESCRICAO && !item.description) {
        return NextResponse.json(
          { error: `Item ${i + 1}: descrição é obrigatória` },
          { status: 400 }
        );
      }
    }

    // Remover verificação de números duplicados - números podem ser duplicados

    // Mapear os dados para o formato correto e garantir que campusId esteja presente
    const itemsToCreate = items.map((item) => {
      // Determinar o campusId - usar o da comissão se não estiver presente no item
      let itemCampusId = item.campusId;
      if (!itemCampusId) {
        // Se não tem campusId no item, usar o da comissão
        itemCampusId = commission.campusId;
      }

      // Garantir que tags seja sempre um array de strings
      let tags: string[] = [];
      if (Array.isArray(item.ROTULOS)) {
        tags = item.ROTULOS;
      } else if (
        typeof item.ROTULOS === "string" &&
        item.ROTULOS.trim() !== ""
      ) {
        tags = item.ROTULOS.split(",")
          .map((t: string) => t.trim())
          .filter(Boolean);
      } else if (Array.isArray(item.tags)) {
        tags = item.tags;
      } else if (typeof item.tags === "string" && item.tags.trim() !== "") {
        tags = item.tags
          .split(",")
          .map((t: string) => t.trim())
          .filter(Boolean);
      }

      return {
        number: item.NUMERO || item.number,
        description: item.DESCRICAO || item.description,
        brandModel: item.MARCA_MODELO || item.brandModel || "",
        currentResponsibility:
          item.RESPONSABILIDADE_ATUAL || item.currentResponsibility || "",
        conservationState: normalizeConservationState(
          item.ESTADO_DE_CONSERVACAO ||
            item.conservationState ||
            item.conservationState
        ),
        location: item.SALA || item.location || "",
        tags,
        ed: item.ED || item.ed || "",
        sector: item.SETOR_DO_RESPONSAVEL || item.sector || "",
        commissionId,
        campusId: itemCampusId,
      };
    });

    // Cria todos os itens
    const createdItems = await prisma.inventoryItem.createMany({
      data: itemsToCreate,
    });

    // Buscar os itens criados para adicionar ao histórico (últimos criados nesta comissão)
    const createdItemList = await prisma.inventoryItem.findMany({
      where: {
        commissionId: commissionId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: items.length, // Pegar apenas a quantidade de itens que foram criados
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
      include: {
        commission: {
          include: {
            members: true,
            campus: {
              include: {
                organization: true,
              },
            },
          },
        },
      },
    });

    if (!currentItem) {
      return NextResponse.json(
        { error: "Item de inventário não encontrado" },
        { status: 404 }
      );
    }

    // Remover verificação de permissão - todos podem editar itens

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
      include: {
        commission: {
          include: {
            members: true,
            campus: {
              include: {
                organization: true,
              },
            },
          },
        },
      },
    });

    if (!itemToDelete) {
      return NextResponse.json(
        { error: "Item de inventário não encontrado" },
        { status: 404 }
      );
    }

    // Remover verificação de permissão - todos podem deletar itens

    // Criar registro no histórico ANTES de deletar o item
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
      return NextResponse.json(
        { error: "Erro ao criar histórico de exclusão" },
        { status: 500 }
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
