import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

// Configurar cliente Supabase para operações administrativas
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

async function cleanSupabaseStoragePolicies() {
  try {
    console.log("🔒 Limpando políticas RLS do Supabase Storage...");

    // Queries para remover políticas relacionadas ao storage
    const policyQueries = [
      // Remover políticas específicas do bucket avatars
      'DROP POLICY IF EXISTS "Users can view own avatar" ON storage.objects;',
      'DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;',
      'DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;',
      'DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;',
      'DROP POLICY IF EXISTS "Public avatars are viewable by everyone" ON storage.objects;',
      'DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;',

      // Remover outras possíveis políticas de storage
      'DROP POLICY IF EXISTS "authenticated can view" ON storage.objects;',
      'DROP POLICY IF EXISTS "authenticated can upload" ON storage.objects;',
      'DROP POLICY IF EXISTS "authenticated can update" ON storage.objects;',
      'DROP POLICY IF EXISTS "authenticated can delete" ON storage.objects;',
      'DROP POLICY IF EXISTS "public can view" ON storage.objects;',

      // Remover políticas do bucket (caso existam)
      'DROP POLICY IF EXISTS "Users can view own bucket" ON storage.buckets;',
      'DROP POLICY IF EXISTS "Users can manage buckets" ON storage.buckets;',
      'DROP POLICY IF EXISTS "Public buckets are viewable" ON storage.buckets;',
    ];

    for (const query of policyQueries) {
      try {
        const { error } = await supabaseAdmin.rpc("exec_sql", { sql: query });
        if (error && !error.message.includes("does not exist")) {
          console.warn(`⚠️  Aviso ao executar query: ${query}`, error.message);
        }
      } catch (error: any) {
        // Ignorar erros de políticas que não existem
        if (
          !error.message?.includes("does not exist") &&
          !error.message?.includes("does not exist")
        ) {
          console.warn(`⚠️  Aviso ao remover política: ${error.message}`);
        }
      }
    }

    // Tentar remover funções/triggers relacionadas ao storage (se existirem)
    const functionQueries = [
      "DROP FUNCTION IF EXISTS handle_avatar_upload() CASCADE;",
      "DROP FUNCTION IF EXISTS validate_avatar_upload() CASCADE;",
      "DROP FUNCTION IF EXISTS cleanup_old_avatars() CASCADE;",
      "DROP TRIGGER IF EXISTS on_avatar_upload ON storage.objects CASCADE;",
      "DROP TRIGGER IF EXISTS on_avatar_delete ON storage.objects CASCADE;",
    ];

    for (const query of functionQueries) {
      try {
        const { error } = await supabaseAdmin.rpc("exec_sql", { sql: query });
        if (error && !error.message.includes("does not exist")) {
          console.warn(`⚠️  Aviso ao executar query: ${query}`, error.message);
        }
      } catch (error: any) {
        // Ignorar erros de funções que não existem
        if (!error.message?.includes("does not exist")) {
          console.warn(`⚠️  Aviso ao remover função/trigger: ${error.message}`);
        }
      }
    }

    console.log("✅ Limpeza de políticas RLS do Storage concluída!");
  } catch (error) {
    console.error("❌ Erro na limpeza de políticas RLS do Storage:", error);
    // Não lançar erro aqui para não interromper o processo de limpeza
  }
}

async function cleanSupabaseBuckets() {
  try {
    console.log("🗂️  Limpando buckets do Supabase Storage...");

    // Listar todos os buckets
    const { data: buckets, error: listError } =
      await supabaseAdmin.storage.listBuckets();

    if (listError) {
      console.error("❌ Erro ao listar buckets:", listError);
      return;
    }

    if (!buckets || buckets.length === 0) {
      console.log("ℹ️  Nenhum bucket encontrado no Supabase Storage");
      return;
    }

    console.log(`🔍 Encontrados ${buckets.length} buckets para limpar`);

    // Para cada bucket, limpar arquivos e deletar o bucket
    for (const bucket of buckets) {
      console.log(`🗑️  Processando bucket: ${bucket.name}`);

      try {
        // Listar todos os arquivos no bucket (incluindo em subpastas)
        const { data: files, error: listFilesError } =
          await supabaseAdmin.storage.from(bucket.name).list("", {
            limit: 1000,
            sortBy: { column: "name", order: "asc" },
          });

        if (listFilesError) {
          console.error(
            `❌ Erro ao listar arquivos do bucket ${bucket.name}:`,
            listFilesError
          );
          continue;
        }

        // Função recursiva para buscar todos os arquivos incluindo em subpastas
        async function getAllFiles(path = ""): Promise<string[]> {
          const { data: items, error } = await supabaseAdmin.storage
            .from(bucket.name)
            .list(path, {
              limit: 1000,
              sortBy: { column: "name", order: "asc" },
            });

          if (error) {
            console.error(`❌ Erro ao listar arquivos em ${path}:`, error);
            return [];
          }

          if (!items) return [];

          const allFiles: string[] = [];

          for (const item of items) {
            const fullPath = path ? `${path}/${item.name}` : item.name;

            if (item.metadata?.mimetype || !item.name.endsWith("/")) {
              // É um arquivo
              allFiles.push(fullPath);
            } else {
              // É uma pasta, buscar recursivamente
              const subFiles = await getAllFiles(fullPath);
              allFiles.push(...subFiles);
            }
          }

          return allFiles;
        }

        // Buscar todos os arquivos incluindo subpastas
        const allFiles = await getAllFiles();

        // Deletar todos os arquivos se existirem
        if (allFiles && allFiles.length > 0) {
          console.log(
            `📁 Deletando ${allFiles.length} arquivos do bucket ${bucket.name}`
          );

          // Deletar em lotes para evitar timeouts
          const batchSize = 100;
          for (let i = 0; i < allFiles.length; i += batchSize) {
            const batch = allFiles.slice(i, i + batchSize);
            const { error: deleteFilesError } = await supabaseAdmin.storage
              .from(bucket.name)
              .remove(batch);

            if (deleteFilesError) {
              console.error(
                `❌ Erro ao deletar lote de arquivos do bucket ${bucket.name}:`,
                deleteFilesError
              );
            } else {
              console.log(
                `✅ Lote ${
                  Math.floor(i / batchSize) + 1
                } de arquivos deletado (${batch.length} arquivos)`
              );
            }
          }
        } else {
          console.log(`ℹ️  Bucket ${bucket.name} já está vazio`);
        }

        // Deletar o bucket
        const { error: deleteBucketError } =
          await supabaseAdmin.storage.deleteBucket(bucket.name);

        if (deleteBucketError) {
          console.error(
            `❌ Erro ao deletar bucket ${bucket.name}:`,
            deleteBucketError
          );
        } else {
          console.log(`✅ Bucket ${bucket.name} deletado com sucesso`);
        }
      } catch (error) {
        console.error(`❌ Erro ao processar bucket ${bucket.name}:`, error);
      }
    }

    console.log("✅ Limpeza de buckets do Supabase concluída!");
  } catch (error) {
    console.error("❌ Erro na limpeza de buckets do Supabase:", error);
    throw error;
  }
}

async function cleanSupabaseUsers() {
  try {
    console.log("👤 Buscando usuários do Supabase para limpeza...");

    // Buscar todos os usuários
    const { data: users, error: listError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error("❌ Erro ao buscar usuários:", listError);
      return;
    }

    if (!users || users.users.length === 0) {
      console.log("ℹ️  Nenhum usuário encontrado no Supabase");
      return;
    }

    console.log(`🔍 Encontrados ${users.users.length} usuários para deletar`);

    // Deletar cada usuário
    for (const user of users.users) {
      console.log(`🗑️  Deletando usuário: ${user.email}`);

      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
        user.id
      );

      if (deleteError) {
        console.error(`❌ Erro ao deletar usuário ${user.email}:`, deleteError);
      } else {
        console.log(`✅ Usuário ${user.email} deletado com sucesso`);
      }
    }

    console.log("✅ Limpeza de usuários do Supabase concluída!");
  } catch (error) {
    console.error("❌ Erro na limpeza de usuários do Supabase:", error);
    throw error;
  }
}

async function cleanDatabase() {
  try {
    console.log("🧹 Iniciando limpeza completa do sistema...");

    // Primeiro, limpar buckets, políticas e usuários do Supabase
    console.log("\n🔐 === LIMPEZA DO SUPABASE ===");
    await cleanSupabaseStoragePolicies();
    await cleanSupabaseBuckets();
    await cleanSupabaseUsers();

    console.log("\n🗄️  === LIMPEZA DO BANCO DE DADOS ===");
    console.log("📝 Limpando histórico de inventário...");
    await prisma.inventoryHistory.deleteMany({});

    console.log("📦 Limpando itens de inventário...");
    await prisma.inventoryItem.deleteMany({});

    console.log("👥 Limpando membros de comissão...");
    await prisma.commissionMember.deleteMany({});

    console.log("🏛️ Limpando comissões...");
    await prisma.commission.deleteMany({});

    console.log("🏫 Limpando membros de campus...");
    await prisma.campusMember.deleteMany({});

    console.log("🏢 Limpando campus...");
    await prisma.campus.deleteMany({});

    console.log("👤 Limpando membros de organização...");
    await prisma.organizationMember.deleteMany({});

    console.log("🏛️ Limpando organizações...");
    await prisma.organization.deleteMany({});

    console.log("✅ Limpando usuários permitidos...");
    await prisma.allowedUser.deleteMany({});

    console.log("👤 Limpando perfis de usuário...");
    await prisma.userProfile.deleteMany({});

    console.log("\n🎉 LIMPEZA COMPLETA CONCLUÍDA!");
    console.log("✅ Banco de dados Prisma limpo com sucesso!");
    console.log("✅ Políticas RLS do Storage removidas com sucesso!");
    console.log("✅ Buckets do Supabase Storage removidos com sucesso!");
    console.log("✅ Usuários do Supabase removidos com sucesso!");
    console.log(
      "📊 Todas as tabelas foram esvaziadas, mas a estrutura foi mantida."
    );
    console.log(
      "🔄 O sistema agora está pronto para uma configuração inicial."
    );
  } catch (error) {
    console.error("❌ Erro ao limpar sistema:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Função para confirmar antes de executar
async function confirmAndClean() {
  console.log(
    "⚠️  ATENÇÃO: Esta operação irá DELETAR TODOS OS DADOS do sistema!"
  );
  console.log("⚠️  Isso inclui:");
  console.log("   🗄️  Todos os dados do banco de dados Prisma");
  console.log("   👤 Todos os usuários do Supabase Auth");
  console.log("   🗂️  Todos os buckets e arquivos do Supabase Storage");
  console.log("   🔒 Todas as políticas RLS do Supabase Storage");
  console.log("   📁 Dados de inventário, organizações, campus e comissões");
  console.log("⚠️  Esta ação é IRREVERSÍVEL!");

  // Em ambiente de produção, não permitir limpeza
  if (process.env.NODE_ENV === "production") {
    console.error("❌ Limpeza de sistema não permitida em produção!");
    process.exit(1);
  }

  // Verificar se foi passado o parâmetro de confirmação
  const args = process.argv.slice(2);
  const forceClean = args.includes("--force") || args.includes("-f");

  if (!forceClean) {
    console.log("💡 Para executar a limpeza completa, use:");
    console.log("   npm run clean-db --force");
    console.log("   ou");
    console.log("   npx tsx scripts/clean-database.ts --force");
    console.log("\n📝 Certifique-se de ter:");
    console.log("   - NEXT_PUBLIC_SUPABASE_URL configurada");
    console.log("   - SUPABASE_SERVICE_ROLE_KEY configurada");
    process.exit(0);
  }

  console.log("🚀 Iniciando limpeza completa do sistema...");
  await cleanDatabase();
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  confirmAndClean().catch((error) => {
    console.error("💥 Falha na limpeza completa:", error);
    process.exit(1);
  });
}

export {
  cleanDatabase,
  cleanSupabaseBuckets,
  cleanSupabaseStoragePolicies,
  cleanSupabaseUsers,
};
