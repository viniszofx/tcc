const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Criando dados de teste...');

  // 1. Criar organização
  const organization = await prisma.organization.create({
    data: {
      name: 'Instituto Federal do Ceará',
      shortName: 'IFCE',
      active: true,
    },
  });
  console.log('✅ Organização criada:', organization.id);

  // 2. Criar usuário
  const user = await prisma.userProfile.create({
    data: {
      name: 'Usuário Teste',
      email: 'teste@ifce.edu.br',
      description: 'Usuário de teste para desenvolvimento',
      active: true,
    },
  });
  console.log('✅ Usuário criado:', user.id);

  // 3. Criar campus
  const campus = await prisma.campus.create({
    data: {
      organizationId: organization.id,
      name: 'Campus Fortaleza',
      code: 'FOR',
      active: true,
    },
  });
  console.log('✅ Campus criado:', campus.id);

  // 4. Criar comissão
  const commission = await prisma.commission.create({
    data: {
      campusId: campus.id,
      name: 'Comissão de Inventário 2025',
      type: 'Permanente',
      description: 'Comissão responsável pelo inventário anual',
      active: true,
      year: 2025,
    },
  });
  console.log('✅ Comissão criada:', commission.id);

  // 5. Associar usuário à organização
  await prisma.organizationMember.create({
    data: {
      userId: user.id,
      organizationId: organization.id,
      role: 'admin',
    },
  });

  // 6. Associar usuário ao campus
  await prisma.campusMember.create({
    data: {
      userId: user.id,
      campusId: campus.id,
    },
  });

  // 7. Associar usuário à comissão
  await prisma.commissionMember.create({
    data: {
      userId: user.id,
      commissionId: commission.id,
      roleInCommission: 'Presidente',
    },
  });

  // 8. Criar alguns itens de inventário de teste
  const testItems = [
    {
      number: '123456',
      description: 'Mesa de escritório',
      brandModel: 'Mesa Corp Modelo A',
      currentResponsibility: 'João Silva',
      conservationState: 'Bom',
      location: 'Sala 101',
      tags: ['mobiliario', 'escritorio'],
      ed: '2023',
      sector: 'Administração',
    },
    {
      number: '789012',
      description: 'Cadeira giratória',
      brandModel: 'Cadeira Plus Ergonômica',
      currentResponsibility: 'João Silva',
      conservationState: 'Regular',
      location: 'Sala 101',
      tags: ['mobiliario', 'ergonomico'],
      ed: '2022',
      sector: 'Administração',
    },
    {
      number: '345678',
      description: 'Monitor LCD 24 polegadas',
      brandModel: 'Dell P2414H',
      currentResponsibility: 'Maria Santos',
      conservationState: 'Bom',
      location: 'Sala 102',
      tags: ['informatica', 'monitor'],
      ed: '2024',
      sector: 'TI',
    },
  ];

  for (const item of testItems) {
    const inventoryItem = await prisma.inventoryItem.create({
      data: {
        commissionId: commission.id,
        campusId: campus.id,
        ...item,
      },
    });

    // Criar histórico para cada item
    await prisma.inventoryHistory.create({
      data: {
        inventoryItemId: inventoryItem.id,
        userId: user.id,
        action: 'create',
        changes: JSON.stringify({ created: item }),
        observation: 'Item criado através de script de teste',
        imageUrl: [],
      },
    });
  }

  console.log('✅ Itens de inventário criados:', testItems.length);

  console.log('\n🎉 Dados de teste criados com sucesso!');
  console.log('\n📋 Resumo:');
  console.log(`- Organização: ${organization.name} (${organization.id})`);
  console.log(`- Campus: ${campus.name} (${campus.id})`);
  console.log(`- Comissão: ${commission.name} (${commission.id})`);
  console.log(`- Usuário: ${user.name} (${user.id})`);
  console.log(`- Itens de inventário: ${testItems.length}`);
  
  console.log('\n🔗 URLs para teste:');
  console.log(`- Upload: http://localhost:3000/admin/comissions/${commission.id}/upload`);
  console.log(`- Inventário: http://localhost:3000/admin/comissions/${commission.id}/inventories`);
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
