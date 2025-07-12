import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateUser } from "@/lib/auth/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: commissionId } = await params;
    const user = await authenticateUser();

    if (!commissionId) {
      return NextResponse.json(
        { error: "ID da comissão é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se a comissão existe
    const commission = await prisma.commission.findUnique({
      where: { id: commissionId },
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
          select: { id: true },
        },
      },
    });

    if (!commission) {
      return NextResponse.json(
        { error: "Comissão não encontrada" },
        { status: 404 }
      );
    }

    // Verificar permissões: Apenas Admin Global, Admin do Sistema ou Presidente da Comissão
    
    // 1. Verificar se é admin global
    const isGlobalAdmin = user.role === "admin global";
    
    // 2. Verificar se é admin do sistema
    const isSystemAdmin = user.role === "admin";
    
    // 3. Verificar se é presidente da comissão
    const isCommissionPresident = commission.members.some(
      (member) =>
        member.userId === user.id && member.roleInCommission === "Presidente"
    );

    const hasPermission = isGlobalAdmin || isSystemAdmin || isCommissionPresident;

    if (!hasPermission) {
      return NextResponse.json(
        {
          error:
            "Você não tem permissão para apagar o inventário desta comissão. Apenas administradores do sistema ou presidentes da comissão podem realizar esta ação.",
        },
        { status: 403 }
      );
    }

    // Contar itens antes de deletar
    const initialItemCount = commission.inventoryItems.length;

    if (initialItemCount === 0) {
      return NextResponse.json(
        { message: "Não há itens de inventário para apagar nesta comissão" },
        { status: 200 }
      );
    }

    // Buscar todos os itens para criar histórico antes de deletar
    const itemsToDelete = await prisma.inventoryItem.findMany({
      where: { commissionId },
      include: {
        commission: true,
        campus: true,
      },
    });

    // Contar itens antes de deletar
    const itemCount = itemsToDelete.length;

    if (itemCount === 0) {
      return NextResponse.json(
        { message: "Não há itens de inventário para apagar nesta comissão" },
        { status: 200 }
      );
    }

    // Criar histórico primeiro, depois deletar (sem transação para evitar timeout)
    try {
      // Preparar dados do histórico
      const historyData = itemsToDelete.map((item) => ({
        inventoryItemId: null,
        userId: user.id,
        action: "delete" as const,
        changes: JSON.stringify({
          before: {
            id: item.id,
            number: item.number,
            description: item.description,
            brandModel: item.brandModel,
            currentResponsibility: item.currentResponsibility,
            conservationState: item.conservationState,
            location: item.location,
            commissionId: item.commissionId,
            campusId: item.campusId,
          },
          after: null,
          deletedItemId: item.id,
          commissionId: item.commissionId,
        }),
        observation: `Item ${item.number} removido durante exclusão em lote do inventário da comissão ${commission.name}`,
        imageUrl: [],
      }));

      // Criar histórico em lotes
      const batchSize = 100;
      for (let i = 0; i < historyData.length; i += batchSize) {
        const batch = historyData.slice(i, i + batchSize);
        await prisma.inventoryHistory.createMany({
          data: batch,
          skipDuplicates: true,
        });
      }

      console.log(`📝 Criadas ${historyData.length} entradas de histórico`);

      // Deletar todos os itens de inventário da comissão
      const deleteResult = await prisma.inventoryItem.deleteMany({
        where: { commissionId },
      });

      // Limpar a URL da planilha da comissão
      await prisma.commission.update({
        where: { id: commissionId },
        data: {
          spreadsheetUrl: null,
          updatedAt: new Date(),
        },
      });

      console.log(
        `🗑️ Inventário da comissão ${commission.name} apagado por ${user.email}. ${deleteResult.count} itens removidos.`
      );

      return NextResponse.json({
        success: true,
        message: `Inventário apagado com sucesso. ${deleteResult.count} itens removidos.`,
        itemsDeleted: deleteResult.count,
        commission: {
          id: commission.id,
          name: commission.name,
        },
      });
    } catch (error) {
      console.error("Erro ao apagar inventário da comissão:", error);
      return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erro ao apagar inventário da comissão:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}