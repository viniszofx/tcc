import { createSupabaseAdmin } from "@/lib/supabase";
import { ensureBucketExists } from "@/lib/supabase-bucket-manager";
import { NextRequest, NextResponse } from "next/server";

/**
 * API para upload de arquivos usando service role key
 * Funciona como proxy para uploads que precisam de permissões elevadas
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const bucket = (formData.get("bucket") as string) || "inventory-files";
    const folder = formData.get("folder") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "Arquivo é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se o arquivo é válido
    if (file.size === 0) {
      return NextResponse.json(
        { error: "Arquivo vazio não é permitido" },
        { status: 400 }
      );
    }

    // Verificar tamanho do arquivo (50MB max)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Tamanho máximo: 50MB" },
        { status: 400 }
      );
    }

    // Criar cliente admin
    const supabaseAdmin = createSupabaseAdmin();

    // Garantir que o bucket existe
    console.log(`🔍 Verificando bucket: ${bucket}`);
    const bucketExists = await ensureBucketExists(bucket);

    if (!bucketExists) {
      return NextResponse.json(
        { error: `Bucket '${bucket}' não pôde ser criado ou acessado` },
        { status: 500 }
      );
    }

    // Gerar nome único para o arquivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileExtension = file.name.split(".").pop();
    const fileName = `${timestamp}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExtension}`;

    // Construir caminho do arquivo
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    console.log(`📁 Fazendo upload para: ${bucket}/${filePath}`);

    // Fazer upload usando service role key
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("❌ Erro no upload:", error);
      return NextResponse.json(
        { error: `Erro no upload: ${error.message}` },
        { status: 500 }
      );
    }

    // Obter URL pública
    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      return NextResponse.json(
        { error: "Erro ao obter URL pública do arquivo" },
        { status: 500 }
      );
    }

    console.log(`✅ Upload concluído: ${urlData.publicUrl}`);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: filePath,
      bucket: bucket,
    });
  } catch (error: any) {
    console.error("❌ Erro na API de upload:", error);
    return NextResponse.json(
      {
        error: "Erro interno no upload",
        details: error?.message || "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

/**
 * GET para verificar status da API
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message:
      "API de upload de arquivos. Use POST com FormData contendo 'file', 'bucket' (opcional) e 'folder' (opcional).",
  });
}
