import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Criando dados de teste...");

  // Criar usuário de teste
  const testUser = await prisma.userProfile.upsert({
    where: { email: "dev@example.com" },
    update: {},
    create: {
      id: "dev-user-uuid",
      name: "Usuário de Desenvolvimento",
      email: "dev@example.com",
      description: "Usuário para testes em desenvolvimento",
    },
  });

  // Criar organização de teste
  const testOrg = await prisma.organization.upsert({
    where: { id: "test-org-id" },
    update: {},
    create: {
      id: "test-org-id",
      name: "Organização de Teste",
      shortName: "TEST",
    },
  });

  // Criar campus de teste
  const testCampus = await prisma.campus.upsert({
    where: { code: "TEST-CAMPUS" },
    update: {},
    create: {
      id: "test-campus-id",
      organizationId: testOrg.id,
      name: "Campus de Teste",
      code: "TEST-CAMPUS",
    },
  });

  // Criar comissão de teste
  const testCommission = await prisma.commission.upsert({
    where: { id: "test-commission-id" },
    update: {},
    create: {
      id: "test-commission-id",
      campusId: testCampus.id,
      name: "Comissão de Teste",
      type: "Permanente",
      description: "Comissão para testes de desenvolvimento",
      year: new Date().getFullYear(),
    },
  });

  console.log("Dados de teste criados:");
  console.log("- Usuário:", testUser.name);
  console.log("- Organização:", testOrg.name);
  console.log("- Campus:", testCampus.name);
  console.log("- Comissão:", testCommission.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
