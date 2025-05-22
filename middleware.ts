import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "./utils/supabase/middleware";

const isDevelopment = process.env.NODE_ENV === "development";

console.log("Middleware loaded in", isDevelopment ? "development" : "production", "mode");
const publicRoutes = [
  "/",
  "/auth/setup",
  "/auth/setup-email",
  "/auth/setup-password",
  "/auth/setup-settings",
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/forget-password",
  "/api/v1/auth/callback",
  "/api/v1/setup",
  "/api/v1/auth/confirm",
  "/api/v1/setup/status",
  "/manifest.webmanifest",
];

// Paths to ignore in development logs
const ignoredPaths = [
  'manifest.webmanifest',
  '.well-known/appspecific/com.chrome.devtools.json'
];

if (isDevelopment) {
  console.log("Middleware loaded in development mode - all routes are public");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // In development mode, allow all routes but filter logs
  if (isDevelopment) {
    console.log("Development mode - all routes are public");
    const shouldLog = !ignoredPaths.some(path => pathname.includes(path));
    
    if (shouldLog) {
      console.log("Development mode - all routes are public");
      console.log("Request URL:", request.url);
      console.log("Request Pathname:", pathname);
    }
    
    return NextResponse.next();
  }

  // Check if it's the login page
  if (pathname === "/auth/sign-in") {
    try {
      const response = await fetch(new URL("/api/v1/setup/status", request.url));
      const data = await response.json();
      
      if (data.status === "first_user") {
        return NextResponse.redirect(new URL("/auth/setup", request.url));
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
