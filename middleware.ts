import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "./utils/supabase/middleware";

const isDevelopment = process.env.NODE_ENV === "development";

console.log("Middleware loaded in", isDevelopment ? "development" : "production", "mode");
const publicRoutes = [
  "/",
  "/auth/sign-in",
  "/auth/forget-password",
  "/api/v1/auth/callback",
  "/api/v1/auth/confirm",
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
    console.log("Development mode - all routes are public");
    return NextResponse.next();
  }

  // In production, check public routes and static assets
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
