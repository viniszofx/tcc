import { createClient } from "@supabase/supabase-js";

// Configurar cliente Supabase Admin
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Variáveis de ambiente do Supabase não configuradas");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export interface BucketConfig {
  name: string;
  public: boolean;
  allowedMimeTypes: string[];
  fileSizeLimit: number;
}

// Configurações predefinidas para diferentes tipos de bucket
export const BUCKET_CONFIGS: Record<string, BucketConfig> = {
  avatars: {
    name: "avatars",
    public: true,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    fileSizeLimit: 5 * 1024 * 1024, // 5MB
  },
  "inventory-files": {
    name: "inventory-files",
    public: true,
    allowedMimeTypes: [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
      "application/octet-stream",
      "application/pdf",
      "text/plain",
    ],
    fileSizeLimit: 50 * 1024 * 1024, // 50MB
  },
  documents: {
    name: "documents",
    public: false,
    allowedMimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ],
    fileSizeLimit: 20 * 1024 * 1024, // 20MB
  },
};

/**
 * Verifica se um bucket existe
 */
export async function bucketExists(bucketName: string): Promise<boolean> {
  try {
    const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();

    if (error) {
      console.error(`❌ Erro ao listar buckets: ${error.message}`);
      return false;
    }

    return buckets?.some((bucket) => bucket.name === bucketName) || false;
  } catch (error) {
    console.error("❌ Erro ao verificar bucket:", error);
    return false;
  }
}

/**
 * Cria um bucket automaticamente se não existir
 */
export async function ensureBucketExists(
  bucketName: string,
  customConfig?: Partial<BucketConfig>
): Promise<boolean> {
  try {
    console.log(`🔍 Verificando bucket '${bucketName}'...`);

    // Verificar se o bucket já existe
    const exists = await bucketExists(bucketName);

    if (exists) {
      console.log(`✅ Bucket '${bucketName}' já existe`);
      return true;
    }

    console.log(`🪣 Bucket '${bucketName}' não encontrado, criando...`);

    // Obter configuração do bucket
    const config = {
      ...BUCKET_CONFIGS[bucketName],
      ...customConfig,
    };

    if (!config.name) {
      config.name = bucketName;
      config.public = true;
      config.allowedMimeTypes = ["*/*"];
      config.fileSizeLimit = 10 * 1024 * 1024; // 10MB padrão
      console.warn(`⚠️ Usando configuração padrão para bucket '${bucketName}'`);
    }

    // Criar o bucket
    const { data, error } = await supabaseAdmin.storage.createBucket(
      bucketName,
      {
        public: config.public,
        allowedMimeTypes: config.allowedMimeTypes,
        fileSizeLimit: config.fileSizeLimit,
      }
    );

    if (error) {
      console.error(`❌ Erro ao criar bucket '${bucketName}':`, error);

      // Se o erro for sobre bucket já existente, considerar como sucesso
      if (
        error.message.includes("already exists") ||
        error.message.includes("Duplicate")
      ) {
        console.log(`✅ Bucket '${bucketName}' já existia`);
        return true;
      }

      return false;
    }

    console.log(`✅ Bucket '${bucketName}' criado com sucesso!`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao criar bucket '${bucketName}':`, error);
    return false;
  }
}

/**
 * Garante que múltiplos buckets existam
 */
export async function ensureMultipleBucketsExist(
  bucketNames: string[]
): Promise<Record<string, boolean>> {
  const results: Record<string, boolean> = {};

  for (const bucketName of bucketNames) {
    results[bucketName] = await ensureBucketExists(bucketName);
  }

  return results;
}

/**
 * Lista todos os buckets existentes
 */
export async function listBuckets(): Promise<string[]> {
  try {
    const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();

    if (error) {
      console.error("❌ Erro ao listar buckets:", error);
      return [];
    }

    return buckets?.map((bucket) => bucket.name) || [];
  } catch (error) {
    console.error("❌ Erro ao listar buckets:", error);
    return [];
  }
}

/**
 * Remove um bucket (use com cuidado!)
 */
export async function deleteBucket(bucketName: string): Promise<boolean> {
  try {
    console.log(`🗑️ Removendo bucket '${bucketName}'...`);

    const { error } = await supabaseAdmin.storage.deleteBucket(bucketName);

    if (error) {
      console.error(`❌ Erro ao remover bucket '${bucketName}':`, error);
      return false;
    }

    console.log(`✅ Bucket '${bucketName}' removido com sucesso`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao remover bucket '${bucketName}':`, error);
    return false;
  }
}
