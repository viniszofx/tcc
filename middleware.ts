import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "./utils/supabase/middleware";

const isDevelopment = process.env.NODE_ENV === "development";
const publicRoutes = [
  "/",
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/forget-password",
  "/api/v1/auth/callback",
  "/api/v1/auth/confirm",
  "/api/v1/setup/status", // Adicionar a rota de status
  "/manifest.webmanifest",
];

if (isDevelopment) {
  // eslint-disable-next-line no-console
  console.log("Middleware loaded in development mode - all routes are public");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // In development mode, allow all routes
  if (isDevelopment) {
    return NextResponse.next();
  }

  // Check if it's the login page
  if (pathname === "/auth/sign-in") {
    try {
      const response = await fetch(new URL("/api/v1/setup/status", request.url));
      const data = await response.json();
      
      if (data.status === "first_user") {
        return NextResponse.redirect(new URL("/auth/register", request.url));
      }
    } catch (error) {
      console.error("Error checking setup status:", error);
    }
  }

  // Continue with existing middleware logic
  if (
    publicRoutes.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  // Handle authentication for protected routes
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
