import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Carregar variáveis de ambiente
config({ path: ".env.local" });

/**
 * Script para configurar o bucket de spreadsheets no Supabase Storage
 * Execute este script uma vez para configurar o bucket
 */
async function setupSupabaseBucket() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ Variáveis de ambiente necessárias:");
      console.error("NEXT_PUBLIC_SUPABASE_URL");
      console.error("SUPABASE_SERVICE_ROLE_KEY");
      console.error(
        "\nVerifique se o arquivo .env.local está configurado corretamente."
      );
      process.exit(1);
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log("🔧 Configurando bucket de spreadsheets...");

    // Verificar se o bucket já existe
    const { data: buckets, error: listError } =
      await supabaseAdmin.storage.listBuckets();

    if (listError) {
      console.error("❌ Erro ao listar buckets:", listError);
      return;
    }

    const bucketExists = buckets?.some(
      (bucket) => bucket.name === "spreadsheets"
    );

    if (bucketExists) {
      console.log('✅ Bucket "spreadsheets" já existe');
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

      console.log('✅ Bucket "spreadsheets" criado com sucesso');
    }

    // Verificar políticas de acesso
    console.log("📋 Configuração do bucket concluída");
    console.log(
      "🔐 Lembre-se de configurar as políticas RLS no Supabase Dashboard se necessário"
    );

    // Testar upload básico
    console.log("🧪 Testando funcionalidade básica do bucket...");
    const testContent = "test,content\n1,2";
    const testFileName = `test-${Date.now()}.csv`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("spreadsheets")
      .upload(testFileName, testContent, {
        contentType: "text/csv",
      });

    if (uploadError) {
      console.error("❌ Erro no teste de upload:", uploadError);
    } else {
      console.log("✅ Teste de upload bem-sucedido");

      // Limpar arquivo de teste
      await supabaseAdmin.storage.from("spreadsheets").remove([testFileName]);
      console.log("🧹 Arquivo de teste removido");
    }
  } catch (error) {
    console.error("❌ Erro na configuração do bucket:", error);
  }
}

// Executar o script
if (require.main === module) {
  setupSupabaseBucket();
}

export { setupSupabaseBucket };
