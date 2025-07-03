import { PrismaClient } from "@prisma/client";
import { data } from "../data";

const prisma = new PrismaClient();

function generateValidUUID(): string {
  return crypto.randomUUID();
}

// Mapear IDs antigos para novos UUIDs
const uuidMap = new Map<string, string>();

function getOrCreateUUID(oldId: string): string {
  if (!uuidMap.has(oldId)) {
    uuidMap.set(oldId, generateValidUUID());
  }
  return uuidMap.get(oldId)!;
}

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  try {
    // 1. Limpar dados existentes (em ordem reversa de dependência)
    console.log("🧹 Limpando dados existentes...");
    await prisma.inventoryHistory.deleteMany();
    await prisma.inventoryItem.deleteMany();
    await prisma.commissionMember.deleteMany();
    await prisma.campusMember.deleteMany();
    await prisma.organizationMember.deleteMany();
    await prisma.commission.deleteMany();
    await prisma.campus.deleteMany();
    await prisma.organization.deleteMany();
    await prisma.allowedUser.deleteMany();
    await prisma.userProfile.deleteMany();

    // 2. Criar UserProfiles
    console.log("👤 Criando usuários...");
    const userProfiles = [];
    for (const user of data.userProfiles) {
      const newId = getOrCreateUUID(user.id);
      const userProfile = await prisma.userProfile.create({
        data: {
          id: newId,
          name: user.name,
          email: user.email,
          role: user.role || "member", // Role padrão é member
          description: user.description || null,
          active: user.active,
        },
      });
      userProfiles.push(userProfile);
    }

    // 3. Criar AllowedUsers
    console.log("✅ Criando usuários permitidos...");
    const allowedUsers = [];
    for (const allowedUser of data.allowedUsers) {
      const allowedUserRecord = await prisma.allowedUser.create({
        data: {
          name: allowedUser.name,
          email: allowedUser.email,
          status: allowedUser.status,
        },
      });
      allowedUsers.push(allowedUserRecord);
    }

    // 4. Criar Organizations
    console.log("🏢 Criando organizações...");
    const organizations = [];
    for (const org of data.organizations) {
      const newId = getOrCreateUUID(org.id);
      const organization = await prisma.organization.create({
        data: {
          id: newId,
          name: org.name,
          shortName: org.shortName,
          active: org.active,
        },
      });
      organizations.push(organization);
    }

    // 5. Criar OrganizationMembers
    console.log("👥 Criando membros das organizações...");
    for (const member of data.organizationMembers) {
      await prisma.organizationMember.create({
        data: {
          userId: getOrCreateUUID(member.userId),
          organizationId: getOrCreateUUID(member.organizationId),
          role: member.role,
        },
      });
    }

    // 6. Criar Campus
    console.log("🏫 Criando campus...");
    const campuses = [];
    for (const campus of data.campuses) {
      const newId = getOrCreateUUID(campus.id);
      const campusRecord = await prisma.campus.create({
        data: {
          id: newId,
          organizationId: getOrCreateUUID(campus.organizationId),
          name: campus.name,
          code: campus.code,
          active: campus.active,
        },
      });
      campuses.push(campusRecord);
    }

    // 7. Criar CampusMembers
    console.log("🎓 Criando membros dos campus...");
    for (const member of data.campusMembers) {
      await prisma.campusMember.create({
        data: {
          userId: getOrCreateUUID(member.userId),
          campusId: getOrCreateUUID(member.campusId),
        },
      });
    }

    // 8. Criar Commissions
    console.log("📋 Criando comissões...");
    const commissions = [];
    for (const commission of data.commissions) {
      const newId = getOrCreateUUID(commission.id);
      const commissionRecord = await prisma.commission.create({
        data: {
          id: newId,
          campusId: getOrCreateUUID(commission.campusId),
          name: commission.name,
          type: commission.type,
          description: commission.description,
          active: commission.active,
          year: commission.year,
        },
      });
      commissions.push(commissionRecord);
    }

    // 9. Criar CommissionMembers
    console.log("👨‍💼 Criando membros das comissões...");
    for (const member of data.commissionMembers) {
      await prisma.commissionMember.create({
        data: {
          userId: getOrCreateUUID(member.userId),
          commissionId: getOrCreateUUID(member.commissionId),
          roleInCommission: member.roleInCommission,
        },
      });
    }

    // 10. Criar InventoryItems
    console.log("📦 Criando itens de inventário...");
    const inventoryItems = [];
    for (const item of data.inventoryItems) {
      const newId = getOrCreateUUID(item.id);
      const inventoryItem = await prisma.inventoryItem.create({
        data: {
          id: newId,
          commissionId: getOrCreateUUID(item.commissionId),
          campusId: getOrCreateUUID(item.campusId),
          number: item.number,
          description: item.description,
          brandModel: item.brandModel || null,
          currentResponsibility: item.currentResponsibility || null,
          conservationState: item.conservationState || null,
          location: item.location || null,
          tags: item.tags || [],
          ed: item.ed || null,
          sector: item.sector || null,
        },
      });
      inventoryItems.push(inventoryItem);
    }

    // 11. Criar InventoryHistory (histórico inicial)
    console.log("📚 Criando histórico de inventário...");
    for (const item of inventoryItems) {
      await prisma.inventoryHistory.create({
        data: {
          inventoryItemId: item.id,
          userId: userProfiles[0].id, // Usar primeiro usuário como criador
          action: "create",
          changes: JSON.stringify({
            created: {
              number: item.number,
              description: item.description,
            },
          }),
          observation: "Item criado durante seed do banco de dados",
          imageUrl: [],
        },
      });
    }

    // Contar registros criados
    const counts = {
      userProfiles: await prisma.userProfile.count(),
      allowedUsers: await prisma.allowedUser.count(),
      organizations: await prisma.organization.count(),
      organizationMembers: await prisma.organizationMember.count(),
      campuses: await prisma.campus.count(),
      campusMembers: await prisma.campusMember.count(),
      commissions: await prisma.commission.count(),
      commissionMembers: await prisma.commissionMember.count(),
      inventoryItems: await prisma.inventoryItem.count(),
      inventoryHistory: await prisma.inventoryHistory.count(),
    };

    console.log("✅ Seed concluído com sucesso!");
    console.log("📊 Registros criados:");
    console.log(`   - UserProfiles: ${counts.userProfiles}`);
    console.log(`   - AllowedUsers: ${counts.allowedUsers}`);
    console.log(`   - Organizations: ${counts.organizations}`);
    console.log(`   - OrganizationMembers: ${counts.organizationMembers}`);
    console.log(`   - Campuses: ${counts.campuses}`);
    console.log(`   - CampusMembers: ${counts.campusMembers}`);
    console.log(`   - Commissions: ${counts.commissions}`);
    console.log(`   - CommissionMembers: ${counts.commissionMembers}`);
    console.log(`   - InventoryItems: ${counts.inventoryItems}`);
    console.log(`   - InventoryHistory: ${counts.inventoryHistory}`);
    console.log(
      `   - Total: ${Object.values(counts).reduce((a, b) => a + b, 0)}`
    );
  } catch (error) {
    console.error("❌ Erro durante o seed:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
