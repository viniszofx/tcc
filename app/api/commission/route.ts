import { NextResponse } from "next/server";
import { data } from "../../../data";

// Simulando um banco de dados em memória
let commissions = [...data.commissions];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const campusId = searchParams.get("campusId");
    const year = searchParams.get("year");

    if (id) {
      const commission = commissions.find((c) => c.id === id);
      if (!commission) {
        return NextResponse.json(
          { error: "Comissão não encontrada" },
          { status: 404 }
        );
      }
      return NextResponse.json(commission);
    }

    let filteredCommissions = commissions;

    if (campusId) {
      filteredCommissions = filteredCommissions.filter(
        (c) => c.campusId === campusId
      );
    }

    if (year) {
      filteredCommissions = filteredCommissions.filter(
        (c) => c.year === parseInt(year)
      );
    }

    return NextResponse.json(filteredCommissions);
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
    const { campusId, name, type, description, spreadsheet_url, active, year } =
      body;

    if (!campusId || !name || !type || !year) {
      return NextResponse.json(
        { error: "ID do campus, nome, tipo e ano são obrigatórios" },
        { status: 400 }
      );
    }

    const newCommission = {
      id: `commission-uuid-${Date.now()}`,
      campusId,
      name,
      type,
      description: description || "",
      spreadsheet_url: spreadsheet_url || "",
      active: active !== undefined ? active : true,
      year,
    };

    commissions.push(newCommission);

    return NextResponse.json(newCommission, { status: 201 });
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
      campusId,
      name,
      type,
      description,
      spreadsheet_url,
      active,
      year,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    const commissionIndex = commissions.findIndex((c) => c.id === id);
    if (commissionIndex === -1) {
      return NextResponse.json(
        { error: "Comissão não encontrada" },
        { status: 404 }
      );
    }

    commissions[commissionIndex] = {
      ...commissions[commissionIndex],
      ...(campusId && { campusId }),
      ...(name && { name }),
      ...(type && { type }),
      ...(description !== undefined && { description }),
      ...(spreadsheet_url !== undefined && { spreadsheet_url }),
      ...(active !== undefined && { active }),
      ...(year && { year }),
    };

    return NextResponse.json(commissions[commissionIndex]);
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

    const commissionIndex = commissions.findIndex((c) => c.id === id);
    if (commissionIndex === -1) {
      return NextResponse.json(
        { error: "Comissão não encontrada" },
        { status: 404 }
      );
    }

    commissions.splice(commissionIndex, 1);

    return NextResponse.json(
      { message: "Comissão deletada com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
