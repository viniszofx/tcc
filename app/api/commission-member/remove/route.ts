import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  try {
    // Verificar autenticação - desenvolvimento vs produção
    const supabase = await createServerSupabaseClient();
    let currentUser;

    if (process.env.NODE_ENV === "development") {
      currentUser = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        email: "dev@example.com",
      };
    } else {
      const {
        data: { user: realUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !realUser) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }
      currentUser = realUser;
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const commissionId = searchParams.get("commissionId");

    if (!userId || !commissionId) {
      return NextResponse.json(
        { error: "ID do usuário e ID da comissão são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o usuário atual tem permissão para remover membros desta comissão
    // Deve ser admin da organização ou presidente da comissão
    const currentUserProfile = await prisma.userProfile.findUnique({
      where: { id: currentUser.id },
      include: {
        organizationMembers: true,
        commissionMembers: {
          include: {
            commission: true,
          },
        },
      },
    });

    if (!currentUserProfile) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se é admin da organização
    const isAdmin = currentUserProfile.organizationMembers.some(
      (member) => member.role === "admin"
    );

    // Verificar se é presidente da comissão específica
    const isPresidentOfCommission = currentUserProfile.commissionMembers.some(
      (member) =>
        member.commissionId === commissionId &&
        member.roleInCommission === "Presidente"
    );

    if (!isAdmin && !isPresidentOfCommission) {
      return NextResponse.json(
        { error: "Você não tem permissão para remover membros desta comissão" },
        { status: 403 }
      );
    }

    // Verificar se o membro existe na comissão
    const existingMember = await prisma.commissionMember.findUnique({
      where: {
        userId_commissionId: {
          userId,
          commissionId,
        },
      },
      include: {
        user: true,
        commission: true,
      },
    });

    if (!existingMember) {
      return NextResponse.json(
        { error: "Membro não encontrado nesta comissão" },
        { status: 404 }
      );
    }

    // Não permitir que um presidente remova a si mesmo
    if (
      currentUser.id === userId &&
      existingMember.roleInCommission === "Presidente"
    ) {
      return NextResponse.json(
        { error: "Presidentes não podem remover a si mesmos da comissão" },
        { status: 400 }
      );
    }

    // Remover o membro da comissão
    await prisma.commissionMember.delete({
      where: {
        userId_commissionId: {
          userId,
          commissionId,
        },
      },
    });

    return NextResponse.json(
      {
        message: `${existingMember.user.name} foi removido da comissão ${existingMember.commission.name} com sucesso`,
        removedUser: existingMember.user.name,
        commission: existingMember.commission.name,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao remover membro da comissão:", error);
    if (error instanceof Error && "code" in error && error.code === "P2025") {
      return NextResponse.json(
        { error: "Membro da comissão não encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
