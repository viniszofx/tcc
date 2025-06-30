import { createSupabaseAdmin } from "@/lib/supabase";
import { config } from "dotenv";

// Carregar variáveis de ambiente
config({ path: ".env.local" });

/**
 * Script para configurar o bucket de spreadsheets no Supabase Storage
 * Execute este script uma vez para configurar o bucket
 */
export async function setupSupabaseBucket() {
  try {
    const supabaseAdmin = createSupabaseAdmin();

    if (!supabaseAdmin) {
      throw new Error("Supabase Admin client não configurado");
    }

    // Verificar se o bucket já existe
    const { data: buckets, error: listError } =
      await supabaseAdmin.storage.listBuckets();

    if (listError) {
      console.error("Erro ao listar buckets:", listError);
      return;
    }

    const bucketExists = buckets?.some(
      (bucket) => bucket.name === "spreadsheets"
    );

    if (bucketExists) {
      console.log("✅ Bucket 'spreadsheets' já existe");
    } else {
      // Criar o bucket
      const { data: bucketData, error: createError } =
        await supabaseAdmin.storage.createBucket("spreadsheets", {
          public: true,
          allowedMimeTypes: [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
            "application/vnd.ms-excel", // .xls
            "text/csv", // .csv
          ],
          fileSizeLimit: 50 * 1024 * 1024, // 50MB
        });

      if (createError) {
        console.error("❌ Erro ao criar bucket:", createError);
        return;
      }

      console.log("✅ Bucket 'spreadsheets' criado com sucesso");
    }

    // Verificar/configurar políticas de acesso
    console.log("📋 Configuração do bucket concluída");
    console.log(
      "🔐 Lembre-se de configurar as políticas RLS no Supabase Dashboard se necessário"
    );
  } catch (error) {
    console.error("❌ Erro na configuração do bucket:", error);
  }
}

// Para executar diretamente
if (require.main === module) {
  setupSupabaseBucket();
}
