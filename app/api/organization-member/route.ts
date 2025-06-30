import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const organizationId = searchParams.get("organizationId");

    if (userId && organizationId) {
      const member = await prisma.organizationMember.findUnique({
        where: {
          userId_organizationId: {
            userId,
            organizationId,
          },
        },
        include: {
          user: true,
          organization: true,
        },
      });

      if (!member) {
        return NextResponse.json(
          { error: "Membro da organização não encontrado" },
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

    if (organizationId) {
      where.organizationId = organizationId;
    }

    const members = await prisma.organizationMember.findMany({
      where,
      include: {
        user: true,
        organization: true,
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, organizationId, role } = body;

    if (!userId || !organizationId) {
      return NextResponse.json(
        { error: "ID do usuário e ID da organização são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se já existe
    const existingMember = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "Usuário já é membro desta organização" },
        { status: 400 }
      );
    }

    const newMember = await prisma.organizationMember.create({
      data: {
        userId,
        organizationId,
        role: role || "member",
      },
      include: {
        user: true,
        organization: true,
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

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { userId, organizationId, role } = body;

    if (!userId || !organizationId) {
      return NextResponse.json(
        { error: "ID do usuário e ID da organização são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o membro existe
    const existingMember = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });

    if (!existingMember) {
      return NextResponse.json(
        { error: "Membro da organização não encontrado" },
        { status: 404 }
      );
    }

    const updatedMember = await prisma.organizationMember.update({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
      data: {
        ...(role && { role }),
        updatedAt: new Date(),
      },
      include: {
        user: true,
        organization: true,
      },
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const organizationId = searchParams.get("organizationId");

    if (!userId || !organizationId) {
      return NextResponse.json(
        { error: "ID do usuário e ID da organização são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o membro existe
    const existingMember = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });

    if (!existingMember) {
      return NextResponse.json(
        { error: "Membro da organização não encontrado" },
        { status: 404 }
      );
    }

    // Remover o membro
    await prisma.organizationMember.delete({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });

    return NextResponse.json(
      { message: "Membro removido da organização com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
