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

    // Primeiro, limpar usuários do Supabase
    console.log("\n🔐 === LIMPEZA DO SUPABASE ===");
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

export { cleanDatabase, cleanSupabaseUsers };
