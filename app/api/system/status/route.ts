import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/validation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Rate limiting por IP
    const clientIP =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(`system-status:${clientIP}`, 30, 60000)) {
      return NextResponse.json(
        { error: "Muitas tentativas. Tente novamente em alguns minutos." },
        { status: 429 }
      );
    }

    // Verificar se há usuários permitidos no sistema
    const allowedUsersCount = await prisma.allowedUser.count({
      where: {
        status: true,
      },
    });

    // Verificar se há organizações no sistema
    const organizationsCount = await prisma.organization.count();

    // Verificar se há perfis de usuários
    const userProfilesCount = await prisma.userProfile.count();

    const systemStatus = {
      isConfigured: allowedUsersCount > 0 && organizationsCount > 0,
      hasUsers: allowedUsersCount > 0,
      hasOrganizations: organizationsCount > 0,
      hasUserProfiles: userProfilesCount > 0,
      needsSetup: allowedUsersCount === 0 || organizationsCount === 0,
      stats: {
        allowedUsers: allowedUsersCount,
        organizations: organizationsCount,
        userProfiles: userProfilesCount,
      },
    };

    return NextResponse.json({
      status: systemStatus,
      message: systemStatus.needsSetup
        ? "Sistema precisa ser configurado"
        : "Sistema configurado e pronto para uso",
    });
  } catch (error) {
    console.error("Erro ao verificar status do sistema:", error);

    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        status: {
          isConfigured: false,
          needsSetup: true,
          hasUsers: false,
          hasOrganizations: false,
          hasUserProfiles: false,
        },
      },
      { status: 500 }
    );
  }
}
