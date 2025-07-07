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
    const id = searchParams.get("id");

    if (id) {
      const allowedUser = await prisma.allowedUser.findUnique({
        where: { id },
      });

      if (!allowedUser) {
        return NextResponse.json(
          { error: "Usuário permitido não encontrado" },
          { status: 404 }
        );
      }
      return NextResponse.json(allowedUser);
    }

    const allowedUsers = await prisma.allowedUser.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(allowedUsers);
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
    const { name, email, status } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Nome e email são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se já existe um usuário com este email
    const existingUser = await prisma.allowedUser.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Já existe um usuário com este email" },
        { status: 409 }
      );
    }

    const newAllowedUser = await prisma.allowedUser.create({
      data: {
        name,
        email,
        status: status !== undefined ? status : true,
      },
    });

    return NextResponse.json(newAllowedUser, { status: 201 });
  } catch (error) {
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
  try {
    const body = await request.json();
    const { id, name, email, status } = body;

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    // Verificar se o usuário existe
    const existingUser = await prisma.allowedUser.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Usuário permitido não encontrado" },
        { status: 404 }
      );
    }

    // Se email for fornecido, verificar se não há conflito
    if (email && email !== existingUser.email) {
      const conflictingUser = await prisma.allowedUser.findUnique({
        where: { email },
      });

      if (conflictingUser) {
        return NextResponse.json(
          { error: "Já existe um usuário com este email" },
          { status: 409 }
        );
      }
    }

    const updatedUser = await prisma.allowedUser.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(status !== undefined && { status }),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedUser);
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
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    // Verificar se o usuário existe
    const existingUser = await prisma.allowedUser.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Usuário permitido não encontrado" },
        { status: 404 }
      );
    }

    // Deletar o usuário
    await prisma.allowedUser.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Usuário permitido deletado com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
