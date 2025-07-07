import { withPermissions } from "@/lib/permissions/middleware";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Verificar permissões usando CASL
  const permissionResult = await withPermissions(request, [
    { action: "read", subject: "User" },
  ]);

  if (!permissionResult.success) {
    return NextResponse.json(
      { error: permissionResult.error },
      { status: permissionResult.status }
    );
  }

  try {

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

export async function POST(request: NextRequest) {
  // Verificar permissões usando CASL
  const permissionResult = await withPermissions(request, [
    { action: "create", subject: "User" },
  ]);

  if (!permissionResult.success) {
    return NextResponse.json(
      { error: permissionResult.error },
      { status: permissionResult.status }
    );
  }

  const { user: currentUser } = permissionResult;

  try {
    const body = await request.json();
    const { userId, commissionId, roleInCommission } = body;

    if (!userId || !commissionId) {
      return NextResponse.json(
        { error: "ID do usuário e ID da comissão são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o usuário atual pode adicionar membros a esta comissão específica
    const canAssignToCommission = currentUser.ability.can("assign", "CommissionMember") &&
      (currentUser.role === "admin global" || 
       currentUser.role === "admin" ||
       currentUser.commissionMembers?.some(member => 
         member.commissionId === commissionId && member.roleInCommission === "Presidente"
       ));

    if (!canAssignToCommission) {
      return NextResponse.json(
        { error: "Apenas administradores ou presidentes da comissão podem adicionar membros" },
        { status: 403 }
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

export async function PUT(request: NextRequest) {
  // Verificar permissões usando CASL
  const permissionResult = await withPermissions(request, [
    { action: "update", subject: "User" },
  ]);

  if (!permissionResult.success) {
    return NextResponse.json(
      { error: permissionResult.error },
      { status: permissionResult.status }
    );
  }

  const { user: currentUser } = permissionResult;

  try {
    const body = await request.json();
    const { userId, commissionId, roleInCommission } = body;

    if (!userId || !commissionId) {
      return NextResponse.json(
        { error: "ID do usuário e ID da comissão são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o usuário atual pode atualizar membros desta comissão específica
    const canUpdateCommissionMember = currentUser.ability.can("manage", "Commission") &&
      (currentUser.role === "admin global" || 
       currentUser.role === "admin" ||
       currentUser.commissionMembers?.some(member => 
         member.commissionId === commissionId && member.roleInCommission === "Presidente"
       ));

    if (!canUpdateCommissionMember) {
      return NextResponse.json(
        { error: "Apenas administradores ou presidentes da comissão podem atualizar membros" },
        { status: 403 }
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

export async function DELETE(request: NextRequest) {
  // Verificar permissões usando CASL
  const permissionResult = await withPermissions(request, [
    { action: "delete", subject: "User" },
  ]);

  if (!permissionResult.success) {
    return NextResponse.json(
      { error: permissionResult.error },
      { status: permissionResult.status }
    );
  }

  const { user: currentUser } = permissionResult;

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const commissionId = searchParams.get("commissionId");

    if (!userId || !commissionId) {
      return NextResponse.json(
        { error: "ID do usuário e ID da comissão são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o usuário atual pode remover membros desta comissão específica
    const canRemoveFromCommission = currentUser.ability.can("remove", "CommissionMember") &&
      (currentUser.role === "admin global" || 
       currentUser.role === "admin" ||
       currentUser.commissionMembers?.some(member => 
         member.commissionId === commissionId && member.roleInCommission === "Presidente"
       ));

    if (!canRemoveFromCommission) {
      return NextResponse.json(
        { error: "Apenas administradores ou presidentes da comissão podem remover membros" },
        { status: 403 }
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
