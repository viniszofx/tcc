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
      include: {
        inventoryItems: {
          select: { id: true },
        },
        members: {
          select: { userId: true },
        },
      },
    });

    if (!existingCommission) {
      return NextResponse.json(
        { error: "Comissão não encontrada" },
        { status: 404 }
      );
    }

    console.log(
      `🗑️ Iniciando exclusão da comissão: ${
        existingCommission.name || "Sem nome"
      }`
    );
    console.log(
      `📊 Itens de inventário a serem deletados: ${existingCommission.inventoryItems.length}`
    );
    console.log(
      `👥 Membros da comissão a serem removidos: ${existingCommission.members.length}`
    );

    // Deletar a comissão (CASCADE irá deletar automaticamente):
    // - Todos os InventoryItem relacionados
    // - Todo o InventoryHistory dos itens
    // - Todos os CommissionMember
    // Os UserProfile permanecem intactos
    await prisma.commission.delete({
      where: { id },
    });

    console.log(
      `✅ Comissão deletada com sucesso. ${existingCommission.inventoryItems.length} itens de inventário e ${existingCommission.members.length} relações de membro foram removidos. Usuários preservados.`
    );

    return NextResponse.json(
      {
        message: "Comissão deletada com sucesso",
        deletedItems: {
          inventoryItems: existingCommission.inventoryItems.length,
          commissionMembers: existingCommission.members.length,
        },
        preserved: {
          users: "Todos os usuários foram preservados nas organizações/campus",
        },
      },
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
