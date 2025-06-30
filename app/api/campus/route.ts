import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const organizationId = searchParams.get("organizationId");

    if (id) {
      const campus = await prisma.campus.findUnique({
        where: { id },
        include: {
          organization: true,
          commissions: {
            include: {
              members: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });

      if (!campus) {
        return NextResponse.json(
          { error: "Campus não encontrado" },
          { status: 404 }
        );
      }
      return NextResponse.json(campus);
    }

    // Construir filtros dinamicamente
    const where: any = {};

    if (organizationId) {
      where.organizationId = organizationId;
    }

    const campuses = await prisma.campus.findMany({
      where,
      include: {
        organization: true,
        commissions: {
          include: {
            members: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(campuses);
  } catch (error) {
    console.error("Erro ao buscar campuses:", error);
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

    // Verificar se a organização existe
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organização não encontrada" },
        { status: 404 }
      );
    }

    // Verificar se já existe um campus com o mesmo código na organização
    const existingCampus = await prisma.campus.findFirst({
      where: {
        code,
        organizationId,
      },
    });

    if (existingCampus) {
      return NextResponse.json(
        { error: "Já existe um campus com este código nesta organização" },
        { status: 409 }
      );
    }

    const newCampus = await prisma.campus.create({
      data: {
        organizationId,
        name,
        code,
        active: active !== undefined ? active : true,
      },
      include: {
        organization: true,
        commissions: true,
      },
    });

    return NextResponse.json(newCampus, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar campus:", error);
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

    // Verificar se o campus existe
    const existingCampus = await prisma.campus.findUnique({
      where: { id },
    });

    if (!existingCampus) {
      return NextResponse.json(
        { error: "Campus não encontrado" },
        { status: 404 }
      );
    }

    // Se organizationId for fornecido, verificar se a organização existe
    if (organizationId) {
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
      });

      if (!organization) {
        return NextResponse.json(
          { error: "Organização não encontrada" },
          { status: 404 }
        );
      }
    }

    // Se code for fornecido, verificar se não há conflito
    if (code && code !== existingCampus.code) {
      const conflictingCampus = await prisma.campus.findFirst({
        where: {
          code,
          organizationId: organizationId || existingCampus.organizationId,
          id: { not: id },
        },
      });

      if (conflictingCampus) {
        return NextResponse.json(
          { error: "Já existe um campus com este código nesta organização" },
          { status: 409 }
        );
      }
    }

    const updatedCampus = await prisma.campus.update({
      where: { id },
      data: {
        ...(organizationId && { organizationId }),
        ...(name && { name }),
        ...(code && { code }),
        ...(active !== undefined && { active }),
        updatedAt: new Date(),
      },
      include: {
        organization: true,
        commissions: true,
      },
    });

    return NextResponse.json(updatedCampus);
  } catch (error) {
    console.error("Erro ao atualizar campus:", error);
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

    // Verificar se o campus existe
    const existingCampus = await prisma.campus.findUnique({
      where: { id },
    });

    if (!existingCampus) {
      return NextResponse.json(
        { error: "Campus não encontrado" },
        { status: 404 }
      );
    }

    // Deletar o campus (isso também deletará as comissões relacionadas se houver CASCADE)
    await prisma.campus.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Campus deletado com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao deletar campus:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
