import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Verificar autenticação - desenvolvimento vs produção
    const supabase = await createServerSupabaseClient();
    let user;

    if (process.env.NODE_ENV === "development") {
      // Em desenvolvimento, usar um usuário fake com UUID válido
      user = {
        id: "88ae80f0-4c14-44ea-b98a-235cf37bf170",
        email: "dev@example.com",
      };
    } else {
      // Em produção, autenticação real
      const {
        data: { user: realUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !realUser) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }
      user = realUser;
    }

    const { searchParams } = new URL(request.url);
    const commissionId = searchParams.get("commissionId");

    if (!commissionId) {
      return NextResponse.json(
        { error: "commissionId é obrigatório" },
        { status: 400 }
      );
    }

    // Contar itens no servidor
    const count = await prisma.inventoryItem.count({
      where: {
        commissionId,
      },
    });

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
