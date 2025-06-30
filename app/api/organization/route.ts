import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const organization = await prisma.organization.findUnique({
        where: { id },
        include: {
          campuses: {
            include: {
              commissions: true,
            },
          },
          members: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!organization) {
        return NextResponse.json(
          { error: "Organização não encontrada" },
          { status: 404 }
        );
      }
      return NextResponse.json(organization);
    }

    const organizations = await prisma.organization.findMany({
      include: {
        campuses: {
          include: {
            commissions: true,
          },
        },
        members: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

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

    const newOrganization = await prisma.organization.create({
      data: {
        name,
        shortName,
        active: active !== undefined ? active : true,
      },
      include: {
        campuses: {
          include: {
            commissions: true,
          },
        },
        members: {
          include: {
            user: true,
          },
        },
      },
    });

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

    // Verificar se a organização existe
    const existingOrganization = await prisma.organization.findUnique({
      where: { id },
    });

    if (!existingOrganization) {
      return NextResponse.json(
        { error: "Organização não encontrada" },
        { status: 404 }
      );
    }

    const updatedOrganization = await prisma.organization.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(shortName && { shortName }),
        ...(active !== undefined && { active }),
        updatedAt: new Date(),
      },
      include: {
        campuses: {
          include: {
            commissions: true,
          },
        },
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json(updatedOrganization);
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

    // Verificar se a organização existe
    const existingOrganization = await prisma.organization.findUnique({
      where: { id },
    });

    if (!existingOrganization) {
      return NextResponse.json(
        { error: "Organização não encontrada" },
        { status: 404 }
      );
    }

    // Deletar a organização (isso também deletará os campuses relacionados se houver CASCADE)
    await prisma.organization.delete({
      where: { id },
    });

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
