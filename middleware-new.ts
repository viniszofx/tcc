import { createSupabaseMiddleware } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { publicRoutes } from "./utils/rotes-public";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Sempre permitir rotas públicas primeiro
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Pular verificação para rotas da API, assets estáticos
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".") ||
    pathname.startsWith("/manifest")
  ) {
    return NextResponse.next();
  }

  try {
    // Para a página inicial, apenas verificar se sistema precisa de setup
    if (pathname === "/") {
      try {
        const systemStatusUrl = new URL(
          "/api/system/check-status",
          request.url
        );
        const statusResponse = await fetch(systemStatusUrl);

        if (statusResponse.ok) {
          const statusData = await statusResponse.json();

          // Se sistema precisa de setup, redirecionar para setup
          if (statusData.needsSetup) {
            return NextResponse.redirect(new URL("/setup", request.url));
          }
        }
      } catch (error) {
        console.error("Erro ao verificar status do sistema:", error);
      }

      // Permitir acesso à página inicial
      return NextResponse.next();
    }

    // Para todas as outras rotas protegidas, verificar autenticação
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createSupabaseMiddleware(request, response);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    // Se não há usuário autenticado, redirecionar para login
    if (error || !user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Verificar se o sistema precisa de configuração inicial para rotas protegidas
    if (pathname !== "/setup") {
      try {
        const systemStatusUrl = new URL(
          "/api/system/check-status",
          request.url
        );
        const statusResponse = await fetch(systemStatusUrl);

        if (statusResponse.ok) {
          const statusData = await statusResponse.json();

          if (statusData.needsSetup) {
            return NextResponse.redirect(new URL("/setup", request.url));
          }
        }
      } catch (error) {
        console.error("Erro ao verificar status do sistema:", error);
      }
    }

    // Redirecionar rotas legacy (/admin e /dashboard antigas) para /application
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/application", request.url));
    }

    // Para rotas protegidas /application, verificar se usuário tem acesso
    if (pathname.startsWith("/application")) {
      try {
        const getUserRoleUrl = new URL("/api/auth/get-user-role", request.url);
        const roleResponse = await fetch(getUserRoleUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Cookie: request.headers.get("cookie") || "",
          },
        });

        if (roleResponse.status === 403) {
          return NextResponse.redirect(new URL("/unauthorized", request.url));
        } else if (!roleResponse.ok) {
          return NextResponse.redirect(new URL("/login", request.url));
        }

        const roleData = await roleResponse.json();

        // Se é primeiro acesso, redirecionar para setup
        if (roleData.isFirstAccess) {
          return NextResponse.redirect(new URL("/setup", request.url));
        }
      } catch (error) {
        console.error("Erro ao verificar permissões:", error);
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Erro no middleware:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
