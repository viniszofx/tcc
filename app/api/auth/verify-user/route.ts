import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se o usuário existe em todas as tabelas necessárias
    const userProfile = await prisma.userProfile.findUnique({
      where: { email },
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
      },
    });

    const allowedUser = await prisma.allowedUser.findUnique({
      where: { email },
    });

    if (!userProfile) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      userProfile: {
        id: userProfile.id,
        name: userProfile.name,
        email: userProfile.email,
        description: userProfile.description,
        active: userProfile.active,
      },
      allowedUser: allowedUser
        ? {
            name: allowedUser.name,
            email: allowedUser.email,
            status: allowedUser.status,
          }
        : null,
      organizationMemberships: userProfile.organizationMembers.map(
        (member) => ({
          role: member.role,
          organization: {
            id: member.organization.id,
            name: member.organization.name,
            shortName: member.organization.shortName,
          },
        })
      ),
      campusMemberships: userProfile.campusMembers.map((member) => ({
        campus: {
          id: member.campus.id,
          name: member.campus.name,
          code: member.campus.code,
        },
      })),
      summary: {
        hasUserProfile: !!userProfile,
        isAllowedUser: !!allowedUser && allowedUser.status,
        organizationCount: userProfile.organizationMembers.length,
        campusCount: userProfile.campusMembers.length,
        isAdmin: userProfile.organizationMembers.some(
          (m) => m.role === "admin"
        ),
      },
    });
  } catch (error) {
    console.error("Erro ao verificar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
