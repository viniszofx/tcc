import { createClient } from "@/utils/supabase/server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  // Check if the user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();
  console.log("Session data:", session);

  if (!session) {
    return Response.redirect("/login", 401);
  }
  // Verify role of user [admin, president, operator]
  const { data: user, error } = await supabase.auth.getUser();
  console.log("User data:", user);
  if (error || !user) {
    return Response.redirect("/login", 401);
  }
  console.log("Auth redirect route hit");
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const next = searchParams.get("next") ?? "/dashboard/organizations/";

  // Redirect to the specified next URL or default to the dashboard
  return Response.redirect(`${url.origin}${next}`, 302);
}
