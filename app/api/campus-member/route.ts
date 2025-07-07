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
    const campusId = searchParams.get("campusId");

    if (userId && campusId) {
      const member = await prisma.campusMember.findUnique({
        where: {
          userId_campusId: {
            userId,
            campusId,
          },
        },
        include: {
          user: true,
          campus: true,
        },
      });

      if (!member) {
        return NextResponse.json(
          { error: "Membro do campus não encontrado" },
          { status: 404 }
        );
      }
      return NextResponse.json(member);
    }

    // Construir filtros dinamicamente
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (campusId) {
      where.campusId = campusId;
    }

    const members = await prisma.campusMember.findMany({
      where,
      include: {
        user: true,
        campus: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(members);
  } catch (error) {
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
  try {
    const body = await request.json();
    const { userId, campusId } = body;

    if (!userId || !campusId) {
      return NextResponse.json(
        { error: "ID do usuário e ID do campus são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o usuário existe
    const user = await prisma.userProfile.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o campus existe
    const campus = await prisma.campus.findUnique({
      where: { id: campusId },
    });

    if (!campus) {
      return NextResponse.json(
        { error: "Campus não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se já existe
    const existingMember = await prisma.campusMember.findUnique({
      where: {
        userId_campusId: {
          userId,
          campusId,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "Usuário já é membro deste campus" },
        { status: 400 }
      );
    }

    const newMember = await prisma.campusMember.create({
      data: {
        userId,
        campusId,
      },
      include: {
        user: true,
        campus: true,
      },
    });

    return NextResponse.json(newMember, { status: 201 });
  } catch (error) {
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
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const campusId = searchParams.get("campusId");

    if (!userId || !campusId) {
      return NextResponse.json(
        { error: "ID do usuário e ID do campus são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o membro existe
    const existingMember = await prisma.campusMember.findUnique({
      where: {
        userId_campusId: {
          userId,
          campusId,
        },
      },
    });

    if (!existingMember) {
      return NextResponse.json(
        { error: "Membro do campus não encontrado" },
        { status: 404 }
      );
    }

    // Remover o membro
    await prisma.campusMember.delete({
      where: {
        userId_campusId: {
          userId,
          campusId,
        },
      },
    });

    return NextResponse.json(
      { message: "Membro removido do campus com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
