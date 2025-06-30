import { createSupabaseMiddleware } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { publicRoutes } from "./utils/rotes-public";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pular verificação para rotas da API, assets estáticos e onboarding
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/setup") ||
    pathname.includes(".") ||
    publicRoutes.includes(pathname)
  ) {
    return NextResponse.next();
  }

  try {
    // Para rotas protegidas, primeiro verificar se o sistema precisa de onboarding
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
      // Verificar status do sistema via API
      try {
        const systemCheckUrl = new URL("/api/auth/check-system", request.url);
        const response = await fetch(systemCheckUrl);

        if (response.ok) {
          const { needsOnboarding, isFirstRun } = await response.json();

          if (needsOnboarding && isFirstRun) {
            return NextResponse.redirect(new URL("/setup", request.url));
          }
        }
      } catch (error) {
        console.error("Erro ao verificar status do sistema:", error);
        // Em caso de erro, assumir que precisa de onboarding
        return NextResponse.redirect(new URL("/setup", request.url));
      }

      // Verificar autenticação do usuário
      let user;

      // Sempre verificar autenticação real, mesmo em desenvolvimento
      let response = NextResponse.next({
        request: {
          headers: request.headers,
        },
      });

      const supabase = createSupabaseMiddleware(request, response);

      const {
        data: { user: realUser },
        error,
      } = await supabase.auth.getUser();

      if (error || !realUser) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      user = realUser;

      // Verificar se o usuário está na lista de permitidos via API
      try {
        const validateUserUrl = new URL("/api/auth/validate-user", request.url);
        const validateResponse = await fetch(validateUserUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: user.email }),
        });

        if (!validateResponse.ok) {
          return NextResponse.redirect(new URL("/unauthorized", request.url));
        }

        const { allowed, isAllowed } = await validateResponse.json();
        if (!allowed && !isAllowed) {
          return NextResponse.redirect(new URL("/unauthorized", request.url));
        }
      } catch (error) {
        console.error("Erro ao validar usuário:", error);
        return NextResponse.redirect(new URL("/unauthorized", request.url));
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
