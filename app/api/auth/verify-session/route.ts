import { prisma } from "@/lib/prisma";
import { createSupabaseServer } from "@/lib/supabase-server";
import { checkRateLimit, sanitizeUserData } from "@/lib/validation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Rate limiting por IP
    const clientIP =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(`verify-session:${clientIP}`, 60, 60000)) {
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
        { error: "Sessão inválida ou expirada", authenticated: false },
        { status: 401 }
      );
    }

    // Verificar se o usuário ainda está autorizado
    const allowedUser = await prisma.allowedUser.findUnique({
      where: { email: user.email! },
    });

    if (!allowedUser || !allowedUser.status) {
      // Fazer logout se o usuário não estiver mais autorizado
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: "Usuário não autorizado", authenticated: false },
        { status: 403 }
      );
    }

    // Buscar perfil do usuário
    const userProfile = await prisma.userProfile.findUnique({
      where: { email: user.email! },
      include: {
        organizationMembers: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!userProfile) {
      return NextResponse.json(
        { error: "Perfil do usuário não encontrado", authenticated: false },
        { status: 404 }
      );
    }

    // Determinar role e organização
    let role = "member";
    let organization = null;
    let redirectPath = "/dashboard";

    if (
      userProfile.organizationMembers &&
      userProfile.organizationMembers.length > 0
    ) {
      // Verificar se é admin global primeiro
      const globalAdminMembership = userProfile.organizationMembers.find(
        (member) => member.role === "admin global"
      );
      
      if (globalAdminMembership) {
        role = "admin";
        redirectPath = "/application";
        organization = globalAdminMembership.organization;
      } else {
        const adminMembership = userProfile.organizationMembers.find(
          (member) => member.role === "admin"
        );

        if (adminMembership) {
          role = "admin";
          redirectPath = "/application";
          organization = adminMembership.organization;
        } else {
          const memberMembership = userProfile.organizationMembers[0];
          role = memberMembership.role;
          organization = memberMembership.organization;
        }
      }
    }

    const userData = {
      id: userProfile.id,
      name: userProfile.name,
      email: userProfile.email,
      role,
      organization,
      redirectPath,
    };

    const safeUserData = sanitizeUserData(userData);

    return NextResponse.json({
      authenticated: true,
      user: safeUserData,
      session: {
        expires_at: user.user_metadata?.exp || null,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error("Erro ao verificar sessão:", error);

    return NextResponse.json(
      { error: "Erro interno do servidor", authenticated: false },
      { status: 500 }
    );
  }
}
