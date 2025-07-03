import { withPermissions } from "@/lib/permissions/middleware";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/user:
 *   get:
 *     tags:
 *       - Users
 *     summary: Listar todos os usuários ou buscar por ID
 *     description: Retorna uma lista de todos os usuários ou um usuário específico se o ID for fornecido
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         description: ID do usuário específico para buscar
 *         example: user-uuid-1
 *     responses:
 *       200:
 *         description: Lista de usuários ou usuário específico
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 - $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     tags:
 *       - Users
 *     summary: Criar novo usuário
 *     description: Cria um novo usuário no sistema
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome completo do usuário
 *                 example: João Silva
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email do usuário
 *                 example: joao.silva@example.com
 *               description:
 *                 type: string
 *                 description: Descrição/cargo do usuário
 *                 example: Analista de Sistemas
 *               avatar:
 *                 type: string
 *                 format: uri
 *                 description: URL do avatar do usuário
 *                 example: https://example.com/avatar.jpg
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     tags:
 *       - Users
 *     summary: Atualizar usuário existente
 *     description: Atualiza um usuário existente no sistema
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 description: ID do usuário a ser atualizado
 *                 example: user-uuid-1
 *               name:
 *                 type: string
 *                 description: Nome completo do usuário
 *                 example: João Silva Santos
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email do usuário
 *                 example: joao.santos@example.com
 *               description:
 *                 type: string
 *                 description: Descrição/cargo do usuário
 *                 example: Coordenador de TI
 *               avatar:
 *                 type: string
 *                 format: uri
 *                 description: URL do avatar do usuário
 *                 example: https://example.com/new-avatar.jpg
 *               active:
 *                 type: boolean
 *                 description: Status ativo do usuário
 *                 example: true
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     tags:
 *       - Users
 *     summary: Deletar usuário
 *     description: Remove um usuário do sistema
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário a ser deletado
 *         example: user-uuid-1
 *     responses:
 *       200:
 *         description: Usuário deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuário deletado com sucesso
 *       400:
 *         description: ID obrigatório
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

export async function GET(request: NextRequest) {
  // Verificar permissões usando CASL
  const permissionResult = await withPermissions(request, [
    { action: "read", subject: "User" },
  ]);

  if (!permissionResult.success) {
    return NextResponse.json(
      { error: permissionResult.error },
      { status: permissionResult.status }
    );
  }

  const { user: currentUser } = permissionResult;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const user = await prisma.userProfile.findUnique({
        where: { id },
        include: {
          campusMembers: {
            include: {
              campus: true,
            },
          },
          commissionMembers: {
            include: {
              commission: {
                include: {
                  campus: true,
                },
              },
            },
          },
          organizationMembers: {
            include: {
              organization: true,
            },
          },
        },
      });

      if (!user) {
        return NextResponse.json(
          { error: "Usuário não encontrado" },
          { status: 404 }
        );
      }

      // Verificar se pode acessar este usuário específico
      if (!currentUser.ability.can("read", "User")) {
        return NextResponse.json(
          { error: "Sem permissão para acessar este usuário" },
          { status: 403 }
        );
      }

      return NextResponse.json(user);
    }

    // Buscar usuários que o usuário atual pode visualizar
    const users = await prisma.userProfile.findMany({
      include: {
        campusMembers: {
          include: {
            campus: true,
          },
        },
        commissionMembers: {
          include: {
            commission: {
              include: {
                campus: true,
              },
            },
          },
        },
        organizationMembers: {
          include: {
            organization: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Filtrar usuários baseado nas permissões
    const filteredUsers = users.filter((user) =>
      currentUser.ability.can("read", "User")
    );

    console.log(filteredUsers);

    return NextResponse.json(filteredUsers);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Verificar permissões usando CASL
  const permissionResult = await withPermissions(request, [
    { action: "create", subject: "User" },
  ]);

  if (!permissionResult.success) {
    return NextResponse.json(
      { error: permissionResult.error },
      { status: permissionResult.status }
    );
  }

  const { user: currentUser } = permissionResult;

  try {
    const body = await request.json();
    const {
      name,
      email,
      description,
      avatar,
      organizationId,
      campusId,
      organizationRole = "member",
      role = "member",
    } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Nome e email são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se já existe um usuário com este email
    const existingUser = await prisma.userProfile.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Já existe um usuário com este email" },
        { status: 409 }
      );
    }

    // Gerar senha temporária para o usuário
    const tempPassword = `kde${Math.random().toString(36).slice(-6)}!`;
    console.log("Senha temporária gerada:", tempPassword);

    // Criar cliente admin do Supabase
    const supabaseAdmin = createSupabaseAdmin();

    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          name: name,
          role: "user", // Todos os usuários criados pela interface são usuários normais
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

    // Permitir apenas admin global criar admin global, admin criar admin/member, member só member
    let allowedRoles: ("admin global" | "admin" | "member")[] = ["member"];
    if (currentUser.role === "admin global") {
      allowedRoles = ["admin global", "admin", "member"];
    } else if (currentUser.role === "admin") {
      allowedRoles = ["admin", "member"];
    }
    const finalRole = allowedRoles.includes(role) ? role : "member";

    // Usar transação para criar tudo de uma vez
    const result = await prisma.$transaction(async (tx) => {
      // 1. Criar perfil do usuário
      const newUser = await tx.userProfile.create({
        data: {
          id: authData.user.id,
          name,
          email,
          role: finalRole, // Papel do sistema
          description: description || "",
          avatar: avatar || "",
          active: true,
        },
      });

      // 2. Criar entrada na tabela AllowedUser
      await tx.allowedUser.create({
        data: {
          name,
          email,
          status: true,
        },
      });

      // 3. Adicionar usuário à organização (obrigatório)
      if (organizationId) {
        await tx.organizationMember.create({
          data: {
            userId: newUser.id,
            organizationId,
            role: organizationRole, // "admin" ou "member"
          },
        });
      }

      // 4. Se campusId foi fornecido, adicionar ao campus (opcional)
      if (campusId) {
        await tx.campusMember.create({
          data: {
            userId: newUser.id,
            campusId,
          },
        });
      }

      // 5. Buscar usuário criado com todas as relações
      const userWithRelations = await tx.userProfile.findUnique({
        where: { id: newUser.id },
        include: {
          organizationMembers: {
            include: {
              organization: true,
            },
          },
          campusMembers: {
            include: {
              campus: true,
            },
          },
          commissionMembers: {
            include: {
              commission: true,
            },
          },
        },
      });

      return { user: userWithRelations, tempPassword };
    });

    return NextResponse.json(
      {
        user: result.user,
        tempPassword: result.tempPassword,
        message: "Usuário criado com sucesso",
      },
      { status: 201 }
    );
  } catch (error) {
    // Se o erro for de unique constraint (usuário já existe no banco local OU Supabase), retorne erro amigável
    if (error instanceof Error && error.message.includes("unique constraint")) {
      return NextResponse.json(
        {
          error:
            "Já existe um usuário com este e-mail no sistema ou no Supabase.",
        },
        { status: 409 }
      );
    }
    // Se o erro for do Supabase de e-mail já registrado, retorne erro amigável
    if (
      error instanceof Error &&
      error.message.includes(
        "A user with this email address has already been registered"
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Já existe um usuário com este e-mail no Supabase. Use outro e-mail ou recupere o acesso.",
        },
        { status: 409 }
      );
    }
    // Caso contrário, erro genérico
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor ao criar usuário." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  // Verificar permissões usando CASL
  const permissionResult = await withPermissions(request, [
    { action: "update", subject: "User" },
  ]);

  if (!permissionResult.success) {
    return NextResponse.json(
      { error: permissionResult.error },
      { status: permissionResult.status }
    );
  }

  const { user: currentUser } = permissionResult;

  try {
    const body = await request.json();
    const {
      id,
      name,
      email,
      description,
      avatar,
      active,
      organizationId,
      campusId,
      organizationRole = "member",
    } = body;

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    // Verificar se o usuário existe
    const existingUser = await prisma.userProfile.findUnique({
      where: { id },
      include: {
        organizationMembers: {
          include: {
            organization: true,
          },
        },
        commissionMembers: {
          include: {
            commission: {
              include: {
                campus: true,
              },
            },
          },
        },
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se pode atualizar este usuário específico
    if (!currentUser.ability.can("update", "User")) {
      return NextResponse.json(
        { error: "Sem permissão para atualizar este usuário" },
        { status: 403 }
      );
    }

    // Se email for fornecido, verificar se não há conflito
    if (email && email !== existingUser.email) {
      const conflictingUser = await prisma.userProfile.findUnique({
        where: { email },
      });

      if (conflictingUser) {
        return NextResponse.json(
          { error: "Já existe um usuário com este email" },
          { status: 409 }
        );
      }
    }

    // Atualizar dados básicos do usuário
    const updatedUser = await prisma.userProfile.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(description !== undefined && { description }),
        ...(avatar !== undefined && { avatar }),
        ...(active !== undefined && { active }),
        updatedAt: new Date(),
      },
    });

    // Atualizar relações de organização se fornecidas
    if (organizationId) {
      // Remover relações antigas de organização
      await prisma.organizationMember.deleteMany({
        where: { userId: id },
      });

      // Criar nova relação de organização
      await prisma.organizationMember.create({
        data: {
          userId: id,
          organizationId,
          role: organizationRole,
        },
      });
    }

    // Atualizar relações de campus se fornecidas
    if (campusId) {
      // Remover relações antigas de campus
      await prisma.campusMember.deleteMany({
        where: { userId: id },
      });

      // Criar nova relação de campus
      await prisma.campusMember.create({
        data: {
          userId: id,
          campusId,
        },
      });
    } else if (organizationId) {
      // Se apenas organização foi fornecida (sem campus), remover relações de campus
      await prisma.campusMember.deleteMany({
        where: { userId: id },
      });
    }

    // Buscar o usuário atualizado com todas as relações
    const userWithRelations = await prisma.userProfile.findUnique({
      where: { id },
      include: {
        organizationMembers: {
          include: {
            organization: true,
          },
        },
        campusMembers: {
          include: {
            campus: true,
          },
        },
        commissionMembers: {
          include: {
            commission: true,
          },
        },
      },
    });

    return NextResponse.json(userWithRelations);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  // Verificar permissões usando CASL
  const permissionResult = await withPermissions(request, [
    { action: "delete", subject: "User" },
  ]);

  if (!permissionResult.success) {
    return NextResponse.json(
      { error: permissionResult.error },
      { status: permissionResult.status }
    );
  }

  const { user: currentUser } = permissionResult;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    // Verificar se o usuário existe
    const existingUser = await prisma.userProfile.findUnique({
      where: { id },
      include: {
        campusMembers: true,
        commissionMembers: true,
        organizationMembers: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se pode deletar este usuário específico
    if (!currentUser.ability.can("delete", "User")) {
      return NextResponse.json(
        { error: "Sem permissão para deletar este usuário" },
        { status: 403 }
      );
    }

    // Verificar se o usuário é admin global - não pode ser excluído
    const isGlobalAdmin = existingUser.role === "admin global";

    if (isGlobalAdmin) {
      return NextResponse.json(
        { error: "Usuários admin global não podem ser excluídos" },
        { status: 403 }
      );
    }

    console.log(`Iniciando exclusão em cascata do usuário ${id}`);

    // Usar uma transação para garantir que todas as operações sejam executadas
    await prisma.$transaction(async (tx) => {
      // 1. Deletar membros de campus
      if (existingUser.campusMembers.length > 0) {
        await tx.campusMember.deleteMany({
          where: { userId: id },
        });
        console.log(
          `Deletados ${existingUser.campusMembers.length} membros de campus`
        );
      }

      // 2. Deletar membros de comissão
      if (existingUser.commissionMembers.length > 0) {
        await tx.commissionMember.deleteMany({
          where: { userId: id },
        });
        console.log(
          `Deletados ${existingUser.commissionMembers.length} membros de comissão`
        );
      }

      // 3. Deletar membros de organização
      if (existingUser.organizationMembers.length > 0) {
        await tx.organizationMember.deleteMany({
          where: { userId: id },
        });
        console.log(
          `Deletados ${existingUser.organizationMembers.length} membros de organização`
        );
      }

      // 4. Deletar o usuário do perfil
      await tx.userProfile.delete({
        where: { id },
      });
      console.log(`Usuário ${id} deletado do banco de dados`);

      // 5. Deletar da tabela AllowedUser (whitelist) pelo e-mail
      await tx.allowedUser.deleteMany({
        where: { email: existingUser.email },
      });
      console.log(`AllowedUser com email ${existingUser.email} removido.`);
    });

    // 5. Deletar o usuário do Supabase Auth (opcional, dependendo do fluxo)
    try {
      const supabaseAdmin = createSupabaseAdmin();
      const { error: supabaseDeleteError } =
        await supabaseAdmin.auth.admin.deleteUser(id);
      if (supabaseDeleteError) {
        console.error(
          "Erro ao deletar usuário do Supabase Auth:",
          supabaseDeleteError
        );
        return NextResponse.json(
          {
            error: `Erro ao deletar usuário do Supabase Auth: ${supabaseDeleteError.message}`,
          },
          { status: 500 }
        );
      }
      console.log(`Usuário ${id} deletado do Supabase Auth`);
    } catch (supabaseError) {
      console.error(
        "Erro inesperado ao deletar usuário do Supabase Auth:",
        supabaseError
      );
      return NextResponse.json(
        {
          error: `Erro inesperado ao deletar usuário do Supabase Auth: ${
            supabaseError instanceof Error
              ? supabaseError.message
              : String(supabaseError)
          }`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Usuário e todas suas relações deletados com sucesso",
        deletedRelations: {
          campusMembers: existingUser.campusMembers.length,
          commissionMembers: existingUser.commissionMembers.length,
          organizationMembers: existingUser.organizationMembers.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
