import { NextResponse } from "next/server";
import { data } from "../../../data";

// Simulando um banco de dados em memória
let campuses = [...data.campuses];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const organizationId = searchParams.get("organizationId");

    if (id) {
      const campus = campuses.find((c) => c.id === id);
      if (!campus) {
        return NextResponse.json(
          { error: "Campus não encontrado" },
          { status: 404 }
        );
      }
      return NextResponse.json(campus);
    }

    if (organizationId) {
      const filteredCampuses = campuses.filter(
        (c) => c.organizationId === organizationId
      );
      return NextResponse.json(filteredCampuses);
    }

    return NextResponse.json(campuses);
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
    const { organizationId, name, code, active } = body;

    if (!organizationId || !name || !code) {
      return NextResponse.json(
        { error: "ID da organização, nome e código são obrigatórios" },
        { status: 400 }
      );
    }

    const newCampus = {
      id: `campus-uuid-${Date.now()}`,
      organizationId,
      name,
      code,
      active: active !== undefined ? active : true,
    };

    campuses.push(newCampus);

    return NextResponse.json(newCampus, { status: 201 });
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
    const { id, organizationId, name, code, active } = body;

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    const campusIndex = campuses.findIndex((c) => c.id === id);
    if (campusIndex === -1) {
      return NextResponse.json(
        { error: "Campus não encontrado" },
        { status: 404 }
      );
    }

    campuses[campusIndex] = {
      ...campuses[campusIndex],
      ...(organizationId && { organizationId }),
      ...(name && { name }),
      ...(code && { code }),
      ...(active !== undefined && { active }),
    };

    return NextResponse.json(campuses[campusIndex]);
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

    const campusIndex = campuses.findIndex((c) => c.id === id);
    if (campusIndex === -1) {
      return NextResponse.json(
        { error: "Campus não encontrado" },
        { status: 404 }
      );
    }

    campuses.splice(campusIndex, 1);

    return NextResponse.json(
      { message: "Campus deletado com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
