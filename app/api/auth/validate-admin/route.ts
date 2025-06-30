import { prisma } from "@/lib/prisma";
import { createSupabaseServer } from "@/lib/supabase-server";
import { checkRateLimit } from "@/lib/validation";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting por IP
    const clientIP =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(`validate-admin:${clientIP}`, 20, 60000)) {
      return NextResponse.json(
        { error: "Muitas tentativas. Tente novamente em alguns minutos." },
        { status: 429 }
      );
    }

    // Verificar sessão do Supabase
    const supabase = await createSupabaseServer();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { error: "Não autenticado", isAdmin: false },
        { status: 401 }
      );
    }

    // Verificar se o usuário está autorizado
    const allowedUser = await prisma.allowedUser.findUnique({
      where: { email: user.email! },
    });

    if (!allowedUser || !allowedUser.status) {
      return NextResponse.json(
        { error: "Usuário não autorizado", isAdmin: false },
        { status: 403 }
      );
    }

    // Verificar se o usuário é admin
    const userProfile = await prisma.userProfile.findUnique({
      where: { email: user.email! },
      include: {
        organizationMembers: true,
      },
    });

    if (!userProfile) {
      return NextResponse.json(
        { error: "Perfil do usuário não encontrado", isAdmin: false },
        { status: 404 }
      );
    }

    const isAdmin = userProfile.organizationMembers.some(
      (member) => member.role === "admin"
    );

    if (!isAdmin) {
      return NextResponse.json(
        {
          error: "Acesso negado. Privilégios de administrador necessários.",
          isAdmin: false,
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      isAdmin: true,
      user: {
        id: userProfile.id,
        name: userProfile.name,
        email: userProfile.email,
      },
      message: "Acesso administrativo autorizado",
    });
  } catch (error) {
    console.error("Erro ao validar admin:", error);

    return NextResponse.json(
      { error: "Erro interno do servidor", isAdmin: false },
      { status: 500 }
    );
  }
}
