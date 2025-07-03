// Script para testar endpoints de campus e comissão
const BASE_URL = 'http://localhost:3000';

async function testCampusEndpoint() {
  try {
    console.log('🧪 Testando endpoint de campus...');
    const response = await fetch(`${BASE_URL}/api/campus`);
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Campus encontrados:', data.length);
    console.log('Campus:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Erro ao testar campus endpoint:', error);
    return [];
  }
}

async function testCommissionEndpoint() {
  try {
    console.log('🧪 Testando endpoint de comissões...');
    const response = await fetch(`${BASE_URL}/api/commission`);
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Comissões encontradas:', data.length);
    console.log('Comissões:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Erro ao testar commission endpoint:', error);
    return [];
  }
}

async function testCreateCommission(testData) {
  try {
    console.log('🧪 Testando criação de comissão...');
    console.log('Dados de teste:', testData);
    
    const response = await fetch(`${BASE_URL}/api/commission`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Resposta:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Erro ao testar criação de comissão:', error);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Iniciando testes...\n');
  
  // Testar campus
  const campuses = await testCampusEndpoint();
  console.log('\n');
  
  // Testar comissões
  const commissions = await testCommissionEndpoint();
  console.log('\n');
  
  // Se houver campus, testar criação de comissão
  if (campuses.length > 0) {
    const testCommissionData = {
      name: 'Comissão de Teste',
      description: 'Comissão criada para teste',
      type: 'Temporária',
      campusId: campuses[0].id,
      year: 2024,
    };
    
    await testCreateCommission(testCommissionData);
  } else {
    console.log('⚠️ Nenhum campus encontrado. Não é possível testar criação de comissão.');
  }
  
  console.log('\n✅ Testes concluídos!');
}

// Executar apenas se chamado diretamente
if (typeof window === 'undefined') {
  runTests();
}

module.exports = { testCampusEndpoint, testCommissionEndpoint, testCreateCommission };
