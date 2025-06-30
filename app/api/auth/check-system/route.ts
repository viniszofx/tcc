import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Verificar se existe pelo menos um usuário permitido
    const allowedUsersCount = await prisma.allowedUser.count();

    // Verificar se existe pelo menos uma organização
    const organizationsCount = await prisma.organization.count();

    // Verificar se existe pelo menos um usuário profile
    const userProfilesCount = await prisma.userProfile.count();

    const needsOnboarding =
      allowedUsersCount === 0 ||
      organizationsCount === 0 ||
      userProfilesCount === 0;
    const isFirstRun =
      allowedUsersCount === 0 &&
      organizationsCount === 0 &&
      userProfilesCount === 0;

    return NextResponse.json({
      needsOnboarding,
      isFirstRun,
      stats: {
        allowedUsers: allowedUsersCount,
        organizations: organizationsCount,
        userProfiles: userProfilesCount,
      },
    });
  } catch (error) {
    console.error("Erro ao verificar status do sistema:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
