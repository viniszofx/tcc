import { createSupabaseAdmin } from "@/lib/supabase";
import { config } from "dotenv";

// Carregar variáveis de ambiente se não estiverem presentes
if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.SUPABASE_SERVICE_ROLE_KEY
) {
  // Só carregar .env se não estivermos em produção/CI
  if (process.env.NODE_ENV !== "production" && !process.env.CI) {
    config({ path: ".env" });
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Função para obter cliente admin
const getSupabaseAdmin = () => {
  return createSupabaseAdmin();
};

async function setupSpreadsheetsPolicies() {
  try {
    console.log("🔒 Configurando políticas RLS para bucket de planilhas...");

    console.log("📋 IMPORTANTE: Execute manualmente no Supabase SQL Editor:");
    console.log(`
-- Habilitar RLS para as tabelas de storage
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Política para upload de planilhas
DROP POLICY IF EXISTS "Users can upload spreadsheet files" ON storage.objects;
CREATE POLICY "Users can upload spreadsheet files" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'spreadsheets' AND auth.uid() IS NOT NULL);

-- Política para visualização de planilhas  
DROP POLICY IF EXISTS "Anyone can view spreadsheet files" ON storage.objects;
CREATE POLICY "Anyone can view spreadsheet files" ON storage.objects 
FOR SELECT USING (bucket_id = 'spreadsheets');

-- Política para atualização de planilhas
DROP POLICY IF EXISTS "Users can update spreadsheet files" ON storage.objects;
CREATE POLICY "Users can update spreadsheet files" ON storage.objects 
FOR UPDATE USING (bucket_id = 'spreadsheets' AND auth.uid() IS NOT NULL);

-- Política para deleção de planilhas
DROP POLICY IF EXISTS "Users can delete spreadsheet files" ON storage.objects;
CREATE POLICY "Users can delete spreadsheet files" ON storage.objects 
FOR DELETE USING (bucket_id = 'spreadsheets' AND auth.uid() IS NOT NULL);
    `);

    console.log(
      "⚠️  Execute as queries SQL acima manualmente no Supabase SQL Editor"
    );
    console.log(
      "📁 Para acessar: https://app.supabase.com → Seu projeto → SQL Editor"
    );
  } catch (error) {
    console.error("❌ Erro ao configurar políticas RLS:", error);
  }
}

export async function setupSpreadsheetsBucket() {
  try {
    console.log("🔍 Verificando configuração do bucket de planilhas...");

    // Verificar se as variáveis de ambiente estão configuradas
    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn("⚠️ Variáveis de ambiente do Supabase não configuradas");
      console.log(
        "📝 Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY"
      );
      return false;
    }

    // Verificar se o bucket já existe
    const supabaseAdmin = getSupabaseAdmin();
    const { data: buckets, error: listError } =
      await supabaseAdmin.storage.listBuckets();

    if (listError) {
      console.error("❌ Erro ao listar buckets:", listError);
      return false;
    }

    const spreadsheetsBucket = buckets?.find((bucket) => bucket.name === "spreadsheets");

    if (spreadsheetsBucket) {
      console.log("✅ Bucket 'spreadsheets' já existe");
      // Configurar políticas RLS para o bucket
      await setupSpreadsheetsPolicies();
      return true;
    }

    console.log("📁 Criando bucket 'spreadsheets'...");

    // Criar o bucket se não existir
    const { data, error } = await supabaseAdmin.storage.createBucket(
      "spreadsheets",
      {
        public: true,
        allowedMimeTypes: [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
          "application/vnd.ms-excel", // .xls
          "text/csv", // .csv
          "application/octet-stream", // Para casos genéricos
        ],
        fileSizeLimit: 50 * 1024 * 1024, // 50MB
      }
    );

    if (error) {
      console.error("❌ Erro ao criar bucket de planilhas:", error);
      console.log("💡 Verifique se:");
      console.log("   - As credenciais do Supabase estão corretas");
      console.log("   - O service role key tem permissões adequadas");
      console.log("   - O projeto Supabase está ativo");
      return false;
    }

    console.log("✅ Bucket 'spreadsheets' criado com sucesso!");

    // Configurar políticas RLS para o bucket
    await setupSpreadsheetsPolicies();

    return true;
  } catch (error) {
    console.error("❌ Erro ao configurar bucket de planilhas:", error);
    console.log(
      "💡 Este erro pode ser ignorado se o Supabase não estiver disponível durante o build"
    );
    return false;
  }
}

/**
 * Deleta todas as planilhas de uma comissão específica
 * @param commissionId - ID da comissão
 * @returns Promise<boolean> - true se sucesso, false se erro
 */
export async function deleteCommissionSpreadsheets(commissionId: string): Promise<boolean> {
  try {
    // Listar todos os arquivos da comissão
    const supabaseAdmin = getSupabaseAdmin();
    const { data: files, error: listError } = await supabaseAdmin.storage
      .from("spreadsheets")
      .list(`commissions/${commissionId}`);

    // Se erro indica que bucket não existe, considerar como sucesso
    if (
      listError &&
      (listError.message.includes("Bucket not found") ||
        listError.message.includes("The resource was not found"))
    ) {
      console.log(
        "ℹ️ Bucket 'spreadsheets' não encontrado - considerando deleção como bem-sucedida"
      );
      return true;
    }

    if (listError || !files || files.length === 0) {
      console.log(`ℹ️ Nenhum arquivo encontrado para a comissão ${commissionId}`);
      return true; // Se não há arquivos, considerar como sucesso
    }

    // Deletar todos os arquivos da comissão
    const filePaths = files.map((file) => `commissions/${commissionId}/${file.name}`);
    const { error: deleteError } = await supabaseAdmin.storage
      .from("spreadsheets")
      .remove(filePaths);

    if (deleteError) {
      console.error("Erro ao deletar planilhas da comissão:", deleteError);
      return false;
    }

    console.log(`✅ ${filePaths.length} planilha(s) da comissão ${commissionId} deletada(s) com sucesso`);
    return true;
  } catch (error) {
    console.error("Erro ao deletar planilhas da comissão:", error);
    return false;
  }
}

/**
 * Faz upload de uma planilha para uma comissão específica
 * Deleta arquivos antigos antes de fazer o upload do novo
 * @param commissionId - ID da comissão
 * @param file - Arquivo a ser enviado
 * @returns Promise<string | null> - URL pública do arquivo ou null se falhar
 */
export async function uploadCommissionSpreadsheet(
  file: File | Blob,
  commissionId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Primeiro, deletar todas as planilhas antigas da comissão
    console.log(`🗑️ Deletando planilhas antigas da comissão ${commissionId}...`);
    const deleteSuccess = await deleteCommissionSpreadsheets(commissionId);
    
    if (!deleteSuccess) {
      console.warn("⚠️ Falha ao deletar planilhas antigas, continuando com upload...");
    }

    // Gerar nome único para o arquivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileExtension = file instanceof File ? file.name.split(".").pop() : "xlsx";
    const fileName = `planilha-${timestamp}.${fileExtension}`;
    const filePath = `commissions/${commissionId}/${fileName}`;

    // Tentar fazer upload do arquivo
    const supabaseAdmin = getSupabaseAdmin();
    let { data, error } = await supabaseAdmin.storage
      .from("spreadsheets")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true, // Sobrescrever se já existir
      });

    // Se erro indica que bucket não existe, criar automaticamente
    if (
      error &&
      (error.message.includes("Bucket not found") ||
        error.message.includes("The resource was not found"))
    ) {
      console.log(
        "🔧 Bucket 'spreadsheets' não encontrado, criando automaticamente..."
      );

      // Criar o bucket
      const bucketCreated = await setupSpreadsheetsBucket();

      if (bucketCreated) {
        console.log("✅ Bucket criado, tentando upload novamente...");

        // Tentar upload novamente após criar o bucket
        const uploadResult = await supabaseAdmin.storage
          .from("spreadsheets")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true,
          });

        data = uploadResult.data;
        error = uploadResult.error;
      } else {
        console.error("❌ Falha ao criar bucket 'spreadsheets'");
        return { success: false, error: "Falha ao criar bucket 'spreadsheets'" };
      }
    }

    if (error) {
      console.error("Erro ao fazer upload da planilha:", error);
      return { success: false, error: error.message };
    }

    // Obter URL pública
    const { data: publicData } = supabaseAdmin.storage
      .from("spreadsheets")
      .getPublicUrl(filePath);

    console.log(`✅ Planilha da comissão ${commissionId} enviada com sucesso: ${publicData.publicUrl}`);
    return { success: true, url: publicData.publicUrl };
  } catch (error) {
    console.error("Erro ao fazer upload da planilha:", error);
    return { success: false, error: error instanceof Error ? error.message : "Erro desconhecido" };
  }
}

// Manter funções antigas para compatibilidade (deprecated)
export async function uploadSpreadsheet(
  fileName: string,
  file: File | Blob,
  folder?: string
): Promise<string | null> {
  console.warn("⚠️ uploadSpreadsheet está deprecated. Use uploadCommissionSpreadsheet.");
  
  try {
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    const supabaseAdmin = getSupabaseAdmin();
    let { data, error } = await supabaseAdmin.storage
      .from("spreadsheets")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (
      error &&
      (error.message.includes("Bucket not found") ||
        error.message.includes("The resource was not found"))
    ) {
      const bucketCreated = await setupSpreadsheetsBucket();

      if (bucketCreated) {
        const uploadResult = await supabaseAdmin.storage
          .from("spreadsheets")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true,
          });

        data = uploadResult.data;
        error = uploadResult.error;
      } else {
        return null;
      }
    }

    if (error) {
      console.error("Erro ao fazer upload da planilha:", error);
      return null;
    }

    const { data: publicData } = supabaseAdmin.storage
      .from("spreadsheets")
      .getPublicUrl(filePath);

    return publicData.publicUrl;
  } catch (error) {
    console.error("Erro ao fazer upload da planilha:", error);
    return null;
  }
}

export async function deleteSpreadsheet(filePath: string): Promise<boolean> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.storage
      .from("spreadsheets")
      .remove([filePath]);

    if (
      error &&
      (error.message.includes("Bucket not found") ||
        error.message.includes("The resource was not found"))
    ) {
      console.log(
        "ℹ️ Bucket 'spreadsheets' não encontrado - considerando deleção como bem-sucedida"
      );
      return true;
    }

    if (error) {
      console.error("Erro ao deletar planilha:", error);
      return false;
    }

    console.log(`✅ Planilha ${filePath} deletada com sucesso`);
    return true;
  } catch (error) {
    console.error("Erro ao deletar planilha:", error);
    return false;
  }
}

export async function listSpreadsheets(folder?: string): Promise<any[] | null> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data: files, error } = await supabaseAdmin.storage
      .from("spreadsheets")
      .list(folder || "");

    if (error) {
      console.error("Erro ao listar planilhas:", error);
      return null;
    }

    return files || [];
  } catch (error) {
    console.error("Erro ao listar planilhas:", error);
    return null;
  }
}
