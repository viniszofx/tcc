import { prisma } from "@/lib/prisma";
import { createSupabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

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

export async function GET(request: Request) {
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
        },
      });

      if (!user) {
        return NextResponse.json(
          { error: "Usuário não encontrado" },
          { status: 404 }
        );
      }
      return NextResponse.json(user);
    }

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
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(users);
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
    const {
      name,
      email,
      description,
      avatar,
      campusId,
      organizationRole = "member",
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

    // Usar transação para criar tudo de uma vez
    const result = await prisma.$transaction(async (tx) => {
      // 1. Criar perfil do usuário
      const newUser = await tx.userProfile.create({
        data: {
          id: authData.user.id,
          name,
          email,
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

      // 3. Se campusId foi fornecido, buscar informações do campus e organização
      if (campusId) {
        const campus = await tx.campus.findUnique({
          where: { id: campusId },
          include: { organization: true },
        });

        if (campus) {
          // 4. Criar membro da organização
          await tx.organizationMember.create({
            data: {
              userId: newUser.id,
              organizationId: campus.organizationId,
              role: organizationRole, // "admin" ou "member"
            },
          });

          // 5. Criar membro do campus
          await tx.campusMember.create({
            data: {
              userId: newUser.id,
              campusId: campus.id,
            },
          });
        }
      }

      // 6. Buscar usuário criado com todas as relações
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
    let body: any = undefined;
    try {
      // Tentar limpar usuário do Supabase se o email já foi criado
      if (request) {
        body = await request.json().catch(() => undefined);
      }
      if (body?.email) {
        const supabaseAdmin = createSupabaseAdmin();
        const { data: users } = await supabaseAdmin.auth.admin.listUsers();
        const user = users.users.find((u: any) => u.email === body.email);
        if (user) {
          await supabaseAdmin.auth.admin.deleteUser(user.id);
        }
      }
    } catch (cleanupError) {
      console.error("Erro ao limpar usuário do Supabase:", cleanupError);
    }
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, email, description, avatar, active } = body;

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    // Verificar se o usuário existe
    const existingUser = await prisma.userProfile.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
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

    return NextResponse.json(updatedUser);
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
    });

    // 5. Deletar o usuário do Supabase Auth (opcional, dependendo do fluxo)
    try {
      const supabaseAdmin = createSupabaseAdmin();
      await supabaseAdmin.auth.admin.deleteUser(id);
      console.log(`Usuário ${id} deletado do Supabase Auth`);
    } catch (supabaseError) {
      console.warn(
        "Erro ao deletar usuário do Supabase Auth (pode não existir):",
        supabaseError
      );
      // Não falhar a operação se o usuário não existir no Supabase
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
