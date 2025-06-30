import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
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

    return NextResponse.json({
      user: {
        id: userProfile.id,
        name: userProfile.name,
        email: userProfile.email,
        role,
        organization,
        redirectPath,
      },
      role, // Adicionar role também no nível raiz para compatibilidade
    });
  } catch (error) {
    console.error("Erro ao buscar role do usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
