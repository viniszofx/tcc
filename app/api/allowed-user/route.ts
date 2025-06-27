import { NextResponse } from "next/server";
import { data } from "../../../data";

// Simulando um banco de dados em memória
let allowedUsers = [...data.allowedUsers];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const allowedUser = allowedUsers.find((u) => u.id === id);
      if (!allowedUser) {
        return NextResponse.json(
          { error: "Usuário permitido não encontrado" },
          { status: 404 }
        );
      }
      return NextResponse.json(allowedUser);
    }

    return NextResponse.json(allowedUsers);
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
    const { name, email, status } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Nome e email são obrigatórios" },
        { status: 400 }
      );
    }

    const newAllowedUser = {
      id: `allowed-user-uuid-${Date.now()}`,
      name,
      email,
      status: status || "ativo",
    };

    allowedUsers.push(newAllowedUser);

    return NextResponse.json(newAllowedUser, { status: 201 });
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
    const { id, name, email, status } = body;

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    const userIndex = allowedUsers.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      return NextResponse.json(
        { error: "Usuário permitido não encontrado" },
        { status: 404 }
      );
    }

    allowedUsers[userIndex] = {
      ...allowedUsers[userIndex],
      ...(name && { name }),
      ...(email && { email }),
      ...(status && { status }),
    };

    return NextResponse.json(allowedUsers[userIndex]);
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
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    const userIndex = allowedUsers.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      return NextResponse.json(
        { error: "Usuário permitido não encontrado" },
        { status: 404 }
      );
    }

    allowedUsers.splice(userIndex, 1);

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
