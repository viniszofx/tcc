import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Função para configurar o bucket do Supabase
async function setupInventoryBucket() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Verificar se as variáveis de ambiente necessárias estão configuradas
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error(
        "❌ Erro: Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias"
      );
      return {
        success: false,
        error: "Variáveis de ambiente não configuradas",
      };
    }

    // Criar cliente Supabase com a chave de serviço (admin)
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log("🔍 Verificando buckets existentes...");

    // Listar buckets existentes
    const { data: existingBuckets, error: listError } =
      await supabase.storage.listBuckets();

    if (listError) {
      console.error("❌ Erro ao listar buckets:", listError);
      return { success: false, error: listError };
    }

    // Verificar se o bucket inventory-files já existe
    const inventoryBucket = existingBuckets?.find(
      (bucket) => bucket.name === "inventory-files"
    );

    if (inventoryBucket) {
      console.log("✅ Bucket inventory-files já existe");
    } else {
      console.log("🏗️ Criando bucket inventory-files...");

      // Criar o bucket inventory-files
      const { data, error: createError } = await supabase.storage.createBucket(
        "inventory-files",
        {
          public: true,
          allowedMimeTypes: [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
            "application/vnd.ms-excel", // .xls
            "text/csv", // .csv
            "application/octet-stream", // Para casos genéricos
            "application/pdf", // PDF
            "text/plain", // .txt
            "image/jpeg", // .jpg
            "image/png", // .png
          ],
          fileSizeLimit: 50 * 1024 * 1024, // 50MB
        }
      );

      if (createError) {
        console.error("❌ Erro ao criar bucket inventory-files:", createError);
        return { success: false, error: createError };
      }

      console.log("✅ Bucket inventory-files criado com sucesso");
    }

    return { success: true };
  } catch (error) {
    console.error("❌ Erro ao configurar bucket:", error);
    return { success: false, error };
  }
}

// Handler para rota de API no formato App Router
export async function POST(request: NextRequest) {
  try {
    const result = await setupInventoryBucket();

    if (result.success) {
      return NextResponse.json({ message: "Bucket configurado com sucesso" });
    } else {
      return NextResponse.json(
        { error: "Falha ao configurar bucket", details: result.error },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("❌ Erro na API de configuração de bucket:", error);
    return NextResponse.json(
      {
        error: "Erro interno ao configurar bucket",
        details: error?.message || "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

// Handler para responder à requisição GET
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { message: "Use POST para configurar o bucket inventory-files" },
    { status: 200 }
  );
}
