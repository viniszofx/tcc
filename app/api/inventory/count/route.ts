import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Verificar autenticação real
    const supabase = await createServerSupabaseClient();

    const {
      data: { user: realUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !realUser) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const commissionId = searchParams.get("commissionId");

    if (!commissionId) {
      return NextResponse.json(
        { error: "commissionId é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se o usuário tem acesso à comissão
    const hasCommissionAccess = await prisma.commissionMember.findFirst({
      where: {
        userId: realUser.id,
        commissionId: commissionId,
      },
    });

    if (!hasCommissionAccess) {
      return NextResponse.json(
        { error: "Você não tem permissão para acessar esta comissão" },
        { status: 403 }
      );
    }

    // Contar itens da comissão específica
    const count = await prisma.inventoryItem.count({
      where: {
        commissionId,
      },
    });

    console.log(
      `📊 Contagem de itens - Comissão: ${commissionId}, Itens: ${count}`
    );

    // Pegar timestamp da última atualização
    const lastUpdated = await prisma.inventoryItem.findFirst({
      where: {
        commissionId,
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        updatedAt: true,
      },
    });

    return NextResponse.json({
      count,
      lastUpdated: lastUpdated?.updatedAt || null,
      commissionId,
    });
  } catch (error) {
    console.error("Erro na API de contagem de inventário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
