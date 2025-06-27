import { NextResponse } from "next/server";
import { data } from "../../../data";

// Simulando um banco de dados em memória
let organizations = [...data.organizations];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const organization = organizations.find((o) => o.id === id);
      if (!organization) {
        return NextResponse.json(
          { error: "Organização não encontrada" },
          { status: 404 }
        );
      }
      return NextResponse.json(organization);
    }

    return NextResponse.json(organizations);
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
    const { name, shortName, active } = body;

    if (!name || !shortName) {
      return NextResponse.json(
        { error: "Nome e nome curto são obrigatórios" },
        { status: 400 }
      );
    }

    const newOrganization = {
      id: `org-uuid-${Date.now()}`,
      name,
      shortName,
      active: active !== undefined ? active : true,
    };

    organizations.push(newOrganization);

    return NextResponse.json(newOrganization, { status: 201 });
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
    const { id, name, shortName, active } = body;

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    const orgIndex = organizations.findIndex((o) => o.id === id);
    if (orgIndex === -1) {
      return NextResponse.json(
        { error: "Organização não encontrada" },
        { status: 404 }
      );
    }

    organizations[orgIndex] = {
      ...organizations[orgIndex],
      ...(name && { name }),
      ...(shortName && { shortName }),
      ...(active !== undefined && { active }),
    };

    return NextResponse.json(organizations[orgIndex]);
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

    const orgIndex = organizations.findIndex((o) => o.id === id);
    if (orgIndex === -1) {
      return NextResponse.json(
        { error: "Organização não encontrada" },
        { status: 404 }
      );
    }

    organizations.splice(orgIndex, 1);

    return NextResponse.json(
      { message: "Organização deletada com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
