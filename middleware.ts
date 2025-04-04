// import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Para fins de teste, usar variável booleana simulando autenticação
  const isAuthenticated = false; // <- Mude para false para simular usuário não logado

  // const supabase = createMiddlewareClient({ req, res });
  // const {
  //   data: { session },
  // } = await supabase.auth.getSession();

  if (!isAuthenticated && req.nextUrl.pathname.startsWith("/api")) {
    const isProtected = [
      "/api/profile",
      "/api/users",
      "/api/committees",
      "/api/campuses",
      "/api/organizations",
      "/api/assets",
      "/api/inventories",
      "/api/groups",
      "/api/roles",
      "/api/permissions",
      "/api/user_roles",
      "/api/role_permissions",
    ].some((path) => req.nextUrl.pathname.startsWith(path));

    if (isProtected) {
      return new NextResponse(
        JSON.stringify({ error: "Not authenticated (simulated)" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }

  return res;
}

export const config = {
  matcher: [
    "/api/profile/:path*",
    "/api/users/:path*",
    "/api/committees/:path*",
    "/api/campuses/:path*",
    "/api/organizations/:path*",
    "/api/assets/:path*",
    "/api/inventories/:path*",
    "/api/groups/:path*",
    "/api/roles/:path*",
    "/api/permissions/:path*",
    "/api/user_roles/:path*",
    "/api/role_permissions/:path*",
  ],
};
