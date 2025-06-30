import { createClient } from "@supabase/supabase-js";

/**
 * Script para configurar o bucket de spreadsheets no Supabase Storage
 * Execute este script fornecendo as credenciais corretas do Supabase
 */
async function setupSupabaseBucket(
  supabaseUrl?: string,
  supabaseServiceKey?: string
) {
  try {
    // Usar credenciais fornecidas ou variáveis de ambiente
    const url = supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey =
      supabaseServiceKey || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      console.error("❌ Credenciais necessárias:");
      console.error("- URL do projeto Supabase");
      console.error("- Service Role Key do Supabase");
      console.error(
        '\nUsage: setupSupabaseBucket("https://seu-projeto.supabase.co", "sua-service-role-key")'
      );
      return false;
    }

    console.log("🔧 Conectando ao Supabase...");
    console.log(`📍 URL: ${url}`);

    const supabaseAdmin = createClient(url, serviceKey, {
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
      console.error("💡 Verifique se:");
      console.error("  - A URL do Supabase está correta");
      console.error("  - A Service Role Key está correta");
      console.error("  - O projeto Supabase está ativo");
      return false;
    }

    console.log(
      `📦 Buckets existentes: ${
        buckets?.map((b) => b.name).join(", ") || "nenhum"
      }`
    );

    const bucketExists = buckets?.some(
      (bucket) => bucket.name === "spreadsheets"
    );

    if (bucketExists) {
      console.log('✅ Bucket "spreadsheets" já existe');
    } else {
      console.log('📦 Criando bucket "spreadsheets"...');

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
        return false;
      }

      console.log('✅ Bucket "spreadsheets" criado com sucesso');
    }

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
      return false;
    } else {
      console.log("✅ Teste de upload bem-sucedido");

      // Limpar arquivo de teste
      const { error: removeError } = await supabaseAdmin.storage
        .from("spreadsheets")
        .remove([testFileName]);

      if (!removeError) {
        console.log("🧹 Arquivo de teste removido");
      }
    }

    console.log("");
    console.log("🎉 Configuração concluída com sucesso!");
    console.log('📋 O bucket "spreadsheets" está pronto para uso');
    console.log(
      "🔐 Lembre-se de configurar as políticas RLS no Supabase Dashboard se necessário"
    );

    return true;
  } catch (error) {
    console.error("❌ Erro na configuração do bucket:", error);
    return false;
  }
}

// Para executar diretamente com argumentos da linha de comando
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length >= 2) {
    // Usar argumentos da linha de comando
    setupSupabaseBucket(args[0], args[1]);
  } else {
    // Tentar usar variáveis de ambiente
    setupSupabaseBucket();
  }
}

export { setupSupabaseBucket };
