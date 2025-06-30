import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanDatabase() {
  try {
    console.log("🧹 Iniciando limpeza do banco de dados...");

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

    console.log("✅ Banco de dados limpo com sucesso!");
    console.log(
      "📊 Todas as tabelas foram esvaziadas, mas a estrutura foi mantida."
    );
  } catch (error) {
    console.error("❌ Erro ao limpar banco de dados:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Função para confirmar antes de executar
async function confirmAndClean() {
  console.log(
    "⚠️  ATENÇÃO: Esta operação irá DELETAR TODOS OS DADOS do banco!"
  );
  console.log("⚠️  Esta ação é IRREVERSÍVEL!");

  // Em ambiente de produção, não permitir limpeza
  if (process.env.NODE_ENV === "production") {
    console.error("❌ Limpeza de banco não permitida em produção!");
    process.exit(1);
  }

  // Verificar se foi passado o parâmetro de confirmação
  const args = process.argv.slice(2);
  const forceClean = args.includes("--force") || args.includes("-f");

  if (!forceClean) {
    console.log("💡 Para executar a limpeza, use:");
    console.log("   npm run clean-db --force");
    console.log("   ou");
    console.log("   npx tsx scripts/clean-database.ts --force");
    process.exit(0);
  }

  console.log("🚀 Iniciando limpeza forçada...");
  await cleanDatabase();
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  confirmAndClean().catch((error) => {
    console.error("💥 Falha na limpeza:", error);
    process.exit(1);
  });
}

export { cleanDatabase };
