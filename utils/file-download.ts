import { supabase } from "@/lib/supabase";

/**
 * Faz download de um arquivo do Supabase Storage
 * @param fileUrl - URL do arquivo no Supabase Storage
 * @param fileName - Nome do arquivo para download (opcional)
 */
export async function downloadFileFromSupabase(
  fileUrl: string,
  fileName?: string
): Promise<void> {
  try {
    console.log(`📥 Iniciando download do arquivo: ${fileUrl}`);

    // Extrair informações da URL
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split("/");
    
    // Encontrar o bucket e o caminho do arquivo
    const bucketIndex = pathParts.findIndex(part => 
      part === "spreadsheets" || part === "avatars" || part === "storage"
    );
    
    if (bucketIndex === -1) {
      throw new Error("URL do arquivo inválida - bucket não encontrado");
    }

    const bucket = pathParts[bucketIndex];
    const filePath = pathParts.slice(bucketIndex + 1).join("/");

    console.log(`📁 Bucket: ${bucket}, Caminho: ${filePath}`);

    // Fazer download do arquivo
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(filePath);

    if (error) {
      console.error("❌ Erro ao fazer download:", error);
      throw new Error(`Erro ao fazer download: ${error.message}`);
    }

    if (!data) {
      throw new Error("Arquivo não encontrado");
    }

    // Criar blob e URL para download
    const blob = new Blob([data]);
    const downloadUrl = window.URL.createObjectURL(blob);

    // Determinar nome do arquivo
    const finalFileName = fileName || filePath.split("/").pop() || "arquivo";

    // Criar elemento de download temporário
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = finalFileName;
    document.body.appendChild(link);
    
    // Executar download
    link.click();
    
    // Limpar recursos
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    console.log(`✅ Download concluído: ${finalFileName}`);
  } catch (error) {
    console.error("❌ Erro no downloadFileFromSupabase:", error);
    throw error;
  }
}

/**
 * Verifica se uma URL é válida para download
 * @param fileUrl - URL do arquivo
 * @returns true se a URL é válida
 */
export function isValidFileUrl(fileUrl: string | null | undefined): boolean {
  if (!fileUrl) return false;
  
  try {
    const url = new URL(fileUrl);
    return url.pathname.includes("/storage/v1/object/public/");
  } catch {
    return false;
  }
}

/**
 * Extrai o nome do arquivo de uma URL
 * @param fileUrl - URL do arquivo
 * @returns Nome do arquivo ou null se não conseguir extrair
 */
export function extractFileNameFromUrl(fileUrl: string): string | null {
  try {
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split("/");
    return pathParts[pathParts.length - 1] || null;
  } catch {
    return null;
  }
}

/**
 * Obtém a extensão do arquivo de uma URL
 * @param fileUrl - URL do arquivo
 * @returns Extensão do arquivo (ex: "xlsx", "csv") ou null
 */
export function getFileExtensionFromUrl(fileUrl: string): string | null {
  const fileName = extractFileNameFromUrl(fileUrl);
  if (!fileName) return null;
  
  const lastDotIndex = fileName.lastIndexOf(".");
  if (lastDotIndex === -1) return null;
  
  return fileName.substring(lastDotIndex + 1).toLowerCase();
}

/**
 * Obtém o ícone apropriado baseado na extensão do arquivo
 * @param fileUrl - URL do arquivo
 * @returns Nome do ícone Lucide
 */
export function getFileIcon(fileUrl: string): string {
  const extension = getFileExtensionFromUrl(fileUrl);
  
  switch (extension) {
    case "xlsx":
    case "xls":
      return "FileSpreadsheet";
    case "csv":
      return "FileText";
    case "pdf":
      return "FileText";
    case "doc":
    case "docx":
      return "FileText";
    default:
      return "Download";
  }
}