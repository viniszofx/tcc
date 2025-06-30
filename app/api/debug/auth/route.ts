import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createSupabaseServerClient(cookieStore);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log("Debug Auth - User:", user?.email);
    console.log("Debug Auth - Error:", authError);

    const debugInfo: any = {
      timestamp: new Date().toISOString(),
      supabaseUser: user
        ? {
            id: user.id,
            email: user.email,
            verified: user.email_confirmed_at ? true : false,
            lastSignIn: user.last_sign_in_at,
          }
        : null,
      authError: authError?.message || null,
    };

    if (user?.email) {
      // Verificar allowed_users
      const allowedUser = await prisma.allowedUser.findUnique({
        where: { email: user.email },
      });

      debugInfo.allowedUser = allowedUser
        ? {
            name: allowedUser.name,
            email: allowedUser.email,
            status: allowedUser.status,
          }
        : null;

      // Verificar user_profiles
      const userProfile = await prisma.userProfile.findUnique({
        where: { email: user.email },
        include: {
          organizationMembers: {
            include: {
              organization: true,
            },
          },
        },
      });

      debugInfo.userProfile = userProfile
        ? {
            name: userProfile.name,
            email: userProfile.email,
            organizationMembers: userProfile.organizationMembers.map((om) => ({
              role: om.role,
              organization: om.organization.name,
            })),
          }
        : null;
    }

    return NextResponse.json(debugInfo, { status: 200 });
  } catch (error) {
    console.error("Erro no debug:", error);
    return NextResponse.json(
      {
        error: "Erro interno",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
