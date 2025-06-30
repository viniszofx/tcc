import { prisma } from "@/lib/prisma";
import { createSupabaseServer } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function checkAuth(request: NextRequest) {
  const token = request.cookies.get("sb-access-token")?.value;

  if (!token) {
    return null;
  }

  try {
    const supabase = await createSupabaseServer();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Erro ao verificar autenticação:", error);
    return null;
  }
}

export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: any) => Promise<NextResponse>
) {
  try {
    const supabase = await createSupabaseServer();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Verificar se o usuário ainda está autorizado
    const allowedUser = await prisma.allowedUser.findUnique({
      where: { email: user.email! },
    });

    if (!allowedUser || !allowedUser.status) {
      return NextResponse.json(
        { error: "Usuário não autorizado" },
        { status: 403 }
      );
    }

    return handler(request, user);
  } catch (error) {
    console.error("Erro na autenticação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function withAdminAuth(
  request: NextRequest,
  handler: (
    request: NextRequest,
    user: any,
    userProfile: any
  ) => Promise<NextResponse>
) {
  try {
    const supabase = await createSupabaseServer();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Verificar se o usuário ainda está autorizado
    const allowedUser = await prisma.allowedUser.findUnique({
      where: { email: user.email! },
    });

    if (!allowedUser || !allowedUser.status) {
      return NextResponse.json(
        { error: "Usuário não autorizado" },
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
        { error: "Perfil do usuário não encontrado" },
        { status: 404 }
      );
    }

    const isAdmin = userProfile.organizationMembers.some(
      (member) => member.role === "admin"
    );

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Acesso negado. Privilégios de administrador necessários." },
        { status: 403 }
      );
    }

    return handler(request, user, userProfile);
  } catch (error) {
    console.error("Erro na autenticação admin:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
