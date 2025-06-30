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
    const { name, email, description, avatar } = body;

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

    // Gerar senha temporária para o administrador
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
          role: "member",
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

    const newUser = await prisma.userProfile.create({
      data: {
        id: authData.user.id,
        name,
        email,
        description: description || "",
        avatar: avatar || "",
        active: true,
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

    return NextResponse.json(newUser, { status: 201 });
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
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Deletar o usuário
    await prisma.userProfile.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Usuário deletado com sucesso" },
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
