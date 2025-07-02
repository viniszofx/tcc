import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    console.log("Testando role para email:", email);

    // Fazer a mesma chamada que o hook faz
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/auth/get-user-role`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );

    const data = await response.json();

    console.log("Resposta da API get-user-role:", data);

    return NextResponse.json({
      success: true,
      apiResponse: data,
      status: response.status,
      roleDetected: data.user?.role,
      shouldRedirectTo: "/application",
    });
  } catch (error) {
    console.error("Erro no teste:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
