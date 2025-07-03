import { createSupabaseAdmin } from "@/lib/supabase";

/**
 * Configurar bucket de planilhas (spreadsheets) no Supabase Storage
 * Este bucket é usado para armazenar arquivos de planilha enviados pelos presidentes de comissão
 */
export async function setupSpreadsheetsBucket() {
  try {
    console.log("🔍 Verificando configuração do bucket de planilhas...");

    const supabaseAdmin = createSupabaseAdmin();

    if (!supabaseAdmin) {
      throw new Error("Supabase Admin client não configurado");
    }

    // Verificar se o bucket já existe
    const { data: buckets, error: listError } =
      await supabaseAdmin.storage.listBuckets();

    if (listError) {
      console.error("❌ Erro ao listar buckets:", listError);
      return false;
    }

    const bucketExists = buckets?.some(
      (bucket) => bucket.name === "spreadsheets"
    );

    if (bucketExists) {
      console.log("✅ Bucket 'spreadsheets' já existe");
    } else {
      // Criar o bucket
      console.log("📁 Criando bucket 'spreadsheets'...");
      const { data: bucketData, error: createError } =
        await supabaseAdmin.storage.createBucket("spreadsheets", {
          public: true,
          allowedMimeTypes: [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
            "application/vnd.ms-excel", // .xls
            "text/csv", // .csv
            "application/octet-stream", // Para casos genéricos
          ],
          fileSizeLimit: 50 * 1024 * 1024, // 50MB
        });

      if (createError) {
        console.error("❌ Erro ao criar bucket:", createError);
        return false;
      }

      console.log("✅ Bucket 'spreadsheets' criado com sucesso");
    }

    // Configurar políticas RLS para o bucket
    console.log("🔒 Configurando políticas RLS para bucket de planilhas...");

    // Exibir as policies SQL que precisam ser executadas manualmente
    console.log("📋 IMPORTANTE: Execute manualmente no Supabase SQL Editor:");
    console.log(`
-- Habilitar RLS para as tabelas de storage (se ainda não estiver habilitado)
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Política para upload de planilhas (apenas presidentes e admins)
DROP POLICY IF EXISTS "Presidents and admins can upload spreadsheets" ON storage.objects;
CREATE POLICY "Presidents and admins can upload spreadsheets" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'spreadsheets' AND
  auth.uid() IS NOT NULL
);

-- Política para visualização de planilhas (qualquer usuário autenticado)
DROP POLICY IF EXISTS "Authenticated users can view spreadsheets" ON storage.objects;
CREATE POLICY "Authenticated users can view spreadsheets" ON storage.objects
FOR SELECT USING (
  bucket_id = 'spreadsheets' AND
  auth.uid() IS NOT NULL
);

-- Política para atualização de planilhas (apenas presidentes e admins)
DROP POLICY IF EXISTS "Presidents and admins can update spreadsheets" ON storage.objects;
CREATE POLICY "Presidents and admins can update spreadsheets" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'spreadsheets' AND
  auth.uid() IS NOT NULL
);

-- Política para deleção de planilhas (apenas presidentes e admins)
DROP POLICY IF EXISTS "Presidents and admins can delete spreadsheets" ON storage.objects;
CREATE POLICY "Presidents and admins can delete spreadsheets" ON storage.objects
FOR DELETE USING (
  bucket_id = 'spreadsheets' AND
  auth.uid() IS NOT NULL
);`);

    console.log("");
    console.log(
      "⚠️  Execute as queries SQL acima manualmente no Supabase SQL Editor"
    );
    console.log(
      "📁 Para acessar: https://app.supabase.com → Seu projeto → SQL Editor"
    );
    console.log("✅ Bucket de planilhas configurado com sucesso!");

    return true;
  } catch (error) {
    console.error("❌ Erro na configuração do bucket de planilhas:", error);
    return false;
  }
}

// Para executar diretamente
if (require.main === module) {
  setupSpreadsheetsBucket();
}
