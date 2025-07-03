import { createSupabaseMiddleware } from "@/lib/supabase";
import { NextRequest } from "next/server";

export interface PermissionCheck {
  action: string;
  subject: string;
  resource?: any;
}

export interface AuthorizedUser {
  id: string;
  email: string;
  role?: string;
}

/**
 * Middleware Edge-compatible para verificar apenas autenticação
 * As permissões detalhadas são verificadas nas APIs usando o middleware completo
 */
export async function withEdgeAuth(
  request: NextRequest
): Promise<
  | { success: true; user: AuthorizedUser }
  | { success: false; error: string; status: number }
> {
  try {
    // 1. Verificar autenticação com Supabase
    const supabase = createSupabaseMiddleware(request, null);
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return {
        success: false,
        error: "Não autorizado",
        status: 401,
      };
    }

    // 2. Fazer uma chamada para a API para verificar permissões
    // Isso é feito via fetch para não usar Prisma no Edge Runtime
    try {
      const getUserRoleUrl = new URL("/api/auth/get-user-role", request.url);
      const response = await fetch(getUserRoleUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: request.headers.get("cookie") || "",
        },
      });

      if (!response.ok) {
        return {
          success: false,
          error: "Usuário não autorizado",
          status: 403,
        };
      }

      const userData = await response.json();

      return {
        success: true,
        user: {
          id: authUser.id,
          email: authUser.email!,
          role: userData.user?.role || "member",
        },
      };
    } catch (apiError) {
      console.error("Erro ao verificar permissões via API:", apiError);
      return {
        success: false,
        error: "Erro ao verificar permissões",
        status: 500,
      };
    }
  } catch (error) {
    console.error("Erro no middleware de autenticação:", error);
    return {
      success: false,
      error: "Erro interno do servidor",
      status: 500,
    };
  }
}

/**
 * Helper para verificar autenticação básica no Edge Runtime
 */
export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  try {
    const supabase = createSupabaseMiddleware(request, null);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    return !error && !!user;
  } catch {
    return false;
  }
}
