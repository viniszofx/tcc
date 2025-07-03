import { prisma } from "@/lib/prisma";
import { ensureBucketExists, listBuckets } from "@/lib/supabase-bucket-manager";
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

    // Verificar status do storage
    let storageStatus = {
      isConfigured: false,
      buckets: [] as string[],
      hasInventoryBucket: false,
      error: null as string | null,
    };

    try {
      const buckets = await listBuckets();
      storageStatus = {
        isConfigured: true,
        buckets: buckets,
        hasInventoryBucket: buckets.includes("inventory-files"),
        error: null,
      };
    } catch (error: any) {
      storageStatus = {
        isConfigured: false,
        buckets: [],
        hasInventoryBucket: false,
        error: error?.message || "Erro desconhecido ao verificar buckets",
      };
      console.error("Erro ao verificar buckets:", error);
    }

    const systemStatus = {
      isConfigured: allowedUsersCount > 0 && organizationsCount > 0,
      hasUsers: allowedUsersCount > 0,
      hasOrganizations: organizationsCount > 0,
      hasUserProfiles: userProfilesCount > 0,
      needsSetup: allowedUsersCount === 0 || organizationsCount === 0,
      storage: storageStatus,
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
          storage: {
            isConfigured: false,
            hasInventoryBucket: false,
            error: "Não foi possível verificar o status do storage",
          },
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting por IP
    const clientIP =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(`system-repair:${clientIP}`, 5, 300000)) {
      // Limite mais restritivo para reparo
      return NextResponse.json(
        { error: "Muitas tentativas. Tente novamente em alguns minutos." },
        { status: 429 }
      );
    }

    // Verificar status atual
    const { status } = await GET(request).then((res) => res.json());

    // Registrar ação
    console.log("🔧 Tentativa de reparo do sistema iniciada");

    // Ações de reparo
    const repairs = {
      storage: false,
    };

    // Tentar reparar o storage
    if (!status.storage.hasInventoryBucket) {
      try {
        console.log("🔧 Tentando criar bucket inventory-files...");
        const bucketCreated = await ensureBucketExists("inventory-files");
        repairs.storage = bucketCreated;

        if (bucketCreated) {
          console.log("✅ Bucket inventory-files criado com sucesso");
        } else {
          console.error("❌ Falha ao criar bucket inventory-files");
        }
      } catch (error) {
        console.error("❌ Erro ao tentar reparar storage:", error);
      }
    }

    // Verificar status novamente após reparo
    const updatedStatus = await GET(request).then((res) => res.json());

    return NextResponse.json({
      previousStatus: status,
      currentStatus: updatedStatus.status,
      repairs: repairs,
      success: Object.values(repairs).some((v) => v === true),
    });
  } catch (error) {
    console.error("Erro ao tentar reparar sistema:", error);

    return NextResponse.json(
      {
        error: "Erro ao tentar reparar sistema",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
