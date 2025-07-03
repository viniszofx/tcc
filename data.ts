export const data = {
  // 1. Supabase cria o auth.users (simulado aqui como uuid fixo)
  authUserId: "user-uuid-1",

  // 2. Perfil do usuário (UserProfile) - Múltiplos usuários
  userProfiles: [
    {
      id: "user-uuid-1", // mesmo que o auth.users
      name: "Vinicius Souza",
      email: "vinicius@example.com",
      role: "admin global", // Administrador global
      description: "Administrador do sistema",
      avatar: "https://example.com/avatar.jpg",
      active: true,
    },
    {
      id: "user-uuid-2",
      name: "Maria Silva",
      email: "maria.silva@example.com",
      role: "member", // Membro
      description: "Técnica em Patrimônio",
      avatar: "https://example.com/avatar2.jpg",
      active: true,
    },
    {
      id: "user-uuid-3",
      name: "João Santos",
      email: "joao.santos@example.com",
      role: "member", // Membro
      description: "Assistente Administrativo",
      avatar: "https://example.com/avatar3.jpg",
      active: true,
    },
    {
      id: "user-uuid-4",
      name: "Ana Costa",
      email: "ana.costa@example.com",
      role: "admin", // Admin de organização
      description: "Coordenadora de TI",
      avatar: "https://example.com/avatar4.jpg",
      active: true,
    },
    {
      id: "user-uuid-5",
      name: "Carlos Oliveira",
      email: "carlos.oliveira@example.com",
      role: "member", // Membro
      description: "Servidor Público",
      avatar: "https://example.com/avatar5.jpg",
      active: true,
    },
    {
      id: "user-uuid-6",
      name: "Patricia Mendes",
      email: "patricia.mendes@ufms.br",
      role: "member", // Membro
      description: "Coordenadora de Patrimônio UFMS",
      avatar: "https://example.com/avatar6.jpg",
      active: true,
    },
    {
      id: "user-uuid-7",
      name: "Roberto Lima",
      email: "roberto.lima@ifsp.edu.br",
      role: "member", // Membro
      description: "Técnico de Laboratório IFSP",
      avatar: "https://example.com/avatar7.jpg",
      active: true,
    },
    {
      id: "user-uuid-8",
      name: "Fernanda Torres",
      email: "fernanda.torres@ifsp.edu.br",
      role: "admin", // Admin de organização
      description: "Diretora Adjunta IFSP",
      avatar: "https://example.com/avatar8.jpg",
      active: true,
    },
  ],

  // 3. AllowedUser (opcional, para whitelist) - Múltiplos usuários permitidos
  allowedUsers: [
    {
      id: "allowed-user-uuid-1",
      name: "Vinicius Souza",
      email: "vinicius@example.com",
      status: true,
    },
    {
      id: "allowed-user-uuid-2",
      name: "Maria Silva",
      email: "maria.silva@example.com",
      status: true,
    },
    {
      id: "allowed-user-uuid-3",
      name: "João Santos",
      email: "joao.santos@example.com",
      status: true,
    },
    {
      id: "allowed-user-uuid-4",
      name: "Ana Costa",
      email: "ana.costa@example.com",
      status: true,
    },
    {
      id: "allowed-user-uuid-5",
      name: "Carlos Oliveira",
      email: "carlos.oliveira@example.com",
      status: true,
    },
    {
      id: "allowed-user-uuid-6",
      name: "Patricia Mendes",
      email: "patricia.mendes@ufms.br",
      status: true,
    },
    {
      id: "allowed-user-uuid-7",
      name: "Roberto Lima",
      email: "roberto.lima@ifsp.edu.br",
      status: true,
    },
    {
      id: "allowed-user-uuid-8",
      name: "Fernanda Torres",
      email: "fernanda.torres@ifsp.edu.br",
      status: true,
    },
  ],

  // 4. Organizações - Múltiplas instituições
  organizations: [
    {
      id: "org-uuid-1",
      name: "Instituto Federal de Mato Grosso do Sul",
      shortName: "IFMS",
      active: true,
    },
    {
      id: "org-uuid-2",
      name: "Universidade Federal de Mato Grosso do Sul",
      shortName: "UFMS",
      active: true,
    },
    {
      id: "org-uuid-3",
      name: "Instituto Federal de São Paulo",
      shortName: "IFSP",
      active: true,
    },
  ],

  // 5. Membros das organizações - Múltiplos membros em diferentes organizações
  organizationMembers: [
    // IFMS
    {
      userId: "user-uuid-1",
      organizationId: "org-uuid-1",
      role: "admin",
    },
    {
      userId: "user-uuid-2",
      organizationId: "org-uuid-1",
      role: "member",
    },
    {
      userId: "user-uuid-3",
      organizationId: "org-uuid-1",
      role: "member",
    },
    // UFMS
    {
      userId: "user-uuid-4",
      organizationId: "org-uuid-2",
      role: "admin",
    },
    {
      userId: "user-uuid-5",
      organizationId: "org-uuid-2",
      role: "member",
    },
    {
      userId: "user-uuid-6",
      organizationId: "org-uuid-2",
      role: "admin",
    },
    // IFSP
    {
      userId: "user-uuid-1",
      organizationId: "org-uuid-3",
      role: "member",
    },
    {
      userId: "user-uuid-7",
      organizationId: "org-uuid-3",
      role: "member",
    },
    {
      userId: "user-uuid-8",
      organizationId: "org-uuid-3",
      role: "admin",
    },
  ],

  // 6. Campus - Múltiplos campus de diferentes organizações
  campuses: [
    // IFMS
    {
      id: "campus-uuid-1",
      organizationId: "org-uuid-1",
      name: "Campus Corumbá",
      code: "IFMS-CBA",
      active: true,
    },
    {
      id: "campus-uuid-2",
      organizationId: "org-uuid-1",
      name: "Campus Campo Grande",
      code: "IFMS-CG",
      active: true,
    },
    // UFMS
    {
      id: "campus-uuid-3",
      organizationId: "org-uuid-2",
      name: "Campus Campo Grande",
      code: "UFMS-CG",
      active: true,
    },
    {
      id: "campus-uuid-4",
      organizationId: "org-uuid-2",
      name: "Campus Três Lagoas",
      code: "UFMS-TL",
      active: true,
    },
    // IFSP
    {
      id: "campus-uuid-5",
      organizationId: "org-uuid-3",
      name: "Campus São Paulo",
      code: "IFSP-SP",
      active: true,
    },
    {
      id: "campus-uuid-6",
      organizationId: "org-uuid-3",
      name: "Campus Campinas",
      code: "IFSP-CPS",
      active: true,
    },
  ],

  // Compatibilidade com código existente
  campus: {
    id: "campus-uuid-1",
    organizationId: "org-uuid-1",
    name: "Campus Corumbá",
    code: "IFMS-CBA",
    active: true,
  },

  // 7. Membros dos campus - Múltiplos membros em diferentes campus
  campusMembers: [
    // IFMS Corumbá
    {
      userId: "user-uuid-1",
      campusId: "campus-uuid-1",
    },
    {
      userId: "user-uuid-2",
      campusId: "campus-uuid-1",
    },
    {
      userId: "user-uuid-3",
      campusId: "campus-uuid-1",
    },
    // IFMS Campo Grande
    {
      userId: "user-uuid-1",
      campusId: "campus-uuid-2",
    },
    {
      userId: "user-uuid-2",
      campusId: "campus-uuid-2",
    },
    // UFMS Campo Grande
    {
      userId: "user-uuid-4",
      campusId: "campus-uuid-3",
    },
    {
      userId: "user-uuid-5",
      campusId: "campus-uuid-3",
    },
    {
      userId: "user-uuid-6",
      campusId: "campus-uuid-3",
    },
    // UFMS Três Lagoas
    {
      userId: "user-uuid-4",
      campusId: "campus-uuid-4",
    },
    {
      userId: "user-uuid-6",
      campusId: "campus-uuid-4",
    },
    // IFSP São Paulo
    {
      userId: "user-uuid-1",
      campusId: "campus-uuid-5",
    },
    {
      userId: "user-uuid-7",
      campusId: "campus-uuid-5",
    },
    {
      userId: "user-uuid-8",
      campusId: "campus-uuid-5",
    },
    // IFSP Campinas
    {
      userId: "user-uuid-1",
      campusId: "campus-uuid-6",
    },
    {
      userId: "user-uuid-7",
      campusId: "campus-uuid-6",
    },
    {
      userId: "user-uuid-8",
      campusId: "campus-uuid-6",
    },
  ],

  // 8. Comissões - Múltiplas comissões de diferentes campus e organizações
  commissions: [
    // IFMS Corumbá
    {
      id: "commission-uuid-1",
      campusId: "campus-uuid-1",
      name: "Comissão Inventário 2025",
      type: "Permanente",
      description: "Responsável pelo inventário do ano 2025",
      spreadsheet_url: "https://docs.google.com/planilha-ifms-cba",
      active: true,
      year: 2025,
    },
    // IFMS Campo Grande
    {
      id: "commission-uuid-2",
      campusId: "campus-uuid-2",
      name: "Comissão Patrimônio IFMS-CG",
      type: "Permanente",
      description: "Comissão de patrimônio do campus Campo Grande",
      spreadsheet_url: "https://docs.google.com/planilha-ifms-cg",
      active: true,
      year: 2025,
    },
    // UFMS Campo Grande
    {
      id: "commission-uuid-3",
      campusId: "campus-uuid-3",
      name: "Comissão Inventário UFMS",
      type: "Especial",
      description: "Comissão especial para inventário geral da UFMS",
      spreadsheet_url: "https://docs.google.com/planilha-ufms-cg",
      active: true,
      year: 2025,
    },
    // UFMS Três Lagoas
    {
      id: "commission-uuid-4",
      campusId: "campus-uuid-4",
      name: "Comissão Patrimônio CPTL",
      type: "Permanente",
      description: "Comissão do Campus de Três Lagoas",
      spreadsheet_url: "https://docs.google.com/planilha-ufms-tl",
      active: true,
      year: 2025,
    },
    // IFSP São Paulo
    {
      id: "commission-uuid-5",
      campusId: "campus-uuid-5",
      name: "Comissão Inventário IFSP-SP",
      type: "Temporária",
      description: "Comissão temporária para inventário 2025",
      spreadsheet_url: "https://docs.google.com/planilha-ifsp-sp",
      active: true,
      year: 2025,
    },
    // IFSP Campinas
    {
      id: "commission-uuid-6",
      campusId: "campus-uuid-6",
      name: "Comissão Patrimônio IFSP-CPS",
      type: "Permanente",
      description: "Comissão permanente do campus Campinas",
      spreadsheet_url: "https://docs.google.com/planilha-ifsp-cps",
      active: true,
      year: 2025,
    },
  ],

  // Compatibilidade com código existente
  commission: {
    id: "commission-uuid-1",
    campusId: "campus-uuid-1",
    name: "Comissão Inventário 2025",
    type: "Permanente",
    description: "Responsável pelo inventário do ano 2025",
    spreadsheet_url: "https://docs.google.com/planilha",
    active: true,
    year: 2025,
  },

  // 9. Membros das comissões - Múltiplos membros em diferentes comissões
  commissionMembers: [
    // Comissão IFMS Corumbá
    {
      userId: "user-uuid-1",
      commissionId: "commission-uuid-1",
      roleInCommission: "Presidente",
    },
    {
      userId: "user-uuid-2",
      commissionId: "commission-uuid-1",
      roleInCommission: "Membro",
    },
    {
      userId: "user-uuid-3",
      commissionId: "commission-uuid-1",
      roleInCommission: "Membro",
    },
    // Comissão IFMS Campo Grande
    {
      userId: "user-uuid-1",
      commissionId: "commission-uuid-2",
      roleInCommission: "Membro",
    },
    {
      userId: "user-uuid-2",
      commissionId: "commission-uuid-2",
      roleInCommission: "Presidente",
    },
    // Comissão UFMS Campo Grande
    {
      userId: "user-uuid-4",
      commissionId: "commission-uuid-3",
      roleInCommission: "Presidente",
    },
    {
      userId: "user-uuid-5",
      commissionId: "commission-uuid-3",
      roleInCommission: "Membro",
    },
    {
      userId: "user-uuid-6",
      commissionId: "commission-uuid-3",
      roleInCommission: "Secretário",
    },
    // Comissão UFMS Três Lagoas
    {
      userId: "user-uuid-4",
      commissionId: "commission-uuid-4",
      roleInCommission: "Membro",
    },
    {
      userId: "user-uuid-6",
      commissionId: "commission-uuid-4",
      roleInCommission: "Presidente",
    },
    // Comissão IFSP São Paulo
    {
      userId: "user-uuid-1",
      commissionId: "commission-uuid-5",
      roleInCommission: "Presidente",
    },
    {
      userId: "user-uuid-7",
      commissionId: "commission-uuid-5",
      roleInCommission: "Membro",
    },
    {
      userId: "user-uuid-8",
      commissionId: "commission-uuid-5",
      roleInCommission: "Secretário",
    },
    // Comissão IFSP Campinas
    {
      userId: "user-uuid-1",
      commissionId: "commission-uuid-6",
      roleInCommission: "Membro",
    },
    {
      userId: "user-uuid-7",
      commissionId: "commission-uuid-6",
      roleInCommission: "Presidente",
    },
    {
      userId: "user-uuid-8",
      commissionId: "commission-uuid-6",
      roleInCommission: "Membro",
    },
  ],

  // 10. Itens de inventário - Múltiplos itens de diferentes organizações e campus
  inventoryItems: [
    // IFMS Corumbá
    {
      id: "inventory-uuid-1",
      commissionId: "commission-uuid-1",
      campusId: "campus-uuid-1",
      number: "123456",
      description: "Notebook Dell Latitude 3420",
      brandModel: "Dell Latitude 3420",
      currentResponsibility: "Setor de Informática",
      conservationState: "Bom",
      location: "Sala 102",
      tags: ["notebook", "TI"],
      ed: "2025",
      updatedAt: new Date().toISOString(),
      sector: "Informática",
    },
    {
      id: "inventory-uuid-2",
      commissionId: "commission-uuid-1",
      campusId: "campus-uuid-1",
      number: "123457",
      description: "Projetor Epson PowerLite",
      brandModel: "Epson PowerLite X51+",
      currentResponsibility: "Coordenação Pedagógica",
      conservationState: "Excelente",
      location: "Auditório Principal",
      tags: ["projetor", "audiovisual"],
      ed: "2025",
      updatedAt: new Date().toISOString(),
      sector: "Ensino",
    },
    {
      id: "inventory-uuid-3",
      commissionId: "commission-uuid-1",
      campusId: "campus-uuid-1",
      number: "123458",
      description: "Mesa de Escritório",
      brandModel: "Mesa Executive Premium",
      currentResponsibility: "Direção Geral",
      conservationState: "Bom",
      location: "Gabinete da Direção",
      tags: ["mobiliário", "mesa"],
      ed: "2025",
      updatedAt: new Date().toISOString(),
      sector: "Administração",
    },
    // IFMS Campo Grande
    {
      id: "inventory-uuid-4",
      commissionId: "commission-uuid-2",
      campusId: "campus-uuid-2",
      number: "234567",
      description: "Servidor Dell PowerEdge",
      brandModel: "Dell PowerEdge R740",
      currentResponsibility: "Datacenter IFMS-CG",
      conservationState: "Excelente",
      location: "Sala de Servidores",
      tags: ["servidor", "TI", "datacenter"],
      ed: "2025",
      updatedAt: new Date().toISOString(),
      sector: "Informática",
    },
    {
      id: "inventory-uuid-5",
      commissionId: "commission-uuid-2",
      campusId: "campus-uuid-2",
      number: "234568",
      description: "Laboratório Completo de Química",
      brandModel: "Kit Laboratório Didático",
      currentResponsibility: "Coordenação de Química",
      conservationState: "Bom",
      location: "Laboratório de Química",
      tags: ["laboratório", "química", "ensino"],
      ed: "2025",
      updatedAt: new Date().toISOString(),
      sector: "Ensino",
    },
    // UFMS Campo Grande
    {
      id: "inventory-uuid-6",
      commissionId: "commission-uuid-3",
      campusId: "campus-uuid-3",
      number: "345678",
      description: "Microscópio Eletrônico",
      brandModel: "JEOL JSM-6380LV",
      currentResponsibility: "Laboratório de Pesquisa",
      conservationState: "Excelente",
      location: "Lab. Microscopia Eletrônica",
      tags: ["microscópio", "pesquisa", "eletrônico"],
      ed: "2025",
      updatedAt: new Date().toISOString(),
      sector: "Pesquisa",
    },
    {
      id: "inventory-uuid-7",
      commissionId: "commission-uuid-3",
      campusId: "campus-uuid-3",
      number: "345679",
      description: "Sistema de Ar Condicionado Central",
      brandModel: "Carrier 30GTN060",
      currentResponsibility: "Manutenção Predial",
      conservationState: "Bom",
      location: "Central de Ar",
      tags: ["climatização", "central", "predial"],
      ed: "2025",
      updatedAt: new Date().toISOString(),
      sector: "Infraestrutura",
    },
    // UFMS Três Lagoas
    {
      id: "inventory-uuid-8",
      commissionId: "commission-uuid-4",
      campusId: "campus-uuid-4",
      number: "456789",
      description: "Espectrofotômetro UV-Vis",
      brandModel: "Shimadzu UV-1800",
      currentResponsibility: "Laboratório de Análises",
      conservationState: "Excelente",
      location: "Lab. Análises Químicas",
      tags: ["espectrofotômetro", "análises", "química"],
      ed: "2025",
      updatedAt: new Date().toISOString(),
      sector: "Pesquisa",
    },
    // IFSP São Paulo
    {
      id: "inventory-uuid-9",
      commissionId: "commission-uuid-5",
      campusId: "campus-uuid-5",
      number: "567890",
      description: "Impressora 3D Industrial",
      brandModel: "Stratasys Fortus 450mc",
      currentResponsibility: "FabLab IFSP",
      conservationState: "Excelente",
      location: "Laboratório de Fabricação",
      tags: ["impressora-3d", "fabricação", "prototipagem"],
      ed: "2025",
      updatedAt: new Date().toISOString(),
      sector: "Pesquisa",
    },
    {
      id: "inventory-uuid-10",
      commissionId: "commission-uuid-5",
      campusId: "campus-uuid-5",
      number: "567891",
      description: "Robô Colaborativo",
      brandModel: "Universal Robots UR5e",
      currentResponsibility: "Lab. Automação",
      conservationState: "Excelente",
      location: "Laboratório de Automação",
      tags: ["robô", "automação", "colaborativo"],
      ed: "2025",
      updatedAt: new Date().toISOString(),
      sector: "Ensino",
    },
    // IFSP Campinas
    {
      id: "inventory-uuid-11",
      commissionId: "commission-uuid-6",
      campusId: "campus-uuid-6",
      number: "678901",
      description: "Cluster de Computação",
      brandModel: "HPE Apollo 6500 Gen10",
      currentResponsibility: "Centro de Computação Científica",
      conservationState: "Excelente",
      location: "Datacenter CPS",
      tags: ["cluster", "hpc", "computação-científica"],
      ed: "2025",
      updatedAt: new Date().toISOString(),
      sector: "Pesquisa",
    },
    {
      id: "inventory-uuid-12",
      commissionId: "commission-uuid-6",
      campusId: "campus-uuid-6",
      number: "678902",
      description: "Sistema de Realidade Virtual",
      brandModel: "HTC Vive Pro 2 Complete",
      currentResponsibility: "Lab. Realidade Virtual",
      conservationState: "Excelente",
      location: "Laboratório de RV",
      tags: ["realidade-virtual", "vr", "imersivo"],
      ed: "2025",
      updatedAt: new Date().toISOString(),
      sector: "Ensino",
    },
  ],

  // 11. Histórico de ações no item - Múltiplas operações por diferentes membros
  inventoryHistories: [
    {
      id: "history-uuid-1",
      inventoryItemId: "inventory-uuid-1",
      userId: "user-uuid-1",
      action: "create",
      changes: "Item adicionado ao sistema.",
      observation: "Notebook cadastrado durante inventário inicial.",
      image_url: ["https://example.com/foto-item1.jpg"],
      timestamp: new Date(2025, 0, 15, 10, 30).toISOString(),
    },
    {
      id: "history-uuid-2",
      inventoryItemId: "inventory-uuid-1",
      userId: "user-uuid-2",
      action: "update",
      changes: "Localização alterada de 'Sala 101' para 'Sala 102'.",
      observation: "Item movido durante reorganização do setor.",
      image_url: ["https://example.com/foto-item1-nova-localizacao.jpg"],
      timestamp: new Date(2025, 1, 20, 14, 15).toISOString(),
    },
    {
      id: "history-uuid-3",
      inventoryItemId: "inventory-uuid-2",
      userId: "user-uuid-3",
      action: "create",
      changes: "Projetor adicionado ao inventário.",
      observation: "Equipamento novo adquirido para o auditório.",
      image_url: ["https://example.com/foto-projetor.jpg"],
      timestamp: new Date(2025, 1, 25, 9, 0).toISOString(),
    },
    {
      id: "history-uuid-4",
      inventoryItemId: "inventory-uuid-3",
      userId: "user-uuid-4",
      action: "create",
      changes: "Mesa de escritório cadastrada.",
      observation: "Mobiliário do gabinete da direção incluído no inventário.",
      image_url: ["https://example.com/foto-mesa.jpg"],
      timestamp: new Date(2025, 2, 5, 16, 45).toISOString(),
    },
    {
      id: "history-uuid-5",
      inventoryItemId: "inventory-uuid-4",
      userId: "user-uuid-5",
      action: "create",
      changes: "Impressora multifuncional adicionada.",
      observation: "Equipamento da secretaria acadêmica catalogado.",
      image_url: ["https://example.com/foto-impressora.jpg"],
      timestamp: new Date(2025, 2, 10, 11, 20).toISOString(),
    },
    {
      id: "history-uuid-6",
      inventoryItemId: "inventory-uuid-2",
      userId: "user-uuid-2",
      action: "update",
      changes: "Estado de conservação atualizado para 'Excelente'.",
      observation: "Projetor passou por manutenção preventiva.",
      image_url: ["https://example.com/foto-projetor-manutencao.jpg"],
      timestamp: new Date(2025, 3, 12, 13, 30).toISOString(),
    },
    {
      id: "history-uuid-7",
      inventoryItemId: "inventory-uuid-5",
      userId: "user-uuid-1",
      action: "create",
      changes: "Ar condicionado split cadastrado.",
      observation: "Equipamento de climatização da sala 205 inventariado.",
      image_url: ["https://example.com/foto-ar-condicionado.jpg"],
      timestamp: new Date(2025, 3, 18, 8, 15).toISOString(),
    },
    {
      id: "history-uuid-8",
      inventoryItemId: "inventory-uuid-6",
      userId: "user-uuid-3",
      action: "create",
      changes: "Microscópio binocular adicionado ao inventário.",
      observation: "Equipamento do laboratório de biologia catalogado.",
      image_url: ["https://example.com/foto-microscopio.jpg"],
      timestamp: new Date(2025, 4, 2, 15, 0).toISOString(),
    },
    {
      id: "history-uuid-9",
      inventoryItemId: "inventory-uuid-3",
      userId: "user-uuid-4",
      action: "update",
      changes: "Responsável alterado para 'Direção Geral'.",
      observation: "Mesa foi realocada para o novo gabinete.",
      image_url: ["https://example.com/foto-mesa-novo-local.jpg"],
      timestamp: new Date(2025, 4, 15, 10, 45).toISOString(),
    },
    {
      id: "history-uuid-10",
      inventoryItemId: "inventory-uuid-1",
      userId: "user-uuid-5",
      action: "update",
      changes: "Tags atualizadas: adicionado 'portátil' e 'trabalho remoto'.",
      observation: "Notebook sendo usado para trabalho híbrido.",
      image_url: [],
      timestamp: new Date(2025, 5, 8, 12, 20).toISOString(),
    },
    {
      id: "history-uuid-11",
      inventoryItemId: "inventory-uuid-4",
      userId: "user-uuid-2",
      action: "update",
      changes: "Localização atualizada para 'Sala da Secretaria - Mesa 2'.",
      observation: "Impressora movida para posição mais acessível.",
      image_url: ["https://example.com/foto-impressora-nova-posicao.jpg"],
      timestamp: new Date(2025, 5, 20, 14, 10).toISOString(),
    },
    {
      id: "history-uuid-12",
      inventoryItemId: "inventory-uuid-6",
      userId: "user-uuid-1",
      action: "update",
      changes: "Estado de conservação verificado - mantido como 'Bom'.",
      observation: "Inspeção de rotina realizada no microscópio.",
      image_url: ["https://example.com/foto-microscopio-inspecao.jpg"],
      timestamp: new Date(2025, 6, 1, 9, 30).toISOString(),
    },
    // Histórico dos itens das organizações UFMS e IFSP
    {
      id: "history-uuid-13",
      inventoryItemId: "inventory-uuid-7",
      userId: "user-uuid-6",
      action: "create",
      changes: "Sistema de ar condicionado central cadastrado.",
      observation:
        "Equipamento de climatização da UFMS incluído no inventário.",
      image_url: ["https://example.com/foto-ar-central-ufms.jpg"],
      timestamp: new Date(2025, 6, 15, 11, 0).toISOString(),
    },
    {
      id: "history-uuid-14",
      inventoryItemId: "inventory-uuid-8",
      userId: "user-uuid-6",
      action: "create",
      changes: "Espectrofotômetro UV-Vis adicionado ao inventário.",
      observation: "Equipamento de pesquisa do campus Três Lagoas catalogado.",
      image_url: ["https://example.com/foto-espectrofotometro.jpg"],
      timestamp: new Date(2025, 6, 20, 14, 30).toISOString(),
    },
    {
      id: "history-uuid-15",
      inventoryItemId: "inventory-uuid-9",
      userId: "user-uuid-7",
      action: "create",
      changes: "Impressora 3D industrial cadastrada.",
      observation: "Equipamento do FabLab IFSP incluído no sistema.",
      image_url: ["https://example.com/foto-impressora-3d-ifsp.jpg"],
      timestamp: new Date(2025, 7, 5, 10, 15).toISOString(),
    },
    {
      id: "history-uuid-16",
      inventoryItemId: "inventory-uuid-10",
      userId: "user-uuid-8",
      action: "create",
      changes: "Robô colaborativo adicionado ao inventário.",
      observation: "Equipamento de automação do IFSP São Paulo catalogado.",
      image_url: ["https://example.com/foto-robo-colaborativo.jpg"],
      timestamp: new Date(2025, 7, 12, 13, 45).toISOString(),
    },
    {
      id: "history-uuid-17",
      inventoryItemId: "inventory-uuid-11",
      userId: "user-uuid-7",
      action: "create",
      changes: "Cluster de computação cadastrado.",
      observation: "Sistema HPC do IFSP Campinas incluído no inventário.",
      image_url: ["https://example.com/foto-cluster-hpc.jpg"],
      timestamp: new Date(2025, 7, 25, 16, 20).toISOString(),
    },
    {
      id: "history-uuid-18",
      inventoryItemId: "inventory-uuid-12",
      userId: "user-uuid-8",
      action: "create",
      changes: "Sistema de realidade virtual adicionado.",
      observation: "Equipamento do laboratório de RV do IFSP catalogado.",
      image_url: ["https://example.com/foto-sistema-vr.jpg"],
      timestamp: new Date(2025, 8, 2, 9, 10).toISOString(),
    },
    {
      id: "history-uuid-19",
      inventoryItemId: "inventory-uuid-9",
      userId: "user-uuid-8",
      action: "update",
      changes: "Responsável alterado para 'FabLab IFSP - Coordenação'.",
      observation: "Reorganização administrativa do laboratório.",
      image_url: [],
      timestamp: new Date(2025, 8, 15, 14, 0).toISOString(),
    },
    {
      id: "history-uuid-20",
      inventoryItemId: "inventory-uuid-11",
      userId: "user-uuid-7",
      action: "update",
      changes:
        "Manutenção preventiva realizada - sistema funcionando perfeitamente.",
      observation: "Cluster passou por atualização de firmware e limpeza.",
      image_url: ["https://example.com/foto-cluster-manutencao.jpg"],
      timestamp: new Date(2025, 8, 28, 11, 30).toISOString(),
    },
  ],
};
