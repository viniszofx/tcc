import { NextResponse } from "next/server";
import { data } from "../../../data";

// Simulando um banco de dados em memória
let commissionMembers = [...data.commissionMembers];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const commissionId = searchParams.get("commissionId");

    if (userId && commissionId) {
      const member = commissionMembers.find(
        (m) => m.userId === userId && m.commissionId === commissionId
      );
      if (!member) {
        return NextResponse.json(
          { error: "Membro da comissão não encontrado" },
          { status: 404 }
        );
      }
      return NextResponse.json(member);
    }

    if (userId) {
      const members = commissionMembers.filter((m) => m.userId === userId);
      return NextResponse.json(members);
    }

    if (commissionId) {
      const members = commissionMembers.filter(
        (m) => m.commissionId === commissionId
      );
      return NextResponse.json(members);
    }

    return NextResponse.json(commissionMembers);
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
    const { userId, commissionId, roleInCommission } = body;

    if (!userId || !commissionId) {
      return NextResponse.json(
        { error: "ID do usuário e ID da comissão são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se já existe
    const existingMember = commissionMembers.find(
      (m) => m.userId === userId && m.commissionId === commissionId
    );

    if (existingMember) {
      return NextResponse.json(
        { error: "Usuário já é membro desta comissão" },
        { status: 400 }
      );
    }

    const newMember = {
      userId,
      commissionId,
      roleInCommission: roleInCommission || "Membro",
    };

    commissionMembers.push(newMember);

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
    const { userId, commissionId, roleInCommission } = body;

    if (!userId || !commissionId) {
      return NextResponse.json(
        { error: "ID do usuário e ID da comissão são obrigatórios" },
        { status: 400 }
      );
    }

    const memberIndex = commissionMembers.findIndex(
      (m) => m.userId === userId && m.commissionId === commissionId
    );

    if (memberIndex === -1) {
      return NextResponse.json(
        { error: "Membro da comissão não encontrado" },
        { status: 404 }
      );
    }

    commissionMembers[memberIndex] = {
      ...commissionMembers[memberIndex],
      ...(roleInCommission && { roleInCommission }),
    };

    return NextResponse.json(commissionMembers[memberIndex]);
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
    const commissionId = searchParams.get("commissionId");

    if (!userId || !commissionId) {
      return NextResponse.json(
        { error: "ID do usuário e ID da comissão são obrigatórios" },
        { status: 400 }
      );
    }

    const memberIndex = commissionMembers.findIndex(
      (m) => m.userId === userId && m.commissionId === commissionId
    );

    if (memberIndex === -1) {
      return NextResponse.json(
        { error: "Membro da comissão não encontrado" },
        { status: 404 }
      );
    }

    commissionMembers.splice(memberIndex, 1);

    return NextResponse.json(
      { message: "Membro removido da comissão com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
