import { randomUUID } from "crypto";
import { prisma } from "../lib/prisma";

async function createTestData() {
  try {
    console.log("🚀 Criando dados de teste...");

    // 1. Criar organização
    const organization = await prisma.organization.create({
      data: {
        id: randomUUID(),
        name: "Instituto Federal de Teste",
        shortName: "IFTEST",
        active: true,
      },
    });
    console.log("✅ Organização criada:", organization.id);

    // 2. Criar campus
    const campus = await prisma.campus.create({
      data: {
        id: randomUUID(),
        organizationId: organization.id,
        name: "Campus Principal",
        code: "TESTE01",
        active: true,
      },
    });
    console.log("✅ Campus criado:", campus.id);

    // 3. Criar usuário
    const userProfile = await prisma.userProfile.create({
      data: {
        id: "dev-user-uuid",
        name: "Usuário de Desenvolvimento",
        email: "dev@example.com",
        description: "Usuário para testes em desenvolvimento",
        active: true,
      },
    });
    console.log("✅ Usuário criado:", userProfile.id);

    // 4. Criar comissão
    const commission = await prisma.commission.create({
      data: {
        id: "commission-uuid-1",
        campusId: campus.id,
        name: "Comissão de Inventário 2025",
        type: "Permanente",
        description: "Comissão responsável pelo inventário de 2025",
        active: true,
        year: 2025,
      },
    });
    console.log("✅ Comissão criada:", commission.id);

    // 5. Criar membro da organização
    await prisma.organizationMember.create({
      data: {
        userId: userProfile.id,
        organizationId: organization.id,
        role: "admin",
      },
    });

    // 6. Criar membro do campus
    await prisma.campusMember.create({
      data: {
        userId: userProfile.id,
        campusId: campus.id,
      },
    });

    // 7. Criar membro da comissão
    await prisma.commissionMember.create({
      data: {
        userId: userProfile.id,
        commissionId: commission.id,
        roleInCommission: "Presidente",
      },
    });

    console.log("🎉 Dados de teste criados com sucesso!");
    console.log(`
📋 Resumo:
- Organização: ${organization.name} (${organization.id})
- Campus: ${campus.name} (${campus.id})
- Usuário: ${userProfile.name} (${userProfile.id})
- Comissão: ${commission.name} (${commission.id})

🔗 URLs para teste:
- Upload: http://localhost:3000/admin/comissions/${commission.id}/upload
- Inventários: http://localhost:3000/admin/comissions/${commission.id}/inventories
    `);
  } catch (error) {
    console.error("❌ Erro ao criar dados de teste:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestData();
