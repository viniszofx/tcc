import { PrismaClient } from "@prisma/client";
import { cleanDatabase } from "./clean-database";

const prisma = new PrismaClient();

async function seedBasicData() {
  try {
    console.log("🌱 Criando dados básicos de teste...");

    // 1. Criar usuário de desenvolvimento
    const devUser = await prisma.userProfile.create({
      data: {
        id: "88ae80f0-4c14-44ea-b98a-235cf37bf170",
        name: "Usuário de Desenvolvimento",
        email: "dev@example.com",
        description: "Usuário para testes em desenvolvimento",
        active: true,
      },
    });
    console.log("👤 Usuário de desenvolvimento criado:", devUser.name);

    // 2. Criar usuário permitido
    await prisma.allowedUser.create({
      data: {
        name: "Usuário de Desenvolvimento",
        email: "dev@example.com",
        status: true,
      },
    });
    console.log("✅ Usuário adicionado à lista de permitidos");

    // 3. Criar organização
    const organization = await prisma.organization.create({
      data: {
        name: "Universidade Federal de Mato Grosso do Sul",
        shortName: "UFMS",
        active: true,
      },
    });
    console.log("🏛️ Organização criada:", organization.name);

    // 4. Criar membro da organização
    await prisma.organizationMember.create({
      data: {
        userId: devUser.id,
        organizationId: organization.id,
        role: "admin",
      },
    });
    console.log("👥 Usuário adicionado como admin da organização");

    // 5. Criar campus
    const campus = await prisma.campus.create({
      data: {
        organizationId: organization.id,
        name: "Campus Campo Grande",
        code: "UFMS-CG",
        active: true,
      },
    });
    console.log("🏫 Campus criado:", campus.name);

    // 6. Criar membro do campus
    await prisma.campusMember.create({
      data: {
        userId: devUser.id,
        campusId: campus.id,
      },
    });
    console.log("👥 Usuário adicionado ao campus");

    // 7. Criar comissão
    const commission = await prisma.commission.create({
      data: {
        campusId: campus.id,
        name: "Comissão de Inventário 2025",
        type: "Especial",
        description: "Comissão especial para inventário geral da UFMS",
        active: true,
        year: 2025,
      },
    });
    console.log("📋 Comissão criada:", commission.name);

    // 8. Criar membro da comissão
    await prisma.commissionMember.create({
      data: {
        userId: devUser.id,
        commissionId: commission.id,
        roleInCommission: "Presidente",
      },
    });
    console.log("👥 Usuário adicionado como presidente da comissão");

    // 9. Criar alguns itens de inventário de exemplo
    const items = [
      {
        number: "001",
        description: "Computador Desktop Dell",
        brandModel: "Dell OptiPlex 7090",
        currentResponsibility: "Laboratório de Informática",
        conservationState: "Bom",
        location: "Sala 101",
        tags: ["computador", "desktop", "laboratório"],
        ed: "2023",
        sector: "Informática",
      },
      {
        number: "002",
        description: "Projetor Multimídia",
        brandModel: "Epson PowerLite X49",
        currentResponsibility: "Audiovisual",
        conservationState: "Excelente",
        location: "Sala de Reuniões",
        tags: ["projetor", "audiovisual"],
        ed: "2024",
        sector: "Audiovisual",
      },
      {
        number: "003",
        description: "Mesa para Escritório",
        brandModel: "Móveis Office Plus",
        currentResponsibility: "Administração",
        conservationState: "Regular",
        location: "Secretaria",
        tags: ["móvel", "mesa", "escritório"],
        ed: "2022",
        sector: "Administração",
      },
    ];

    for (const itemData of items) {
      const item = await prisma.inventoryItem.create({
        data: {
          ...itemData,
          commissionId: commission.id,
          campusId: campus.id,
        },
      });

      // Criar histórico de criação
      await prisma.inventoryHistory.create({
        data: {
          inventoryItemId: item.id,
          userId: devUser.id,
          action: "create",
          changes: JSON.stringify({ created: item }),
          observation: "Item criado durante setup inicial",
          imageUrl: [],
        },
      });

      console.log("📦 Item criado:", item.description);
    }

    console.log("✅ Dados básicos de teste criados com sucesso!");
    console.log(`
📊 Resumo dos dados criados:
- 1 Usuário de desenvolvimento
- 1 Organização (UFMS)
- 1 Campus (Campo Grande)
- 1 Comissão (Inventário 2025)
- ${items.length} Itens de inventário
- ${items.length} Registros de histórico

🚀 Agora você pode usar o sistema com dados de teste!
    `);
  } catch (error) {
    console.error("❌ Erro ao criar dados básicos:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function resetDatabase() {
  console.log("🔄 Resetando banco de dados...");

  // Limpar banco
  await cleanDatabase();

  // Recriar dados básicos
  await seedBasicData();

  console.log("✅ Banco de dados resetado com sucesso!");
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  const args = process.argv.slice(2);
  const shouldReset = args.includes("--reset") || args.includes("-r");

  if (shouldReset) {
    resetDatabase().catch((error) => {
      console.error("💥 Falha no reset:", error);
      process.exit(1);
    });
  } else {
    seedBasicData().catch((error) => {
      console.error("💥 Falha na criação de dados:", error);
      process.exit(1);
    });
  }
}

export { resetDatabase, seedBasicData };
