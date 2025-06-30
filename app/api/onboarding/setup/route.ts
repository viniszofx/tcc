import { prisma } from "@/lib/prisma";
import { createSupabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let body: any;

  try {
    body = await request.json();
    const { organization, campus, admin } = body;

    // Validar dados obrigatórios
    if (!organization?.name || !organization?.shortName) {
      return NextResponse.json(
        { error: "Nome e nome curto da organização são obrigatórios" },
        { status: 400 }
      );
    }

    if (!campus?.name || !campus?.code) {
      return NextResponse.json(
        { error: "Nome e código do campus são obrigatórios" },
        { status: 400 }
      );
    }

    if (!admin?.name || !admin?.email) {
      return NextResponse.json(
        { error: "Nome e email do administrador são obrigatórios" },
        { status: 400 }
      );
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(admin.email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

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

    return NextResponse.json(
      { error: "Erro interno do servidor durante o setup" },
      { status: 500 }
    );
  }
}
