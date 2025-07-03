// Script para verificar dados de campus e comissões
import { prisma } from "@/lib/prisma";

async function debugUserCommissionAccess() {
  try {
    console.log("🔍 Verificando dados de usuários, campus e comissões...\n");

    // Listar todos os usuários
    const users = await prisma.userProfile.findMany({
      include: {
        organizationMembers: {
          include: {
            organization: true,
          },
        },
        campusMembers: {
          include: {
            campus: true,
          },
        },
        commissionMembers: {
          include: {
            commission: {
              include: {
                campus: true,
              },
            },
          },
        },
      },
    });

    console.log(`👥 Usuários encontrados: ${users.length}`);
    users.forEach((user) => {
      console.log(`\n📋 Usuário: ${user.name} (${user.email})`);
      console.log(`   ID: ${user.id}`);

      console.log(`   🏢 Organizações (${user.organizationMembers.length}):`);
      user.organizationMembers.forEach((om) => {
        console.log(`      - ${om.organization.name} (${om.role})`);
      });

      console.log(`   🏫 Campus (${user.campusMembers.length}):`);
      user.campusMembers.forEach((cm) => {
        console.log(
          `      - ${cm.campus.name} (${cm.campus.code}) - ID: ${cm.campus.id}`
        );
      });

      console.log(`   📝 Comissões (${user.commissionMembers.length}):`);
      user.commissionMembers.forEach((cm) => {
        console.log(
          `      - ${cm.commission.name} (${cm.roleInCommission}) - Campus: ${cm.commission.campus.name}`
        );
      });
    });

    // Listar todos os campus
    const campuses = await prisma.campus.findMany({
      include: {
        organization: true,
        members: {
          include: {
            user: true,
          },
        },
        commissions: true,
      },
    });

    console.log(`\n🏫 Campus encontrados: ${campuses.length}`);
    campuses.forEach((campus) => {
      console.log(`\n📋 Campus: ${campus.name} (${campus.code})`);
      console.log(`   ID: ${campus.id}`);
      console.log(`   Organização: ${campus.organization.name}`);
      console.log(`   Membros (${campus.members.length}):`);
      campus.members.forEach((member) => {
        console.log(`      - ${member.user.name} (${member.user.email})`);
      });
      console.log(`   Comissões (${campus.commissions.length}):`);
      campus.commissions.forEach((commission) => {
        console.log(`      - ${commission.name} (${commission.type})`);
      });
    });

    // Listar todas as comissões
    const commissions = await prisma.commission.findMany({
      include: {
        campus: {
          include: {
            organization: true,
          },
        },
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    console.log(`\n📝 Comissões encontradas: ${commissions.length}`);
    commissions.forEach((commission) => {
      console.log(`\n📋 Comissão: ${commission.name}`);
      console.log(`   ID: ${commission.id}`);
      console.log(
        `   Campus: ${commission.campus.name} (ID: ${commission.campus.id})`
      );
      console.log(`   Organização: ${commission.campus.organization.name}`);
      console.log(`   Tipo: ${commission.type} | Ano: ${commission.year}`);
      console.log(`   Membros (${commission.members.length}):`);
      commission.members.forEach((member) => {
        console.log(`      - ${member.user.name} (${member.roleInCommission})`);
      });
    });

    console.log("\n✅ Análise concluída!");

    // Análise de acesso
    console.log("\n🔐 Análise de acesso:");
    users.forEach((user) => {
      console.log(`\n👤 ${user.name}:`);

      // Verificar se é admin global
      const isGlobalAdmin = user.organizationMembers.some(
        (om) => om.role === "admin global"
      );
      console.log(`   Admin Global: ${isGlobalAdmin}`);

      // Verificar se é admin de organização
      const isOrgAdmin = user.organizationMembers.some(
        (om) => om.role === "admin"
      );
      console.log(`   Admin Organização: ${isOrgAdmin}`);

      if (isGlobalAdmin) {
        console.log(
          `   ✅ Pode ver TODAS as comissões (${commissions.length})`
        );
      } else if (isOrgAdmin) {
        const userOrgIds = user.organizationMembers
          .filter((om) => om.role === "admin")
          .map((om) => om.organizationId);
        const accessibleCommissions = commissions.filter((c) =>
          userOrgIds.includes(c.campus.organizationId)
        );
        console.log(
          `   ✅ Pode ver comissões da organização (${accessibleCommissions.length}):`
        );
        accessibleCommissions.forEach((c) => console.log(`      - ${c.name}`));
      } else {
        // Verificar acesso como membro
        const userCampusIds = user.campusMembers.map((cm) => cm.campusId);
        const userCommissionIds = user.commissionMembers.map(
          (cm) => cm.commissionId
        );

        const accessibleCommissions = commissions.filter(
          (c) =>
            userCampusIds.includes(c.campusId) ||
            userCommissionIds.includes(c.id)
        );

        console.log(
          `   ✅ Pode ver comissões como membro (${accessibleCommissions.length}):`
        );
        accessibleCommissions.forEach((c) => console.log(`      - ${c.name}`));
      }
    });
  } catch (error) {
    console.error("❌ Erro ao verificar dados:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  debugUserCommissionAccess();
}

export { debugUserCommissionAccess };
