import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Buscar todos os usuários com suas organizações
    const users = await prisma.userProfile.findMany({
      include: {
        organizationMembers: {
          include: {
            organization: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        organizationMembers: user.organizationMembers.map((member) => ({
          role: member.role,
          organization: member.organization.name,
        })),
      })),
    });
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
