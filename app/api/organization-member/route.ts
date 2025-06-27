import { NextResponse } from "next/server";
import { data } from "../../../data";

// Simulando um banco de dados em memória
let organizationMembers = [...data.organizationMembers];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const organizationId = searchParams.get("organizationId");

    if (userId && organizationId) {
      const member = organizationMembers.find(
        (m) => m.userId === userId && m.organizationId === organizationId
      );
      if (!member) {
        return NextResponse.json(
          { error: "Membro da organização não encontrado" },
          { status: 404 }
        );
      }
      return NextResponse.json(member);
    }

    if (userId) {
      const members = organizationMembers.filter((m) => m.userId === userId);
      return NextResponse.json(members);
    }

    if (organizationId) {
      const members = organizationMembers.filter(
        (m) => m.organizationId === organizationId
      );
      return NextResponse.json(members);
    }

    return NextResponse.json(organizationMembers);
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
    const existingMember = organizationMembers.find(
      (m) => m.userId === userId && m.organizationId === organizationId
    );

    if (existingMember) {
      return NextResponse.json(
        { error: "Usuário já é membro desta organização" },
        { status: 400 }
      );
    }

    const newMember = {
      userId,
      organizationId,
      role: role || "member",
    };

    organizationMembers.push(newMember);

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

    const memberIndex = organizationMembers.findIndex(
      (m) => m.userId === userId && m.organizationId === organizationId
    );

    if (memberIndex === -1) {
      return NextResponse.json(
        { error: "Membro da organização não encontrado" },
        { status: 404 }
      );
    }

    organizationMembers[memberIndex] = {
      ...organizationMembers[memberIndex],
      ...(role && { role }),
    };

    return NextResponse.json(organizationMembers[memberIndex]);
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

    const memberIndex = organizationMembers.findIndex(
      (m) => m.userId === userId && m.organizationId === organizationId
    );

    if (memberIndex === -1) {
      return NextResponse.json(
        { error: "Membro da organização não encontrado" },
        { status: 404 }
      );
    }

    organizationMembers.splice(memberIndex, 1);

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
