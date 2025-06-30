import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Criar resposta com cookies limpos
    const response = NextResponse.json({
      success: true,
      message: "Sessão invalidada",
    });

    // Limpar cookies de autenticação do Supabase
    response.cookies.delete("sb-access-token");
    response.cookies.delete("sb-refresh-token");
    response.cookies.delete("supabase-auth-token");

    // Tentar limpar outros cookies possíveis
    const cookieNames = [
      "sb-rgjtcegxcyzuhshjewai-auth-token",
      "sb-rgjtcegxcyzuhshjewai-auth-token.0",
      "sb-rgjtcegxcyzuhshjewai-auth-token.1",
    ];

    cookieNames.forEach((name) => {
      response.cookies.delete(name);
    });

    return response;
  } catch (error) {
    console.error("Erro ao invalidar sessão:", error);
    return NextResponse.json(
      { error: "Erro ao invalidar sessão" },
      { status: 500 }
    );
  }
}
