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

    if (!checkRateLimit(`check-status:${clientIP}`, 10, 60000)) {
      return NextResponse.json(
        { error: "Muitas tentativas. Tente novamente em alguns minutos." },
        { status: 429 }
      );
    }

    // Verificar se existem organizações no sistema
    const organizationCount = await prisma.organization.count();

    if (organizationCount === 0) {
      return NextResponse.json({
        needsSetup: true,
        configured: false,
        message: "Sistema precisa ser configurado pela primeira vez",
      });
    }

    // Verificar se existe pelo menos um usuário admin
    const adminCount = await prisma.organizationMember.count({
      where: {
        role: "admin",
      },
    });

    if (adminCount === 0) {
      return NextResponse.json({
        needsSetup: true,
        configured: false,
        message: "Sistema não possui administradores configurados",
      });
    }

    // Sistema está configurado
    return NextResponse.json({
      needsSetup: false,
      configured: true,
      message: "Sistema configurado e pronto para uso",
    });
  } catch (error) {
    console.error("Erro ao verificar status do sistema:", error);

    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        needsSetup: true, // Por segurança, assumir que precisa de setup
        configured: false,
      },
      { status: 500 }
    );
  }
}
