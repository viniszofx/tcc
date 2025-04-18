import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    !process.env.NEXT_PUBLIC_BASE_URL
  ) {
    throw new Error("Supabase environment variables are missing.");
  }

  console.log("Base URL:", process.env.NEXT_PUBLIC_BASE_URL);
  console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("Supabase ANON KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  console.log("Request URL:", request.url);
  console.log("Creating Supabase client with cookies");
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL! || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! || "",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );
  console.log("Supabase client created");
  // IMPORTANT: DO NOT REMOVE auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();
  console.log("User:", user);
  const RoutesAllowed = [
    "/",
    "/auth/sign-in",
    "/api/v1/auth/callback",
    "/api/v1/auth/confirm",
  ];
  console.log("RoutesAllowed:", RoutesAllowed);
  if (!user && !RoutesAllowed.includes(request.nextUrl.pathname)) {
    console.log(
      "User not found, redirecting to sign-in page",
      request.nextUrl.pathname
    );
    const url = request.nextUrl.clone();
    console.log("Redirect URL:", url);
    url.pathname = "/auth/sign-in";
    url.searchParams.set("redirectedFrom", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  console.log(
    "User found, continuing to the requested page",
    request.nextUrl.pathname
  );
  return supabaseResponse;
}
