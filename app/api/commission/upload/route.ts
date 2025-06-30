import { prisma } from "@/lib/prisma";
import { createSupabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    // Verificar se é FormData
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const commissionId = formData.get("commissionId") as string;

    if (!file) {
      return NextResponse.json(
        { error: "Arquivo é obrigatório" },
        { status: 400 }
      );
    }

    if (!commissionId) {
      return NextResponse.json(
        { error: "ID da comissão é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se a comissão existe
    const commission = await prisma.commission.findUnique({
      where: { id: commissionId },
      include: { campus: true },
    });

    if (!commission) {
      return NextResponse.json(
        { error: "Comissão não encontrada" },
        { status: 404 }
      );
    }

    // Configurar Supabase Admin
    const supabaseAdmin = createSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Configuração do Supabase não disponível" },
        { status: 500 }
      );
    }

    // Gerar nome único para o arquivo
    const fileExtension = file.name.split(".").pop();
    const fileName = `commission-${commissionId}-${uuidv4()}.${fileExtension}`;
    const filePath = `commissions/${commissionId}/${fileName}`;

    // Converter arquivo para ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload para o Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("spreadsheets")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Erro no upload:", uploadError);
      return NextResponse.json(
        { error: "Erro ao fazer upload do arquivo" },
        { status: 500 }
      );
    }

    // Obter URL pública do arquivo
    const { data: urlData } = supabaseAdmin.storage
      .from("spreadsheets")
      .getPublicUrl(filePath);

    if (!urlData.publicUrl) {
      return NextResponse.json(
        { error: "Erro ao obter URL do arquivo" },
        { status: 500 }
      );
    }

    // Atualizar a comissão com a URL da planilha
    const updatedCommission = await prisma.commission.update({
      where: { id: commissionId },
      data: {
        spreadsheetUrl: urlData.publicUrl,
        updatedAt: new Date(),
      },
      include: {
        campus: true,
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Upload realizado com sucesso",
      commission: updatedCommission,
      fileUrl: urlData.publicUrl,
      filePath: uploadData.path,
    });
  } catch (error) {
    console.error("Erro interno:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
