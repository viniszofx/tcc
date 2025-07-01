import { createSupabaseMiddleware } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { publicRoutes } from "./utils/rotes-public";

const isDevelopment = process.env.NODE_ENV === "development";

async function skipAuthCheck(request: NextRequest): Promise<boolean> {
  // Pular verificação de autenticação em desenvolvimento
  if (isDevelopment) {
    console.log("Pular verificação de autenticação em desenvolvimento");
    NextResponse.next();
  }

  // Verificar se o usuário está autenticado via cookie
  const token = request.cookies.get("sb-access-token")?.value;

  if (!token) {
    return false;
  }

  try {
    const supabase = createSupabaseMiddleware(request, null);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao verificar autenticação:", error);
    return false;
  }
}

// Função para verificar role do usuário e determinar redirecionamento
async function getUserRoleAndRedirect(
  userEmail: string,
  request: NextRequest
): Promise<{ role: string; redirectPath: string } | null> {
  try {
    const getUserRoleUrl = new URL("/api/auth/get-user-role", request.url);
    const response = await fetch(getUserRoleUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: userEmail }),
    });

    if (!response.ok) {
      console.warn("Erro ao buscar role do usuário:", userEmail);
      return null;
    }

    const userData = await response.json();
    return {
      role: userData.user?.role || userData.role || "member",
      redirectPath: userData.user?.redirectPath || "/dashboard",
    };
  } catch (error) {
    console.error("Erro ao buscar role do usuário:", error);
    return null;
  }
}

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

  // Pular verificação de autenticação em desenvolvimento
  if (isDevelopment) {
    console.log("Pular verificação de autenticação em desenvolvimento");
    return NextResponse.next();
  }

  try {
    // Verificar se usuário autenticado está tentando acessar rotas públicas
    if (pathname === "/" || pathname === "/login") {
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

      // Se usuário está autenticado, redirecionar baseado na role
      if (!error && user) {
        const userRoleData = await getUserRoleAndRedirect(user.email!, request);

        if (userRoleData) {
          const { role, redirectPath } = userRoleData;
          console.log(
            `Usuário autenticado acessando ${pathname}, redirecionando para ${redirectPath} (role: ${role})`
          );
          return NextResponse.redirect(new URL(redirectPath, request.url));
        } else {
          // Fallback para dashboard se não conseguir determinar a role
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
      }
    }
    // Para rotas protegidas, primeiro verificar se o sistema precisa de setup
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
      // Verificar status do sistema via API
      try {
        const systemStatusUrl = new URL(
          "/api/system/check-status",
          request.url
        );
        const response = await fetch(systemStatusUrl);

        if (response.ok) {
          const statusData = await response.json();

          if (statusData.needsSetup) {
            return NextResponse.redirect(new URL("/setup", request.url));
          }
        } else {
          // Se a API falhou
          console.warn(
            "Falha ao verificar status do sistema, tente novamente mais tarde."
          );
          return NextResponse.redirect(new URL("/", request.url));
        }
      } catch (error) {
        console.error(
          "Erro ao verificar status do sistema, tente novamente ,mais tarde.",
          error
        );
        // Em caso de erro
        return NextResponse.redirect(new URL("/", request.url));
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

      // Verificar se o usuário está na lista de permitidos
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
          console.warn("Usuário não autorizado:", user.email);
          return NextResponse.redirect(new URL("/unauthorized", request.url));
        }

        const { isAllowed } = await validateResponse.json();
        if (!isAllowed) {
          return NextResponse.redirect(new URL("/unauthorized", request.url));
        }

        // Verificar role do usuário e fazer redirecionamento inteligente
        const userRoleData = await getUserRoleAndRedirect(user.email!, request);

        if (userRoleData) {
          const { role, redirectPath } = userRoleData;

          // Redirecionamento inteligente baseado na role
          if (role === "admin") {
            // Admins devem acessar /admin
            if (
              pathname.startsWith("/dashboard") &&
              !pathname.startsWith("/admin")
            ) {
              console.log(`Redirecionando admin de ${pathname} para /admin`);
              return NextResponse.redirect(new URL("/admin", request.url));
            }
          } else {
            // Members devem acessar /dashboard
            if (pathname.startsWith("/admin")) {
              console.log(
                `Redirecionando member de ${pathname} para /dashboard`
              );
              return NextResponse.redirect(new URL("/dashboard", request.url));
            }
          }

          // Verificar se é rota admin e usuário tem privilégios
          if (pathname.startsWith("/admin") && role !== "admin") {
            console.warn("Usuário sem privilégios de admin:", user.email);
            return NextResponse.redirect(new URL("/dashboard", request.url));
          }
        } else {
          // Se não conseguiu buscar a role, fazer validação tradicional para rotas admin
          if (pathname.startsWith("/admin")) {
            const validateAdminUrl = new URL(
              "/api/auth/validate-admin",
              request.url
            );
            const adminResponse = await fetch(validateAdminUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
            });

            if (!adminResponse.ok) {
              console.warn("Usuário sem privilégios de admin:", user.email);
              return NextResponse.redirect(new URL("/dashboard", request.url));
            }

            const { isAdmin } = await adminResponse.json();
            if (!isAdmin) {
              return NextResponse.redirect(new URL("/dashboard", request.url));
            }
          }
        }
      } catch (error) {
        console.error("Erro ao validar usuário:", error);
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
