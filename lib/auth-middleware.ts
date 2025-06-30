import { supabase } from "@/lib/supabase";
import { NextRequest } from "next/server";

export async function checkAuth(request: NextRequest) {
  const token = request.cookies.get("sb-access-token")?.value;

  if (!token) {
    return null;
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Erro ao verificar autenticação:", error);
    return null;
  }
}
