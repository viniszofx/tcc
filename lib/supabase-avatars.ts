import { createClient } from "@supabase/supabase-js";
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

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function setupAvatarsPolicies() {
  try {
    console.log("🔒 Configurando políticas RLS para bucket de avatares...");

    console.log("📋 IMPORTANTE: Execute manualmente no Supabase SQL Editor:");
    console.log(`
-- Habilitar RLS para as tabelas de storage
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Política para upload de avatares
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
CREATE POLICY "Users can upload their own avatars" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Política para visualização de avatares  
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
CREATE POLICY "Anyone can view avatars" ON storage.objects 
FOR SELECT USING (bucket_id = 'avatars');

-- Política para atualização de avatares
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
CREATE POLICY "Users can update their own avatars" ON storage.objects 
FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Política para deleção de avatares
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
CREATE POLICY "Users can delete their own avatars" ON storage.objects 
FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
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

export async function setupAvatarsBucket() {
  try {
    console.log("🔍 Verificando configuração do bucket de avatares...");

    // Verificar se as variáveis de ambiente estão configuradas
    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn("⚠️ Variáveis de ambiente do Supabase não configuradas");
      console.log(
        "📝 Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY"
      );
      return false;
    }

    // Verificar se o bucket já existe
    const { data: buckets, error: listError } =
      await supabaseAdmin.storage.listBuckets();

    if (listError) {
      console.error("❌ Erro ao listar buckets:", listError);
      return false;
    }

    const avatarsBucket = buckets?.find((bucket) => bucket.name === "avatars");

    if (avatarsBucket) {
      console.log("✅ Bucket 'avatars' já existe");
      // Configurar políticas RLS para o bucket
      await setupAvatarsPolicies();
      return true;
    }

    console.log("📁 Criando bucket 'avatars'...");

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
      console.error("❌ Erro ao criar bucket de avatares:", error);
      console.log("💡 Verifique se:");
      console.log("   - As credenciais do Supabase estão corretas");
      console.log("   - O service role key tem permissões adequadas");
      console.log("   - O projeto Supabase está ativo");
      return false;
    }

    console.log("✅ Bucket 'avatars' criado com sucesso!");

    // Configurar políticas RLS para o bucket
    await setupAvatarsPolicies();

    return true;
  } catch (error) {
    console.error("❌ Erro ao configurar bucket de avatares:", error);
    console.log(
      "💡 Este erro pode ser ignorado se o Supabase não estiver disponível durante o build"
    );
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

    // Tentar fazer upload do arquivo
    let { data, error } = await supabaseAdmin.storage
      .from("avatars")
      .upload(fileName, file, {
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
        "🔧 Bucket 'avatars' não encontrado, criando automaticamente..."
      );

      // Criar o bucket
      const bucketCreated = await setupAvatarsBucket();

      if (bucketCreated) {
        console.log("✅ Bucket criado, tentando upload novamente...");

        // Tentar upload novamente após criar o bucket
        const uploadResult = await supabaseAdmin.storage
          .from("avatars")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: true,
          });

        data = uploadResult.data;
        error = uploadResult.error;
      } else {
        console.error("❌ Falha ao criar bucket 'avatars'");
        return null;
      }
    }

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

    // Se erro indica que bucket não existe, considerar como sucesso
    if (
      listError &&
      (listError.message.includes("Bucket not found") ||
        listError.message.includes("The resource was not found"))
    ) {
      console.log(
        "ℹ️ Bucket 'avatars' não encontrado - considerando deleção como bem-sucedida"
      );
      return true;
    }

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

    console.log(`✅ Avatar(s) do usuário ${userId} deletado(s) com sucesso`);
    return true;
  } catch (error) {
    console.error("Erro ao deletar avatar:", error);
    return false;
  }
}
