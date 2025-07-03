import { supabase } from "@/lib/supabase";
import { ensureBucketExists } from "@/lib/supabase-bucket-manager";

/**
 * Faz upload de um arquivo diretamente para o Supabase Storage
 * @param file - Arquivo a ser enviado
 * @param bucket - Nome do bucket (padrão: 'inventory-files')
 * @param folder - Pasta dentro do bucket (opcional)
 * @returns URL pública do arquivo
 */
export async function uploadFileToSupabase(
  file: File,
  bucket: string = "inventory-files",
  folder?: string
): Promise<string> {
  try {
    // Verificar se as variáveis de ambiente estão configuradas
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      throw new Error(
        "Variáveis de ambiente do Supabase não configuradas. Verifique NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
    }

    // Garantir que o bucket existe
    await ensureBucketExists(bucket);

    // Gerar nome único para o arquivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileExtension = file.name.split(".").pop();
    const fileName = `${timestamp}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExtension}`;

    // Construir caminho do arquivo
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    console.log(`📁 Iniciando upload para: ${bucket}/${filePath}`);

    // Fazer upload do arquivo
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("❌ Erro no upload:", error);
      throw new Error(`Erro ao fazer upload: ${error.message}`);
    }

    console.log("✅ Upload concluído:", data);

    // Obter URL pública do arquivo
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error("Erro ao obter URL pública do arquivo");
    }

    console.log(`🔗 URL pública gerada: ${urlData.publicUrl}`);
    return urlData.publicUrl;
  } catch (error) {
    console.error("❌ Erro no uploadFileToSupabase:", error);
    throw error;
  }
}

/**
 * Remove um arquivo do Supabase Storage
 * @param fileUrl - URL do arquivo a ser removido
 * @param bucket - Nome do bucket (padrão: 'inventory-files')
 */
export async function removeFileFromSupabase(
  fileUrl: string,
  bucket: string = "inventory-files"
): Promise<void> {
  try {
    // Extrair o caminho do arquivo da URL
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split("/");
    const bucketIndex = pathParts.indexOf(bucket);

    if (bucketIndex === -1 || bucketIndex >= pathParts.length - 1) {
      throw new Error("URL do arquivo inválida");
    }

    const filePath = pathParts.slice(bucketIndex + 1).join("/");

    console.log(`🗑️ Removendo arquivo: ${bucket}/${filePath}`);

    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      console.error("❌ Erro ao remover arquivo:", error);
      throw new Error(`Erro ao remover arquivo: ${error.message}`);
    }

    console.log("✅ Arquivo removido com sucesso");
  } catch (error) {
    console.error("❌ Erro no removeFileFromSupabase:", error);
    throw error;
  }
}

/**
 * Lista arquivos em um bucket/pasta
 * @param bucket - Nome do bucket
 * @param folder - Pasta (opcional)
 * @param limit - Limite de arquivos (padrão: 100)
 */
export async function listFiles(
  bucket: string = "inventory-files",
  folder?: string,
  limit: number = 100
) {
  try {
    const { data, error } = await supabase.storage.from(bucket).list(folder, {
      limit,
      sortBy: { column: "created_at", order: "desc" },
    });

    if (error) {
      throw new Error(`Erro ao listar arquivos: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error("❌ Erro no listFiles:", error);
    throw error;
  }
}
