import { type NextRequest } from "next/server";
import { updateSession } from "./utils/supabase/middleware";

if (process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line no-console
  console.log("Middleware loaded in development mode.");
}

export async function middleware(request: NextRequest) {
  // Check if the request is for a specific path
  const { pathname } = request.nextUrl;

  // Update session for all requests except for the ones starting with _next/static, _next/image, and favicon.ico
  if (!pathname.startsWith("/_next") && !pathname.startsWith("/favicon.ico")) {
    await updateSession(request);
  }

  return null; // No response needed, just run the middleware
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
