import { NextResponse } from "next/server";
import SwaggerAutoGenerator from "../../../lib/swagger-auto-generator";

export async function GET() {
  try {
    // Gera a especificação automaticamente
    const generator = new SwaggerAutoGenerator();
    const spec = generator.generateSwaggerSpec();

    return NextResponse.json(spec);
  } catch (error) {
    console.error("Erro ao gerar especificação Swagger:", error);
    return NextResponse.json(
      { error: "Erro ao gerar documentação da API" },
      { status: 500 }
    );
  }
}
