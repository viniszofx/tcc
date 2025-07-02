import { withAdminAuth } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import {
  checkRateLimit,
  sanitizeUserData,
  userDataSchema,
  validateApiInput,
} from "@/lib/validation";
import { NextRequest, NextResponse } from "next/server";

// GET /api/user - Listar usuários (apenas admin)
export async function GET(request: NextRequest) {
  return withAdminAuth(request, async (req, user, userProfile) => {
    try {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get("id");
      const organizationId = searchParams.get("organizationId");

      // Rate limiting
      const clientIP = req.headers.get("x-forwarded-for") || "unknown";
      if (!checkRateLimit(`get-users:${clientIP}`, 30, 60000)) {
        return NextResponse.json(
          { error: "Muitas tentativas" },
          { status: 429 }
        );
      }

      // Se ID específico foi solicitado
      if (id) {
        const userToFind = await prisma.userProfile.findUnique({
          where: { id },
          include: {
            organizationMembers: {
              include: {
                organization: true,
              },
            },
          },
        });

        if (!userToFind) {
          return NextResponse.json(
            { error: "Usuário não encontrado" },
            { status: 404 }
          );
        }

        // Verificar se o admin tem permissão para ver este usuário
        const adminOrganizations = userProfile.organizationMembers.map(
          (om: any) => om.organizationId
        );
        const userOrganizations = userToFind.organizationMembers.map(
          (om: any) => om.organizationId
        );

        const hasPermission = adminOrganizations.some((orgId: string) =>
          userOrganizations.includes(orgId)
        );

        if (!hasPermission) {
          return NextResponse.json(
            { error: "Sem permissão para visualizar este usuário" },
            { status: 403 }
          );
        }

        const safeUserData = sanitizeUserData({
          ...userToFind,
          role: userToFind.organizationMembers[0]?.role || "member",
          organization: userToFind.organizationMembers[0]?.organization,
          redirectPath: "/application",
        });

        return NextResponse.json(safeUserData);
      }

      // Listar usuários da organização do admin
      const adminOrgIds = userProfile.organizationMembers.map(
        (om: any) => om.organizationId
      );

      let whereClause: any = {
        organizationMembers: {
          some: {
            organizationId: {
              in: adminOrgIds,
            },
          },
        },
      };

      // Filtrar por organização específica se solicitado
      if (organizationId && adminOrgIds.includes(organizationId)) {
        whereClause = {
          organizationMembers: {
            some: {
              organizationId,
            },
          },
        };
      }

      const users = await prisma.userProfile.findMany({
        where: whereClause,
        include: {
          organizationMembers: {
            include: {
              organization: true,
            },
          },
        },
        take: 100, // Limitar resultados
      });

      const safeUsers = users.map((userItem) =>
        sanitizeUserData({
          ...userItem,
          role: userItem.organizationMembers[0]?.role || "member",
          organization: userItem.organizationMembers[0]?.organization,
          redirectPath: "/application",
        })
      );

      return NextResponse.json(safeUsers);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 }
      );
    }
  });
}

// POST /api/user - Criar usuário (apenas admin)
export async function POST(request: NextRequest) {
  return withAdminAuth(request, async (req, user, userProfile) => {
    try {
      // Rate limiting mais restritivo para criação
      const clientIP = req.headers.get("x-forwarded-for") || "unknown";
      if (!checkRateLimit(`create-user:${clientIP}`, 5, 300000)) {
        // 5 por 5 minutos
        return NextResponse.json(
          { error: "Muitas tentativas de criação" },
          { status: 429 }
        );
      }

      const body = await req.json();

      // Validar entrada
      const validation = validateApiInput(userDataSchema, body);
      if (!validation.success) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      const userData = validation.data!;

      // Verificar se já existe usuário com este email
      const existingUser = await prisma.userProfile.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Já existe um usuário com este email" },
          { status: 409 }
        );
      }

      // Criar usuário
      const newUser = await prisma.userProfile.create({
        data: {
          name: userData.name,
          email: userData.email,
        },
      });

      // Adicionar à lista de usuários permitidos
      await prisma.allowedUser.upsert({
        where: { email: userData.email },
        update: {
          name: userData.name,
          status: true,
        },
        create: {
          name: userData.name,
          email: userData.email,
          status: true,
        },
      });

      const safeUserData = sanitizeUserData({
        ...newUser,
        role: "member",
        redirectPath: "/application",
      });

      return NextResponse.json(safeUserData, { status: 201 });
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 }
      );
    }
  });
}

// PUT /api/user - Atualizar usuário (apenas admin)
export async function PUT(request: NextRequest) {
  return withAdminAuth(request, async (req, user, userProfile) => {
    try {
      // Rate limiting
      const clientIP = req.headers.get("x-forwarded-for") || "unknown";
      if (!checkRateLimit(`update-user:${clientIP}`, 10, 60000)) {
        return NextResponse.json(
          { error: "Muitas tentativas" },
          { status: 429 }
        );
      }

      const body = await req.json();
      const { id, ...updateData } = body;

      if (!id) {
        return NextResponse.json(
          { error: "ID do usuário é obrigatório" },
          { status: 400 }
        );
      }

      // Validar dados de atualização
      const validation = validateApiInput(userDataSchema.partial(), updateData);
      if (!validation.success) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      // Verificar se o usuário existe e se o admin tem permissão
      const userToUpdate = await prisma.userProfile.findUnique({
        where: { id },
        include: {
          organizationMembers: true,
        },
      });

      if (!userToUpdate) {
        return NextResponse.json(
          { error: "Usuário não encontrado" },
          { status: 404 }
        );
      }

      // Verificar permissão
      const adminOrganizations = userProfile.organizationMembers.map(
        (om: any) => om.organizationId
      );
      const userOrganizations = userToUpdate.organizationMembers.map(
        (om: any) => om.organizationId
      );

      const hasPermission = adminOrganizations.some((orgId: string) =>
        userOrganizations.includes(orgId)
      );

      if (!hasPermission) {
        return NextResponse.json(
          { error: "Sem permissão para atualizar este usuário" },
          { status: 403 }
        );
      }

      // Atualizar usuário
      const updatedUser = await prisma.userProfile.update({
        where: { id },
        data: validation.data!,
        include: {
          organizationMembers: {
            include: {
              organization: true,
            },
          },
        },
      });

      const safeUserData = sanitizeUserData({
        ...updatedUser,
        role: updatedUser.organizationMembers[0]?.role || "member",
        organization: updatedUser.organizationMembers[0]?.organization,
        redirectPath: "/dashboard",
      });

      return NextResponse.json(safeUserData);
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 }
      );
    }
  });
}
