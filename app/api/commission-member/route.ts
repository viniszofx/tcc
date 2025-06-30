import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Verificar autenticação - desenvolvimento vs produção
    const supabase = await createServerSupabaseClient();
    let user;

    if (process.env.NODE_ENV === "development") {
      user = { id: "550e8400-e29b-41d4-a716-446655440000", email: "dev@example.com" };
    } else {
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
    const userId = searchParams.get("userId");
    const commissionId = searchParams.get("commissionId");

    if (userId && commissionId) {
      const member = await prisma.commissionMember.findUnique({
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

      if (!member) {
        return NextResponse.json(
          { error: "Membro da comissão não encontrado" },
          { status: 404 }
        );
      }
      return NextResponse.json(member);
    }

    if (userId) {
      const members = await prisma.commissionMember.findMany({
        where: { userId },
        include: {
          user: true,
          commission: true,
        },
      });
      return NextResponse.json(members);
    }

    if (commissionId) {
      const members = await prisma.commissionMember.findMany({
        where: { commissionId },
        include: {
          user: true,
          commission: true,
        },
      });
      return NextResponse.json(members);
    }

    const members = await prisma.commissionMember.findMany({
      include: {
        user: true,
        commission: true,
      },
    });
    return NextResponse.json(members);
  } catch (error) {
    console.error("Erro na API de membros da comissão:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Verificar autenticação - desenvolvimento vs produção
    const supabase = await createServerSupabaseClient();
    let user;

    if (process.env.NODE_ENV === "development") {
      user = { id: "550e8400-e29b-41d4-a716-446655440000", email: "dev@example.com" };
    } else {
      const {
        data: { user: realUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !realUser) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }
      user = realUser;
    }

    const body = await request.json();
    const { userId, commissionId, roleInCommission } = body;

    if (!userId || !commissionId) {
      return NextResponse.json(
        { error: "ID do usuário e ID da comissão são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se já existe
    const existingMember = await prisma.commissionMember.findUnique({
      where: {
        userId_commissionId: {
          userId,
          commissionId,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "Usuário já é membro desta comissão" },
        { status: 400 }
      );
    }

    const newMember = await prisma.commissionMember.create({
      data: {
        userId,
        commissionId,
        roleInCommission: roleInCommission || "Membro",
      },
      include: {
        user: true,
        commission: true,
      },
    });

    return NextResponse.json(newMember, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar membro da comissão:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    // Verificar autenticação - desenvolvimento vs produção
    const supabase = await createServerSupabaseClient();
    let user;

    if (process.env.NODE_ENV === "development") {
      user = { id: "550e8400-e29b-41d4-a716-446655440000", email: "dev@example.com" };
    } else {
      const {
        data: { user: realUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !realUser) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }
      user = realUser;
    }

    const body = await request.json();
    const { userId, commissionId, roleInCommission } = body;

    if (!userId || !commissionId) {
      return NextResponse.json(
        { error: "ID do usuário e ID da comissão são obrigatórios" },
        { status: 400 }
      );
    }

    const updatedMember = await prisma.commissionMember.update({
      where: {
        userId_commissionId: {
          userId,
          commissionId,
        },
      },
      data: {
        ...(roleInCommission && { roleInCommission }),
      },
      include: {
        user: true,
        commission: true,
      },
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error("Erro ao atualizar membro da comissão:", error);
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

export async function DELETE(request: Request) {
  try {
    // Verificar autenticação - desenvolvimento vs produção
    const supabase = await createServerSupabaseClient();
    let user;

    if (process.env.NODE_ENV === "development") {
      user = { id: "550e8400-e29b-41d4-a716-446655440000", email: "dev@example.com" };
    } else {
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
    const userId = searchParams.get("userId");
    const commissionId = searchParams.get("commissionId");

    if (!userId || !commissionId) {
      return NextResponse.json(
        { error: "ID do usuário e ID da comissão são obrigatórios" },
        { status: 400 }
      );
    }

    await prisma.commissionMember.delete({
      where: {
        userId_commissionId: {
          userId,
          commissionId,
        },
      },
    });

    return NextResponse.json(
      { message: "Membro removido da comissão com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao deletar membro da comissão:", error);
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
