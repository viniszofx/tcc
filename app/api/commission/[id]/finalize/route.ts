import { NextRequest, NextResponse } from "next/server";
import { withPermissions } from "@/lib/permissions/middleware";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    // Verificar permissões usando CASL
    const authResult = await withPermissions(request as any, [
      { action: "update", subject: "Commission" },
    ]);

    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;

    const commissionId = resolvedParams.id;

    // Verificar se a comissão existe
    const commission = await prisma.commission.findUnique({
      where: { id: commissionId },
      include: {
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

    // Verificar se a comissão já está finalizada
    if (commission.finalized) {
      return NextResponse.json(
        { error: "Comissão já está finalizada" },
        { status: 400 }
      );
    }

    // Verificar permissões - apenas administradores globais, admins do sistema e presidentes podem finalizar
    const userFromDb = await prisma.userProfile.findUnique({
      where: { id: user.id },
    });

    if (!userFromDb) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const isGlobalAdmin = userFromDb.role === "global";
    const isSystemAdmin = userFromDb.role === "admin";
    const isPresident = commission.members.some(
      (member) => member.userId === user.id && member.roleInCommission === "Presidente"
    );

    if (!isGlobalAdmin && !isSystemAdmin && !isPresident) {
      return NextResponse.json(
        { error: "Você não tem permissão para finalizar esta comissão" },
        { status: 403 }
      );
    }

    // Finalizar a comissão
    const updatedCommission = await prisma.commission.update({
      where: { id: commissionId },
      data: {
        finalized: true,
        finalizedAt: new Date(),
        active: false, // Desativar a comissão ao finalizar
      },
    });

    return NextResponse.json(updatedCommission);
  } catch (error) {
    console.error("Erro ao finalizar comissão:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}