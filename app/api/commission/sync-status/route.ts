import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const commissionId = searchParams.get("commissionId");

    if (!commissionId) {
      return NextResponse.json(
        { error: "ID da comissão é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se a comissão existe
    const commission = await prisma.commission.findUnique({
      where: { id: commissionId },
      select: {
        id: true,
        name: true,
        spreadsheetUrl: true,
        updatedAt: true,
      },
    });

    if (!commission) {
      return NextResponse.json(
        { error: "Comissão não encontrada" },
        { status: 404 }
      );
    }

    // Contar itens do inventário da comissão
    const inventoryCount = await prisma.inventoryItem.count({
      where: { commissionId },
    });

    // Buscar último upload/sincronização
    const lastSync = await prisma.inventoryHistory.findFirst({
      where: {
        inventoryItem: {
          commissionId: commissionId,
        },
      },
      orderBy: { timestamp: "desc" },
      select: {
        id: true,
        action: true,
        timestamp: true,
        inventoryItem: {
          select: {
            id: true,
            description: true,
          },
        },
      },
    });

    return NextResponse.json({
      commission: {
        id: commission.id,
        name: commission.name,
        hasSpreadsheet: !!commission.spreadsheetUrl,
        spreadsheetUrl: commission.spreadsheetUrl,
        lastUpdated: commission.updatedAt,
      },
      inventory: {
        count: inventoryCount,
        lastSync: lastSync?.timestamp || null,
        lastAction: lastSync?.action || null,
      },
      status: {
        isConfigured: !!commission.spreadsheetUrl,
        hasSyncedData: inventoryCount > 0,
        isReady: !!commission.spreadsheetUrl && inventoryCount > 0,
      },
    });
  } catch (error) {
    console.error("Erro ao verificar status de sincronização:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
