import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const commission = await prisma.commission.findUnique({
      where: { id },
      include: {
        campus: {
          include: {
            organization: true,
          },
        },
        members: {
          include: {
            user: true,
          },
        },
        inventoryItems: {
          include: {
            history: {
              include: {
                user: true,
              },
              orderBy: {
                timestamp: "desc",
              },
            },
          },
          orderBy: {
            number: "asc",
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
  } catch (error) {
    console.error("Erro ao buscar comissão:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, type, description, spreadsheetUrl, active, year } = body;

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

    const updatedCommission = await prisma.commission.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(description !== undefined && { description }),
        ...(spreadsheetUrl !== undefined && { spreadsheetUrl }),
        ...(active !== undefined && { active }),
        ...(year && { year }),
        updatedAt: new Date(),
      },
      include: {
        campus: {
          include: {
            organization: true,
          },
        },
        members: {
          include: {
            user: true,
          },
        },
        inventoryItems: {
          include: {
            history: {
              include: {
                user: true,
              },
              orderBy: {
                timestamp: "desc",
              },
            },
          },
          orderBy: {
            number: "asc",
          },
        },
      },
    });

    return NextResponse.json(updatedCommission);
  } catch (error) {
    console.error("Erro ao atualizar comissão:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Deletar a comissão
    await prisma.commission.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Comissão deletada com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao deletar comissão:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
