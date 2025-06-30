import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se o usuário está na lista de permitidos
    const allowedUser = await prisma.allowedUser.findUnique({
      where: { email },
    });

    if (!allowedUser) {
      return NextResponse.json(
        {
          error: "Usuário não autorizado",
          message:
            "Este email não está autorizado a acessar o sistema. Entre em contato com o administrador.",
        },
        { status: 403 }
      );
    }

    if (!allowedUser.status) {
      return NextResponse.json(
        {
          error: "Usuário inativo",
          message:
            "Sua conta foi desativada. Entre em contato com o administrador.",
        },
        { status: 403 }
      );
    }

    // Verificar se o usuário tem perfil criado
    const userProfile = await prisma.userProfile.findUnique({
      where: { email },
    });

    return NextResponse.json({
      isAllowed: true,
      hasProfile: !!userProfile,
      user: {
        name: allowedUser.name,
        email: allowedUser.email,
        profileExists: !!userProfile,
      },
    });
  } catch (error) {
    console.error("Erro ao validar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
