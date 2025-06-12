// // import { createClient } from "@/utils/supabase/server";
// import { NextResponse, type NextRequest } from "next/server";

// export const runtime = 'edge';

// export async function GET(request: NextRequest) {
//   console.log("Auth callback route hit");
//   const url = new URL(request.url);
//   const searchParams = url.searchParams;
//   const code = searchParams.get("code");
//   const token_hash = searchParams.get("token_hash");
//   const type = searchParams.get("type");
//   const next = searchParams.get("next") ?? "/redirect";
//   const origin = url.origin;

//   // const supabase = await createClient();

//   // 1. Exchange OAuth code
//   if (code) {
//     const { error } = await supabase.auth.exchangeCodeForSession(code);
//     if (!error) {
//       const forwardedHost = request.headers.get("x-forwarded-host");
//       const isLocalEnv = process.env.NODE_ENV === "development";
//       const finalRedirect = isLocalEnv
//         ? `${origin}${next}`
//         : forwardedHost
//         ? `https://${forwardedHost}${next}`
//         : `${origin}${next}`;

//       return NextResponse.redirect(finalRedirect);
//     }
//   }

//   // 2. Exchange Email OTP token
//   if (token_hash && type) {
//     const { error } = await supabase.auth.verifyOtp({
//       token_hash,
//       type: type as any,
//     });
//     if (!error) {
//       return NextResponse.redirect(`${origin}${next}`);
//     }
//   }

//   // 3. On failure
//   return NextResponse.redirect(`${origin}/auth/auth-code-error`);
// }

export async function GET(request: Request) {
  return new Response("This route is not implemented yet.");
}
