import { createSupabaseAdmin } from "@/lib/supabase";
import { ensureBucketExists } from "@/lib/supabase-bucket-manager";
import { NextRequest, NextResponse } from "next/server";

// Configurações para upload em chunks
const CHUNK_SIZE = 512 * 1024; // 512KB por chunk
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 segundo

interface ChunkUploadRequest {
  chunkIndex: number;
  totalChunks: number;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  bucket?: string;
  folder?: string;
}

/**
 * API para upload de arquivos em chunks
 * Permite upload de arquivos grandes dividindo-os em pedaços menores
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const chunk = formData.get("chunk") as File;
    const chunkIndex = parseInt(formData.get("chunkIndex") as string);
    const totalChunks = parseInt(formData.get("totalChunks") as string);
    const fileName = formData.get("fileName") as string;
    const originalFileName = formData.get("originalFileName") as string;
    const fileSize = parseInt(formData.get("fileSize") as string);
    const bucket = (formData.get("bucket") as string) || "spreadsheets";
    const folder = formData.get("folder") as string | null;

    // Validações
    if (!chunk) {
      return NextResponse.json(
        { error: "Chunk é obrigatório" },
        { status: 400 }
      );
    }

    if (
      isNaN(chunkIndex) ||
      isNaN(totalChunks) ||
      !fileName ||
      !originalFileName
    ) {
      return NextResponse.json(
        { error: "Parâmetros inválidos" },
        { status: 400 }
      );
    }

    if (chunkIndex < 0 || chunkIndex >= totalChunks) {
      return NextResponse.json(
        { error: "Índice de chunk inválido" },
        { status: 400 }
      );
    }

    // Verificar se o chunk é válido
    if (chunk.size === 0) {
      return NextResponse.json(
        { error: "Chunk vazio não é permitido" },
        { status: 400 }
      );
    }

    // Verificar tamanho do chunk (deve ser menor que 1MB para Vercel)
    const maxChunkSize = 800 * 1024; // 800KB para margem de segurança
    if (chunk.size > maxChunkSize) {
      return NextResponse.json(
        {
          error: `Chunk muito grande. Tamanho máximo: ${(
            maxChunkSize / 1024
          ).toFixed(0)}KB`,
        },
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

    // Construir nome do chunk
    const chunkFileName = `${fileName}.chunk.${chunkIndex
      .toString()
      .padStart(4, "0")}`;
    const chunkPath = folder ? `${folder}/${chunkFileName}` : chunkFileName;

    console.log(
      `📁 Fazendo upload do chunk ${
        chunkIndex + 1
      }/${totalChunks} para: ${bucket}/${chunkPath}`
    );

    // Fazer upload do chunk com retry
    let uploadError = null;
    let uploadSuccess = false;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const { error } = await supabaseAdmin.storage
          .from(bucket)
          .upload(chunkPath, chunk, {
            cacheControl: "3600",
            upsert: attempt > 0,
          });

        if (error) {
          uploadError = error;
          console.warn(
            `⚠️ Tentativa ${
              attempt + 1
            } de upload do chunk ${chunkIndex} falhou:`,
            error
          );

          if (attempt < MAX_RETRIES - 1) {
            await new Promise((resolve) =>
              setTimeout(resolve, RETRY_DELAY * (attempt + 1))
            );
          }
        } else {
          uploadSuccess = true;
          break;
        }
      } catch (e: any) {
        uploadError = e;
        console.warn(
          `⚠️ Erro na tentativa ${
            attempt + 1
          } de upload do chunk ${chunkIndex}:`,
          e
        );

        if (attempt < MAX_RETRIES - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, RETRY_DELAY * (attempt + 1))
          );
        }
      }
    }

    if (!uploadSuccess) {
      console.error(
        `❌ Falha no upload do chunk ${chunkIndex} após ${MAX_RETRIES} tentativas:`,
        uploadError
      );
      return NextResponse.json(
        {
          error: `Erro no upload do chunk: ${
            uploadError?.message || "Erro desconhecido"
          }`,
        },
        { status: 500 }
      );
    }

    console.log(
      `✅ Chunk ${chunkIndex + 1}/${totalChunks} enviado com sucesso`
    );

    // Se este é o último chunk, criar arquivo de metadados
    let metadataUrl = null;
    if (chunkIndex === totalChunks - 1) {
      console.log(`📋 Criando arquivo de metadados para ${originalFileName}`);

      const metadata = {
        originalFileName,
        totalChunks,
        fileSize,
        uploadDate: new Date().toISOString(),
        chunkSize: CHUNK_SIZE,
        fileName,
      };

      const metadataFileName = `${fileName}.metadata.json`;
      const metadataPath = folder
        ? `${folder}/${metadataFileName}`
        : metadataFileName;

      const { error: metadataError } = await supabaseAdmin.storage
        .from(bucket)
        .upload(
          metadataPath,
          new Blob([JSON.stringify(metadata, null, 2)], {
            type: "application/json",
          }),
          {
            cacheControl: "3600",
            upsert: true,
          }
        );

      if (metadataError) {
        console.error("❌ Erro ao criar arquivo de metadados:", metadataError);
        return NextResponse.json(
          { error: `Erro ao criar metadados: ${metadataError.message}` },
          { status: 500 }
        );
      }

      // Obter URL pública dos metadados
      const { data: urlData } = supabaseAdmin.storage
        .from(bucket)
        .getPublicUrl(metadataPath);

      metadataUrl = urlData?.publicUrl;
      console.log(`✅ Upload completo! Metadados salvos em: ${metadataPath}`);
    }

    return NextResponse.json({
      success: true,
      chunkIndex,
      totalChunks,
      isComplete: chunkIndex === totalChunks - 1,
      metadataUrl,
      message:
        chunkIndex === totalChunks - 1
          ? `Upload completo! ${totalChunks} chunks processados.`
          : `Chunk ${chunkIndex + 1}/${totalChunks} enviado com sucesso`,
    });
  } catch (error: any) {
    console.error("❌ Erro na API de upload em chunks:", error);
    return NextResponse.json(
      {
        error: "Erro interno no upload em chunks",
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
      "API de upload de arquivos em chunks. Use POST com FormData contendo os parâmetros necessários.",
    parameters: {
      chunk: "File - O chunk a ser enviado",
      chunkIndex: "number - Índice do chunk (0-based)",
      totalChunks: "number - Total de chunks",
      fileName: "string - Nome base do arquivo",
      originalFileName: "string - Nome original do arquivo",
      fileSize: "number - Tamanho total do arquivo original",
      bucket: "string - Nome do bucket (opcional, padrão: 'spreadsheets')",
      folder: "string - Pasta dentro do bucket (opcional)",
    },
    limits: {
      maxChunkSize: "800KB",
      maxRetries: MAX_RETRIES,
      retryDelay: `${RETRY_DELAY}ms`,
    },
  });
}