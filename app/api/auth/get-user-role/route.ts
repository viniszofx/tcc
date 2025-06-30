import { prisma } from "@/lib/prisma";
import { createSupabaseServer } from "@/lib/supabase-server";
import {
  checkRateLimit,
  emailSchema,
  sanitizeUserData,
  validateApiInput,
} from "@/lib/validation";
import { NextRequest, NextResponse } from "next/server";

// GET - Buscar role do usuário autenticado via sessão
export async function GET(request: NextRequest) {
  try {
    // Rate limiting por IP
    const clientIP =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(`get-user-role-session:${clientIP}`, 100, 60000)) {
      return NextResponse.json(
        { error: "Muitas tentativas. Tente novamente em alguns minutos." },
        { status: 429 }
      );
    }

    // Verificar autenticação via Supabase
    const supabase = await createSupabaseServer();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user?.email) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const email = session.user.email;

    // Verificar se o usuário está autorizado a acessar o sistema
    const allowedUser = await prisma.allowedUser.findUnique({
      where: { email },
    });

    if (!allowedUser || !allowedUser.status) {
      return NextResponse.json(
        { error: "Usuário não autorizado" },
        { status: 403 }
      );
    }

    // Buscar o usuário e suas roles
    const userProfile = await prisma.userProfile.findUnique({
      where: { email },
      include: {
        organizationMembers: {
          include: {
            organization: true,
          },
        },
        commissionMembers: {
          include: {
            commission: true,
          },
        },
      },
    });

    if (!userProfile) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Determinar a role principal e o redirecionamento
    let role = "member";
    let redirectPath = "/dashboard";
    let organization = null;
    let isPresident = false;

    // Verificar se é admin de alguma organização
    if (
      userProfile.organizationMembers &&
      userProfile.organizationMembers.length > 0
    ) {
      const adminMembership = userProfile.organizationMembers.find(
        (member) => member.role === "admin"
      );

      if (adminMembership) {
        role = "admin";
        redirectPath = "/admin";
        organization = adminMembership.organization;
      } else {
        const memberMembership = userProfile.organizationMembers[0];
        role = memberMembership.role;
        organization = memberMembership.organization;
      }
    }

    // Verificar se é presidente de alguma comissão
    if (
      userProfile.commissionMembers &&
      userProfile.commissionMembers.length > 0
    ) {
      const presidentMembership = userProfile.commissionMembers.find(
        (member) => member.roleInCommission === "Presidente"
      );

      if (presidentMembership) {
        isPresident = true;
        if (role === "member") {
          role = "presidente";
        }
      }
    }

    // Sanitizar e estruturar dados do usuário
    const userData = {
      id: userProfile.id,
      name: userProfile.name,
      email: userProfile.email,
      role,
      isPresident,
      organization,
      redirectPath,
    };

    // Sanitizar dados antes de enviar ao cliente
    const safeUserData = sanitizeUserData(userData);

    return NextResponse.json({
      user: safeUserData,
      role, // Adicionar role também no nível raiz para compatibilidade
      isPresident,
    });
  } catch (error) {
    console.error("Erro ao buscar role do usuário via sessão:", error);

    // Não expor detalhes do erro para o cliente
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Buscar role do usuário por email (manter compatibilidade)
export async function POST(request: NextRequest) {
  try {
    // Rate limiting por IP
    const clientIP =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(`get-user-role:${clientIP}`, 50, 60000)) {
      return NextResponse.json(
        { error: "Muitas tentativas. Tente novamente em alguns minutos." },
        { status: 429 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      return NextResponse.json(
        { error: "JSON inválido no corpo da requisição" },
        { status: 400 }
      );
    }

    // Verificar se o body tem a estrutura esperada
    if (!body || typeof body !== "object" || !body.email) {
      return NextResponse.json(
        { error: "Email é obrigatório no corpo da requisição" },
        { status: 400 }
      );
    }

    // Validar entrada
    const validation = validateApiInput(emailSchema, body.email);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const email = validation.data;

    // Verificar se o usuário está autorizado a acessar o sistema
    const allowedUser = await prisma.allowedUser.findUnique({
      where: { email },
    });

    if (!allowedUser || !allowedUser.status) {
      return NextResponse.json(
        { error: "Usuário não autorizado" },
        { status: 403 }
      );
    }

    // Buscar o usuário e suas roles
    const userProfile = await prisma.userProfile.findUnique({
      where: { email },
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
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Determinar a role principal e o redirecionamento
    let role = "member";
    let redirectPath = "/dashboard";
    let organization = null;

    if (
      userProfile.organizationMembers &&
      userProfile.organizationMembers.length > 0
    ) {
      // Se o usuário tem múltiplas organizações, pegar a primeira onde ele é admin
      const adminMembership = userProfile.organizationMembers.find(
        (member) => member.role === "admin"
      );

      if (adminMembership) {
        role = "admin";
        redirectPath = "/admin";
        organization = adminMembership.organization;
      } else {
        // Se não é admin, pegar a primeira organização onde é member
        const memberMembership = userProfile.organizationMembers[0];
        role = memberMembership.role;
        organization = memberMembership.organization;
      }
    }

    // Sanitizar e estruturar dados do usuário
    const userData = {
      id: userProfile.id,
      name: userProfile.name,
      email: userProfile.email,
      role,
      organization,
      redirectPath,
    };

    // Sanitizar dados antes de enviar ao cliente
    const safeUserData = sanitizeUserData(userData);

    return NextResponse.json({
      user: safeUserData,
      role, // Adicionar role também no nível raiz para compatibilidade
    });
  } catch (error) {
    console.error("Erro ao buscar role do usuário:", error);

    // Não expor detalhes do erro para o cliente
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
