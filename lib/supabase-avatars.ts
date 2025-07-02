import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Carregar variáveis de ambiente se não estiverem presentes
if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.SUPABASE_SERVICE_ROLE_KEY
) {
  config({ path: ".env" });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function setupAvatarsBucket() {
  try {
    // Verificar se o bucket já existe
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const avatarsBucket = buckets?.find((bucket) => bucket.name === "avatars");

    if (!avatarsBucket) {
      // Criar o bucket se não existir
      const { data, error } = await supabaseAdmin.storage.createBucket(
        "avatars",
        {
          public: true,
          allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
          fileSizeLimit: 5242880, // 5MB
        }
      );

      if (error) {
        console.error("Erro ao criar bucket de avatares:", error);
        return false;
      }

      console.log("Bucket de avatares criado com sucesso:", data);
    }

    // Configurar política RLS para o bucket
    const { error: policyError } = await supabaseAdmin.rpc(
      "create_avatars_policy"
    );

    if (policyError && !policyError.message.includes("already exists")) {
      console.error("Erro ao criar política RLS:", policyError);
    }

    return true;
  } catch (error) {
    console.error("Erro ao configurar bucket de avatares:", error);
    return false;
  }
}

export async function uploadAvatar(
  userId: string,
  file: File
): Promise<string | null> {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/avatar.${fileExt}`;

    // Fazer upload do arquivo
    const { data, error } = await supabaseAdmin.storage
      .from("avatars")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true, // Sobrescrever se já existir
      });

    if (error) {
      console.error("Erro ao fazer upload do avatar:", error);
      return null;
    }

    // Obter URL pública
    const { data: publicData } = supabaseAdmin.storage
      .from("avatars")
      .getPublicUrl(fileName);

    return publicData.publicUrl;
  } catch (error) {
    console.error("Erro ao fazer upload do avatar:", error);
    return null;
  }
}

export async function deleteAvatar(userId: string): Promise<boolean> {
  try {
    // Listar todos os arquivos do usuário
    const { data: files, error: listError } = await supabaseAdmin.storage
      .from("avatars")
      .list(userId);

    if (listError || !files || files.length === 0) {
      return true; // Se não há arquivos, considerar como sucesso
    }

    // Deletar todos os arquivos do usuário
    const filePaths = files.map((file) => `${userId}/${file.name}`);
    const { error: deleteError } = await supabaseAdmin.storage
      .from("avatars")
      .remove(filePaths);

    if (deleteError) {
      console.error("Erro ao deletar avatar:", deleteError);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao deletar avatar:", error);
    return false;
  }
}
