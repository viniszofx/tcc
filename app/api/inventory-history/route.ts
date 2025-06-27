import { NextResponse } from "next/server";
import { data } from "../../../data";

// Simulando um banco de dados em memória
let inventoryHistories = [...data.inventoryHistories];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const inventoryItemId = searchParams.get("inventoryItemId");
    const userId = searchParams.get("userId");
    const action = searchParams.get("action");

    if (id) {
      const history = inventoryHistories.find((h) => h.id === id);
      if (!history) {
        return NextResponse.json(
          { error: "Histórico não encontrado" },
          { status: 404 }
        );
      }
      return NextResponse.json(history);
    }

    let filteredHistories = inventoryHistories;

    if (inventoryItemId) {
      filteredHistories = filteredHistories.filter(
        (h) => h.inventoryItemId === inventoryItemId
      );
    }

    if (userId) {
      filteredHistories = filteredHistories.filter((h) => h.userId === userId);
    }

    if (action) {
      filteredHistories = filteredHistories.filter((h) => h.action === action);
    }

    // Ordenar por timestamp decrescente (mais recente primeiro)
    filteredHistories.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json(filteredHistories);
  } catch (error) {
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

    const newHistory = {
      id: `history-uuid-${Date.now()}`,
      inventoryItemId,
      userId,
      action,
      changes: changes || "",
      observation: observation || "",
      image_url: image_url || [],
      timestamp: new Date().toISOString(),
    };

    inventoryHistories.push(newHistory);

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

    const historyIndex = inventoryHistories.findIndex((h) => h.id === id);
    if (historyIndex === -1) {
      return NextResponse.json(
        { error: "Histórico não encontrado" },
        { status: 404 }
      );
    }

    inventoryHistories[historyIndex] = {
      ...inventoryHistories[historyIndex],
      ...(changes !== undefined && { changes }),
      ...(observation !== undefined && { observation }),
      ...(image_url !== undefined && { image_url }),
    };

    return NextResponse.json(inventoryHistories[historyIndex]);
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

    const historyIndex = inventoryHistories.findIndex((h) => h.id === id);
    if (historyIndex === -1) {
      return NextResponse.json(
        { error: "Histórico não encontrado" },
        { status: 404 }
      );
    }

    inventoryHistories.splice(historyIndex, 1);

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
