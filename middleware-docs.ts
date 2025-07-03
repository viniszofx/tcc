import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Otimizações específicas para API docs
  if (request.nextUrl.pathname.startsWith("/api/docs")) {
    const response = NextResponse.next();

    // Headers para melhor cache no Vercel
    response.headers.set(
      "Cache-Control",
      "public, max-age=3600, s-maxage=3600"
    );
    response.headers.set("CDN-Cache-Control", "max-age=86400");
    response.headers.set("Vercel-CDN-Cache-Control", "max-age=86400");

    // CORS headers para Swagger UI
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    return response;
  }

  // Otimizações para arquivos estáticos do Swagger
  if (request.nextUrl.pathname.includes("swagger-ui")) {
    const response = NextResponse.next();
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/docs/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
