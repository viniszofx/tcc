import { NextResponse } from "next/server";
import { data } from "../../../data";

// Simulando um banco de dados em memória
let inventoryItems = [...data.inventoryItems];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const commissionId = searchParams.get("commissionId");
    const campusId = searchParams.get("campusId");
    const sector = searchParams.get("sector");
    const ed = searchParams.get("ed");

    if (id) {
      const item = inventoryItems.find((i) => i.id === id);
      if (!item) {
        return NextResponse.json(
          { error: "Item de inventário não encontrado" },
          { status: 404 }
        );
      }
      return NextResponse.json(item);
    }

    let filteredItems = inventoryItems;

    if (commissionId) {
      filteredItems = filteredItems.filter(
        (i) => i.commissionId === commissionId
      );
    }

    if (campusId) {
      filteredItems = filteredItems.filter((i) => i.campusId === campusId);
    }

    if (sector) {
      filteredItems = filteredItems.filter((i) => i.sector === sector);
    }

    if (ed) {
      filteredItems = filteredItems.filter((i) => i.ed === ed);
    }

    return NextResponse.json(filteredItems);
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
    const {
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

    if (!commissionId || !campusId || !number || !description) {
      return NextResponse.json(
        {
          error:
            "ID da comissão, ID do campus, número e descrição são obrigatórios",
        },
        { status: 400 }
      );
    }

    const newItem = {
      id: `inventory-uuid-${Date.now()}`,
      commissionId,
      campusId,
      number,
      description,
      brandModel: brandModel || "",
      currentResponsibility: currentResponsibility || "",
      conservationState: conservationState || "",
      location: location || "",
      tags: tags || [],
      ed: ed || new Date().getFullYear().toString(),
      updatedAt: new Date().toISOString(),
      sector: sector || "",
    };

    inventoryItems.push(newItem);

    return NextResponse.json(newItem, { status: 201 });
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

    const itemIndex = inventoryItems.findIndex((i) => i.id === id);
    if (itemIndex === -1) {
      return NextResponse.json(
        { error: "Item de inventário não encontrado" },
        { status: 404 }
      );
    }

    inventoryItems[itemIndex] = {
      ...inventoryItems[itemIndex],
      ...(commissionId && { commissionId }),
      ...(campusId && { campusId }),
      ...(number && { number }),
      ...(description && { description }),
      ...(brandModel !== undefined && { brandModel }),
      ...(currentResponsibility !== undefined && { currentResponsibility }),
      ...(conservationState !== undefined && { conservationState }),
      ...(location !== undefined && { location }),
      ...(tags !== undefined && { tags }),
      ...(ed && { ed }),
      ...(sector !== undefined && { sector }),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(inventoryItems[itemIndex]);
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

    const itemIndex = inventoryItems.findIndex((i) => i.id === id);
    if (itemIndex === -1) {
      return NextResponse.json(
        { error: "Item de inventário não encontrado" },
        { status: 404 }
      );
    }

    inventoryItems.splice(itemIndex, 1);

    return NextResponse.json(
      { message: "Item de inventário deletado com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
