import { NextResponse } from "next/server";
import { data } from "../../../data";

// Simulando um banco de dados em memória
let campusMembers = [...data.campusMembers];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const campusId = searchParams.get("campusId");

    if (userId && campusId) {
      const member = campusMembers.find(
        (m) => m.userId === userId && m.campusId === campusId
      );
      if (!member) {
        return NextResponse.json(
          { error: "Membro do campus não encontrado" },
          { status: 404 }
        );
      }
      return NextResponse.json(member);
    }

    if (userId) {
      const members = campusMembers.filter((m) => m.userId === userId);
      return NextResponse.json(members);
    }

    if (campusId) {
      const members = campusMembers.filter((m) => m.campusId === campusId);
      return NextResponse.json(members);
    }

    return NextResponse.json(campusMembers);
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
    const { userId, campusId } = body;

    if (!userId || !campusId) {
      return NextResponse.json(
        { error: "ID do usuário e ID do campus são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se já existe
    const existingMember = campusMembers.find(
      (m) => m.userId === userId && m.campusId === campusId
    );

    if (existingMember) {
      return NextResponse.json(
        { error: "Usuário já é membro deste campus" },
        { status: 400 }
      );
    }

    const newMember = {
      userId,
      campusId,
    };

    campusMembers.push(newMember);

    return NextResponse.json(newMember, { status: 201 });
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
    const campusId = searchParams.get("campusId");

    if (!userId || !campusId) {
      return NextResponse.json(
        { error: "ID do usuário e ID do campus são obrigatórios" },
        { status: 400 }
      );
    }

    const memberIndex = campusMembers.findIndex(
      (m) => m.userId === userId && m.campusId === campusId
    );

    if (memberIndex === -1) {
      return NextResponse.json(
        { error: "Membro do campus não encontrado" },
        { status: 404 }
      );
    }

    campusMembers.splice(memberIndex, 1);

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
