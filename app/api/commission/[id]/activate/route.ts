import { NextRequest, NextResponse } from "next/server";
import { withPermissions } from "@/lib/permissions/middleware";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const commissionId = params.id;

    // Verificar se a comissão existe
    const commission = await prisma.commission.findUnique({
      where: { id: commissionId },
    });

    if (!commission) {
      return NextResponse.json(
        { error: "Comissão não encontrada" },
        { status: 404 }
      );
    }

    // Verificar se a comissão já está ativa
    if (commission.active) {
      return NextResponse.json(
        { error: "Comissão já está ativa" },
        { status: 400 }
      );
    }

    // Verificar se a comissão está finalizada
    if (commission.finalized) {
      return NextResponse.json(
        { error: "Não é possível ativar uma comissão finalizada" },
        { status: 400 }
      );
    }

    // Ativar a comissão
    const updatedCommission = await prisma.commission.update({
      where: { id: commissionId },
      data: {
        active: true,
        activatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedCommission);
  } catch (error) {
    console.error("Erro ao ativar comissão:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}