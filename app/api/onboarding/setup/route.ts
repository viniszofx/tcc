import { prisma } from "@/lib/prisma";
import { createSupabaseAdmin } from "@/lib/supabase";
import {
  checkRateLimit,
  setupSchema,
  validateApiInput,
} from "@/lib/validation";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let body: any;

  try {
    // Rate limiting por IP - mais restritivo para setup
    const clientIP =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(`setup:${clientIP}`, 3, 300000)) {
      // 3 tentativas por 5 minutos
      return NextResponse.json(
        {
          error:
            "Muitas tentativas de setup. Tente novamente em alguns minutos.",
        },
        { status: 429 }
      );
    }

    body = await request.json();

    // Validar entrada com schema
    const validation = validateApiInput(setupSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { organization, campus, admin } = validation.data!;

    // Verificar se já existe um usuário com este email
    const existingUser = await prisma.userProfile.findUnique({
      where: { email: admin.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Já existe um usuário com este email" },
        { status: 409 }
      );
    }

    // Gerar senha temporária para o administrador
    const tempPassword = `Admin${Math.random().toString(36).slice(-6)}!`;

    // Criar cliente admin do Supabase
    const supabaseAdmin = createSupabaseAdmin();

    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: admin.email,
        password: tempPassword,
        email_confirm: true, // Pular verificação de email já que é o admin
        user_metadata: {
          name: admin.name,
          role: "admin",
        },
      });

    if (authError) {
      return NextResponse.json(
        { error: `Erro ao criar usuário no Supabase: ${authError.message}` },
        { status: 500 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Falha ao criar usuário no Supabase" },
        { status: 500 }
      );
    }

    // Usar transação para criar tudo de uma vez de forma atômica
    const result = await prisma.$transaction(async (tx) => {
      // 1. Criar organização
      const newOrganization = await tx.organization.create({
        data: {
          name: organization.name,
          shortName: organization.shortName,
          active: true,
        },
      });

      // 2. Criar campus vinculado à organização
      const newCampus = await tx.campus.create({
        data: {
          organizationId: newOrganization.id,
          name: campus.name,
          code: campus.code,
          active: true,
        },
      });

      // 3. Criar perfil do usuário administrador usando o ID do Supabase
      const newAdmin = await tx.userProfile.create({
        data: {
          id: authData.user.id, // Usar o mesmo ID do Supabase Auth
          name: admin.name,
          email: admin.email,
          description:
            "Administrador do sistema - Criado durante setup inicial",
          avatar: "",
          active: true,
        },
      });

      // 4. Vincular o administrador à organização como admin
      await tx.organizationMember.create({
        data: {
          userId: newAdmin.id,
          organizationId: newOrganization.id,
          role: "admin", // Role de administrador da organização
        },
      });

      // 5. Vincular o administrador ao campus
      await tx.campusMember.create({
        data: {
          userId: newAdmin.id,
          campusId: newCampus.id,
        },
      });

      // 6. Adicionar usuário à tabela de usuários permitidos (whitelist)
      await tx.allowedUser.create({
        data: {
          email: admin.email,
          name: admin.name,
          status: true, // Ativo para acesso ao sistema
        },
      });

      return {
        organization: newOrganization,
        campus: newCampus,
        admin: newAdmin,
        tempPassword,
      };
    });

    return NextResponse.json(
      {
        message: "Setup concluído com sucesso",
        data: {
          organization: {
            id: result.organization.id,
            name: result.organization.name,
            shortName: result.organization.shortName,
          },
          campus: {
            id: result.campus.id,
            name: result.campus.name,
            code: result.campus.code,
            organizationId: result.campus.organizationId,
          },
          admin: {
            id: result.admin.id,
            name: result.admin.name,
            email: result.admin.email,
            organizationRole: "admin",
            isAllowedUser: true,
          },
          tempPassword: result.tempPassword,
          summary: {
            userCreatedInSupabase: true,
            userProfileCreated: true,
            organizationMembershipCreated: true,
            campusMembershipCreated: true,
            addedToAllowedUsers: true,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro no setup:", error);

    // Se houve erro, tentar limpar o usuário do Supabase se foi criado
    try {
      if (body?.admin?.email) {
        const supabaseAdmin = createSupabaseAdmin();
        const { data: users } = await supabaseAdmin.auth.admin.listUsers();
        const user = users.users.find((u: any) => u.email === body.admin.email);
        if (user) {
          await supabaseAdmin.auth.admin.deleteUser(user.id);
        }
      }
    } catch (cleanupError) {
      console.error("Erro ao limpar usuário do Supabase:", cleanupError);
    }

    // Não expor detalhes do erro para o cliente
    return NextResponse.json(
      { error: "Erro interno do servidor durante o setup" },
      { status: 500 }
    );
  }
}
