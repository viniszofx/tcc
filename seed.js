import { randomUUID } from "crypto";
import { prisma } from "./lib/prisma.js";

async function seedTestData() {
  try {
    console.log("🌱 Iniciando seed de dados de teste...");

    // 1. Criar uma organização
    const organization = await prisma.organization.upsert({
      where: { id: "org-uuid-1" },
      update: {},
      create: {
        id: randomUUID(),
        name: "Organização Teste",
        shortName: "ORG_TESTE",
        active: true,
      },
    });
    console.log("✅ Organização criada:", organization.id);

    // 2. Criar um campus
    const campus = await prisma.campus.upsert({
      where: { id: "campus-uuid-1" },
      update: {},
      create: {
        id: randomUUID(),
        organizationId: organization.id,
        name: "Campus Teste",
        code: "CAMPUS_001",
        active: true,
      },
    });
    console.log("✅ Campus criado:", campus.id);

    // 3. Criar uma comissão
    const commission = await prisma.commission.upsert({
      where: { id: "commission-uuid-1" },
      update: {},
      create: {
        id: randomUUID(),
        campusId: campus.id,
        name: "Comissão de Inventário Teste",
        type: "Permanente",
        description: "Comissão para testes de inventário",
        active: true,
        year: new Date().getFullYear(),
      },
    });
    console.log("✅ Comissão criada:", commission.id);

    // 4. Criar um usuário de teste
    const user = await prisma.userProfile.upsert({
      where: { id: "dev-user-uuid" },
      update: {},
      create: {
        id: "dev-user-uuid",
        name: "Usuário de Desenvolvimento",
        email: "dev@example.com",
        description: "Usuário para testes em desenvolvimento",
        active: true,
      },
    });
    console.log("✅ Usuário criado:", user.id);

    console.log("\n🎉 Seed concluído com sucesso!");
    console.log("IDs criados para uso:");
    console.log("- Organization ID:", organization.id);
    console.log("- Campus ID:", campus.id);
    console.log("- Commission ID:", commission.id);
    console.log("- User ID:", user.id);

  } catch (error) {
    console.error("❌ Erro durante o seed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTestData();
