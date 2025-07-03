import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const inventoryItemId = searchParams.get("inventoryItemId");
    const userId = searchParams.get("userId");
    const action = searchParams.get("action");
    const commissionId = searchParams.get("commissionId");

    if (id) {
      const history = await prisma.inventoryHistory.findUnique({
        where: { id },
        include: {
          inventoryItem: {
            include: {
              commission: true,
              campus: true,
            },
          },
          user: true,
        },
      });

      if (!history) {
        return NextResponse.json(
          { error: "Histórico não encontrado" },
          { status: 404 }
        );
      }
      return NextResponse.json(history);
    }

    // Construir filtros dinamicamente
    const where: any = {};

    if (inventoryItemId) {
      where.inventoryItemId = inventoryItemId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (action) {
      where.action = action;
    }

    // Filtrar por commissionId através do relacionamento com inventoryItem
    // IMPORTANTE: Garantir que só mostra histórico da comissão especificada
    if (commissionId) {
      where.inventoryItem = {
        commissionId: commissionId,
      };
    }

    const histories = await prisma.inventoryHistory.findMany({
      where,
      include: {
        inventoryItem: {
          include: {
            commission: true,
            campus: true,
          },
        },
        user: true,
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    // Log para auditoria: quantos registros de histórico foram retornados para qual comissão
    if (commissionId) {
      console.log(
        `📊 Histórico consultado - Comissão: ${commissionId}, Registros: ${histories.length}`
      );
    }

    return NextResponse.json(histories);
  } catch (error) {
    console.error("Erro na API de histórico:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { inventoryItemId, userId, action, changes, observation, image_url } =
      body;

    if (!inventoryItemId || !userId || !action) {
      return NextResponse.json(
        { error: "ID do item, ID do usuário e ação são obrigatórios" },
        { status: 400 }
      );
    }

    const newHistory = await prisma.inventoryHistory.create({
      data: {
        inventoryItemId,
        userId,
        action,
        changes: changes || "",
        observation: observation || "",
        imageUrl: image_url || [],
        timestamp: new Date(),
      },
      include: {
        inventoryItem: true,
        user: true,
      },
    });

    return NextResponse.json(newHistory, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, changes, observation, image_url } = body;

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    // Verificar se o histórico existe
    const existingHistory = await prisma.inventoryHistory.findUnique({
      where: { id },
    });

    if (!existingHistory) {
      return NextResponse.json(
        { error: "Histórico não encontrado" },
        { status: 404 }
      );
    }

    const updatedHistory = await prisma.inventoryHistory.update({
      where: { id },
      data: {
        ...(changes !== undefined && { changes }),
        ...(observation !== undefined && { observation }),
        ...(image_url !== undefined && { imageUrl: image_url }),
      },
      include: {
        inventoryItem: true,
        user: true,
      },
    });

    return NextResponse.json(updatedHistory);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    // Verificar se o histórico existe
    const existingHistory = await prisma.inventoryHistory.findUnique({
      where: { id },
    });

    if (!existingHistory) {
      return NextResponse.json(
        { error: "Histórico não encontrado" },
        { status: 404 }
      );
    }

    // Deletar o histórico
    await prisma.inventoryHistory.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Histórico deletado com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
