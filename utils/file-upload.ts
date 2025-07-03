import { supabase } from "@/lib/supabase";

/**
 * Faz upload de um arquivo diretamente para o Supabase Storage
 * @param file - Arquivo a ser enviado
 * @param bucket - Nome do bucket (padrão: 'spreadsheets')
 * @param folder - Pasta dentro do bucket (opcional)
 * @returns URL pública do arquivo
 */
export async function uploadFileToSupabase(
  file: File,
  bucket: string = "spreadsheets",
  folder?: string
): Promise<string | null> {
  try {
    // Verificar se as variáveis de ambiente estão configuradas
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      console.error(
        "❌ Erro: Variáveis de ambiente do Supabase não configuradas"
      );
      throw new Error(
        "Configuração do Supabase incompleta. Contate o administrador do sistema."
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

    console.log(`📁 Iniciando upload para: ${bucket}/${filePath}`);

    // Fazer upload do arquivo (com múltiplas tentativas)
    let uploadError = null;
    let data = null;

    for (let i = 0; i < 3; i++) {
      try {
        const result = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: i > 0, // Na primeira tentativa não faz upsert, nas seguintes sim
          });

        if (result.error) {
          uploadError = result.error;
          console.warn(`⚠️ Tentativa ${i + 1} de upload falhou:`, result.error);

          // Se o bucket não existir, tentar criar via API
          if (result.error.message.includes("Bucket not found")) {
            console.log("🔧 Tentando criar bucket via API...");

            try {
              const response = await fetch("/api/system/setup-bucket", {
                method: "POST",
              });

              if (response.ok) {
                console.log("✅ Bucket criado via API");
                // Continuar para próxima tentativa de upload
              } else {
                console.error("❌ Falha ao criar bucket via API");
              }
            } catch (setupError) {
              console.error("❌ Erro ao chamar API de setup:", setupError);
            }
          }

          await new Promise((resolve) => setTimeout(resolve, 1000)); // Espera 1 segundo entre tentativas
        } else {
          data = result.data;
          uploadError = null;
          break; // Upload bem-sucedido, sair do loop
        }
      } catch (e) {
        console.warn(`⚠️ Erro na tentativa ${i + 1} de upload:`, e);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (uploadError) {
      console.error("❌ Todas as tentativas de upload falharam:", uploadError);

      // Mensagens de erro personalizadas baseadas no tipo de erro
      if (uploadError.message.includes("Bucket not found")) {
        throw new Error(
          `O bucket '${bucket}' não foi encontrado. Por favor, contate o administrador do sistema para configurar o armazenamento.`
        );
      } else if (uploadError.message.includes("permission")) {
        throw new Error(
          `Sem permissão para fazer upload. Verifique se você está autenticado e tem acesso a este recurso.`
        );
      } else if (uploadError.message.includes("size")) {
        throw new Error(
          `O arquivo é muito grande. Tamanho máximo permitido: 50MB.`
        );
      } else {
        throw new Error(`Erro ao fazer upload: ${uploadError.message}`);
      }
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
    return null;
  }
}

/**
 * Remove um arquivo do Supabase Storage
 * @param fileUrl - URL do arquivo a ser removido
 * @param bucket - Nome do bucket (padrão: 'spreadsheets')
 */
export async function removeFileFromSupabase(
  fileUrl: string,
  bucket: string = "spreadsheets"
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
  bucket: string = "spreadsheets",
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

/**
 * Upload de arquivo usando API do servidor (fallback quando client-side falha)
 * @param file - Arquivo a ser enviado
 * @param bucket - Nome do bucket (padrão: 'spreadsheets')
 * @param folder - Pasta dentro do bucket (opcional)
 * @returns URL pública do arquivo
 */
export async function uploadFileViaAPI(
  file: File,
  bucket: string = "spreadsheets",
  folder?: string
): Promise<string | null> {
  try {
    console.log(`📁 Fazendo upload via API para: ${bucket}/${folder || ""}`);

    // Preparar FormData
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", bucket);
    if (folder) {
      formData.append("folder", folder);
    }

    // Enviar para API de upload
    const response = await fetch("/api/system/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro na API: ${errorData.error || "Desconhecido"}`);
    }

    const result = await response.json();

    if (result.success && result.url) {
      console.log(`✅ Upload via API concluído: ${result.url}`);
      return result.url;
    } else {
      throw new Error("Resposta da API inválida");
    }
  } catch (error) {
    console.error("❌ Erro no upload via API:", error);
    return null;
  }
}

/**
 * Upload inteligente: tenta client-side primeiro, depois via API se falhar
 * @param file - Arquivo a ser enviado
 * @param bucket - Nome do bucket (padrão: 'spreadsheets')
 * @param folder - Pasta dentro do bucket (opcional)
 * @returns URL pública do arquivo
 */
export async function uploadFileIntelligent(
  file: File,
  bucket: string = "spreadsheets",
  folder?: string
): Promise<string | null> {
  // Primeira tentativa: upload direto (client-side)
  console.log("🔄 Tentando upload client-side...");
  const clientResult = await uploadFileToSupabase(file, bucket, folder);

  if (clientResult) {
    console.log("✅ Upload client-side bem-sucedido");
    return clientResult;
  }

  // Segunda tentativa: upload via API (server-side)
  console.log("🔄 Tentando upload via API...");
  const apiResult = await uploadFileViaAPI(file, bucket, folder);

  if (apiResult) {
    console.log("✅ Upload via API bem-sucedido");
    return apiResult;
  }

  console.error("❌ Todas as tentativas de upload falharam");
  return null;
}
