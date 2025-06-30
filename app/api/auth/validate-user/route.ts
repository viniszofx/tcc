import { prisma } from "@/lib/prisma";
import {
  checkRateLimit,
  emailSchema,
  validateApiInput,
} from "@/lib/validation";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Rate limiting por IP
    const clientIP =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(`validate-user:${clientIP}`, 20, 60000)) {
      return NextResponse.json(
        { error: "Muitas tentativas. Tente novamente em alguns minutos." },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validar entrada
    const validation = validateApiInput(emailSchema, body.email);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const email = validation.data;

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

    // Não expor detalhes do erro para o cliente
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
