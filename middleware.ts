import { createSupabaseMiddleware } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { publicRoutes } from "./utils/rotes-public";

const isDevelopment = process.env.NODE_ENV === "development";

// Cache simples para evitar múltiplas verificações
const authCache = new Map<string, { user: any; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 segundos

function getCachedAuth(key: string) {
  const cached = authCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.user;
  }
  return null;
}

function setCachedAuth(key: string, user: any) {
  authCache.set(key, { user, timestamp: Date.now() });
}

function clearAuthCache() {
  authCache.clear();
}

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
    // Criar chave de cache baseada no token de sessão
    const sessionToken = request.cookies.get("sb-access-token")?.value || 
                        request.cookies.get("sb-refresh-token")?.value;
    const cacheKey = `${pathname}-${sessionToken?.slice(-10) || 'anonymous'}`;
    
    // Verificar cache primeiro
    const cachedUser = getCachedAuth(cacheKey);
    let user = cachedUser;
    
    // Se não há cache, verificar autenticação
    if (!cachedUser) {
      let response = NextResponse.next({
        request: {
          headers: request.headers,
        },
      });

      const supabase = createSupabaseMiddleware(request, response);
      const {
        data: { user: authUser },
        error,
      } = await supabase.auth.getUser();
      
      user = error ? null : authUser;
      
      // Cache o resultado
      if (sessionToken) {
        setCachedAuth(cacheKey, user);
      }
    }

    // Para a página inicial
    if (pathname === "/") {
      // Se usuário está logado, redirecionar para application
      if (user) {
        return NextResponse.redirect(new URL("/application", request.url));
      }
      // Se não está logado, permitir acesso à página inicial
      return NextResponse.next();
    }

    // Para todas as outras rotas protegidas
    if (!user) {
      // Limpar cache em caso de logout
      clearAuthCache();
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Redirecionar rotas legacy
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/application", request.url));
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
