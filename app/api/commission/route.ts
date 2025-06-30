import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const campusId = searchParams.get("campusId");
    const year = searchParams.get("year");

    if (id) {
      const commission = await prisma.commission.findUnique({
        where: { id },
        include: {
          campus: true,
          members: {
            include: {
              user: true,
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
      return NextResponse.json(commission);
    }

    // Construir filtros dinamicamente
    const where: any = {};

    if (campusId) {
      where.campusId = campusId;
    }

    if (year) {
      where.year = parseInt(year);
    }

    const commissions = await prisma.commission.findMany({
      where,
      include: {
        campus: true,
        members: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(commissions);
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

    // Verificar se o campus existe
    const campus = await prisma.campus.findUnique({
      where: { id: campusId },
    });

    if (!campus) {
      return NextResponse.json(
        { error: "Campus não encontrado" },
        { status: 404 }
      );
    }

    const newCommission = await prisma.commission.create({
      data: {
        campusId,
        name,
        type,
        description: description || "",
        spreadsheetUrl: spreadsheet_url || "",
        active: active !== undefined ? active : true,
        year,
      },
      include: {
        campus: true,
        members: {
          include: {
            user: true,
          },
        },
      },
    });

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

    // Verificar se a comissão existe
    const existingCommission = await prisma.commission.findUnique({
      where: { id },
    });

    if (!existingCommission) {
      return NextResponse.json(
        { error: "Comissão não encontrada" },
        { status: 404 }
      );
    }

    // Se campusId for fornecido, verificar se o campus existe
    if (campusId) {
      const campus = await prisma.campus.findUnique({
        where: { id: campusId },
      });

      if (!campus) {
        return NextResponse.json(
          { error: "Campus não encontrado" },
          { status: 404 }
        );
      }
    }

    const updatedCommission = await prisma.commission.update({
      where: { id },
      data: {
        ...(campusId && { campusId }),
        ...(name && { name }),
        ...(type && { type }),
        ...(description !== undefined && { description }),
        ...(spreadsheet_url !== undefined && {
          spreadsheetUrl: spreadsheet_url,
        }),
        ...(active !== undefined && { active }),
        ...(year && { year }),
        updatedAt: new Date(),
      },
      include: {
        campus: true,
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json(updatedCommission);
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

    // Verificar se a comissão existe
    const existingCommission = await prisma.commission.findUnique({
      where: { id },
    });

    if (!existingCommission) {
      return NextResponse.json(
        { error: "Comissão não encontrada" },
        { status: 404 }
      );
    }

    // Deletar a comissão (isso também deletará os membros relacionados se houver CASCADE)
    await prisma.commission.delete({
      where: { id },
    });

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
