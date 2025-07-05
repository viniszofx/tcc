import { prisma } from "@/lib/prisma";
import { authenticateUser } from "@/lib/auth/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const user = await authenticateUser();
    
    const { searchParams } = new URL(request.url);
    const commissionId = searchParams.get("commissionId");
    const campusId = searchParams.get("campusId");

    // Construir filtros
    const where: any = {};
    
    if (commissionId) {
      where.commissionId = commissionId;
    }
    
    if (campusId) {
      where.campusId = campusId;
    }

    // Buscar valores únicos de responsáveis, setores e salas
    const uniqueValues = await prisma.inventoryItem.findMany({
      where,
      select: {
        currentResponsibility: true,
        sector: true,
        location: true,
      },
      distinct: ['currentResponsibility', 'sector', 'location'],
    });

    // Extrair valores únicos e filtrar valores vazios/nulos
    const responsibilities = [...new Set(
      uniqueValues
        .map(item => item.currentResponsibility)
        .filter(value => value && value.trim() !== '')
    )].sort();

    const sectors = [...new Set(
      uniqueValues
        .map(item => item.sector)
        .filter(value => value && value.trim() !== '')
    )].sort();

    const locations = [...new Set(
      uniqueValues
        .map(item => item.location)
        .filter(value => value && value.trim() !== '')
    )].sort();

    return NextResponse.json({
      responsibilities,
      sectors,
      locations,
    });
  } catch (error) {
    console.error("Erro ao buscar valores únicos:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await authenticateUser();
    const data = await request.json();
    const { type, value, commissionId } = data;

    if (!type || !value || !commissionId) {
      return NextResponse.json(
        { error: "Tipo, valor e ID da comissão são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o tipo é válido
    if (!['responsibility', 'sector', 'location'].includes(type)) {
      return NextResponse.json(
        { error: "Tipo inválido. Use: responsibility, sector ou location" },
        { status: 400 }
      );
    }

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

    // Para este endpoint, apenas retornamos sucesso
    // Os valores serão salvos quando um item de inventário for criado/atualizado
    return NextResponse.json({ 
      success: true, 
      message: `${type} "${value}" será disponível para uso` 
    });
  } catch (error) {
    console.error("Erro ao adicionar novo valor:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}