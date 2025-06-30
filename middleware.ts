import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { publicRoutes } from "./utils/rotes-public";

let isDevelopment = process.env.NODE_ENV === "development";

isDevelopment = true; // Force development mode for testing purposes

console.log(
  "Middleware loaded in",
  isDevelopment ? "development" : "production",
  "mode"
);

// Paths to ignore in development logs
const ignoredPaths = [
  "manifest.webmanifest",
  ".well-known/appspecific/com.chrome.devtools.json",
];

if (isDevelopment) {
  console.log("Middleware loaded in development mode - all routes are public");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // In development mode, allow all routes but filter logs
  if (isDevelopment) {
    const shouldLog = !ignoredPaths.some((path) => pathname.includes(path));

    if (shouldLog) {
      console.log("Development mode - all routes are public");
      console.log("Request URL:", request.url);
      console.log("Request Pathname:", pathname);
    }

    return NextResponse.next();
  }

  // Create Supabase client
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  // Check if it's the login page
  if (pathname === "/login") {
    try {
      const setupResponse = await fetch(
        new URL("/api/v1/setup/status", request.url)
      );
      const data = await setupResponse.json();

      if (data.status === "first_user") {
        return NextResponse.redirect(new URL("/setup", request.url));
      }
    } catch (error) {
      console.error("Error checking setup status:", error);
    }
  }

  // Continue with existing middleware logic for public routes
  if (
    publicRoutes.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api")
  ) {
    return response;
  }

  // Check if user is authenticated for protected routes
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // User is not authenticated, redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
