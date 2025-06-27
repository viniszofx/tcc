import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Sistema de Inventário Multi-Organizacional",
      version: "1.0.0",
      description: `
        API completa para gerenciamento de inventário de múltiplas organizações educacionais.
        
        **Organizações Suportadas:**
        - IFMS - Instituto Federal de Mato Grosso do Sul
        - UFMS - Universidade Federal de Mato Grosso do Sul
        - IFSP - Instituto Federal de São Paulo
        
        Esta API permite gerenciar usuários, organizações, campus, comissões e itens de inventário
        com relacionamentos completos entre as entidades.
      `,
      contact: {
        name: "Sistema de Inventário",
        email: "suporte@inventario.edu.br",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor de Desenvolvimento",
      },
    ],
    components: {
      schemas: {
        User: {
          type: "object",
          required: ["name", "email", "description", "avatar", "active"],
          properties: {
            id: {
              type: "string",
              description: "ID único do usuário",
              example: "user-uuid-1",
            },
            name: {
              type: "string",
              description: "Nome completo do usuário",
              example: "Vinicius Souza",
            },
            email: {
              type: "string",
              format: "email",
              description: "Email do usuário",
              example: "vinicius@example.com",
            },
            description: {
              type: "string",
              description: "Descrição/cargo do usuário",
              example: "Administrador do sistema",
            },
            avatar: {
              type: "string",
              format: "uri",
              description: "URL do avatar do usuário",
              example: "https://example.com/avatar.jpg",
            },
            active: {
              type: "boolean",
              description: "Status ativo do usuário",
              example: true,
            },
          },
        },
        AllowedUser: {
          type: "object",
          required: ["name", "email", "status"],
          properties: {
            id: {
              type: "string",
              description: "ID único do usuário permitido",
              example: "allowed-user-uuid-1",
            },
            name: {
              type: "string",
              description: "Nome do usuário",
              example: "Vinicius Souza",
            },
            email: {
              type: "string",
              format: "email",
              description: "Email do usuário",
              example: "vinicius@example.com",
            },
            status: {
              type: "boolean",
              description: "Status de permissão",
              example: true,
            },
          },
        },
        Organization: {
          type: "object",
          required: ["name", "shortName", "active"],
          properties: {
            id: {
              type: "string",
              description: "ID único da organização",
              example: "org-uuid-1",
            },
            name: {
              type: "string",
              description: "Nome completo da organização",
              example: "Instituto Federal de Mato Grosso do Sul",
            },
            shortName: {
              type: "string",
              description: "Nome abreviado da organização",
              example: "IFMS",
            },
            active: {
              type: "boolean",
              description: "Status ativo da organização",
              example: true,
            },
          },
        },
        OrganizationMember: {
          type: "object",
          required: ["userId", "organizationId", "role"],
          properties: {
            userId: {
              type: "string",
              description: "ID do usuário membro",
              example: "user-uuid-1",
            },
            organizationId: {
              type: "string",
              description: "ID da organização",
              example: "org-uuid-1",
            },
            role: {
              type: "string",
              enum: ["admin", "member"],
              description: "Papel do usuário na organização",
              example: "admin",
            },
          },
        },
        Campus: {
          type: "object",
          required: ["organizationId", "name", "code", "active"],
          properties: {
            id: {
              type: "string",
              description: "ID único do campus",
              example: "campus-uuid-1",
            },
            organizationId: {
              type: "string",
              description: "ID da organização proprietária",
              example: "org-uuid-1",
            },
            name: {
              type: "string",
              description: "Nome do campus",
              example: "Campus Corumbá",
            },
            code: {
              type: "string",
              description: "Código identificador do campus",
              example: "IFMS-CBA",
            },
            active: {
              type: "boolean",
              description: "Status ativo do campus",
              example: true,
            },
          },
        },
        CampusMember: {
          type: "object",
          required: ["userId", "campusId"],
          properties: {
            userId: {
              type: "string",
              description: "ID do usuário membro",
              example: "user-uuid-1",
            },
            campusId: {
              type: "string",
              description: "ID do campus",
              example: "campus-uuid-1",
            },
          },
        },
        Commission: {
          type: "object",
          required: [
            "campusId",
            "name",
            "type",
            "description",
            "active",
            "year",
          ],
          properties: {
            id: {
              type: "string",
              description: "ID único da comissão",
              example: "commission-uuid-1",
            },
            campusId: {
              type: "string",
              description: "ID do campus",
              example: "campus-uuid-1",
            },
            name: {
              type: "string",
              description: "Nome da comissão",
              example: "Comissão Inventário 2025",
            },
            type: {
              type: "string",
              enum: ["Permanente", "Temporária", "Especial"],
              description: "Tipo da comissão",
              example: "Permanente",
            },
            description: {
              type: "string",
              description: "Descrição da comissão",
              example: "Responsável pelo inventário do ano 2025",
            },
            spreadsheet_url: {
              type: "string",
              format: "uri",
              description: "URL da planilha da comissão",
              example: "https://docs.google.com/planilha",
            },
            active: {
              type: "boolean",
              description: "Status ativo da comissão",
              example: true,
            },
            year: {
              type: "integer",
              description: "Ano de referência da comissão",
              example: 2025,
            },
          },
        },
        CommissionMember: {
          type: "object",
          required: ["userId", "commissionId", "roleInCommission"],
          properties: {
            userId: {
              type: "string",
              description: "ID do usuário membro",
              example: "user-uuid-1",
            },
            commissionId: {
              type: "string",
              description: "ID da comissão",
              example: "commission-uuid-1",
            },
            roleInCommission: {
              type: "string",
              enum: ["Presidente", "Secretário", "Membro"],
              description: "Papel na comissão",
              example: "Presidente",
            },
          },
        },
        InventoryItem: {
          type: "object",
          required: [
            "commissionId",
            "campusId",
            "number",
            "description",
            "brandModel",
            "currentResponsibility",
            "conservationState",
            "location",
            "ed",
            "sector",
          ],
          properties: {
            id: {
              type: "string",
              description: "ID único do item",
              example: "inventory-uuid-1",
            },
            commissionId: {
              type: "string",
              description: "ID da comissão responsável",
              example: "commission-uuid-1",
            },
            campusId: {
              type: "string",
              description: "ID do campus",
              example: "campus-uuid-1",
            },
            number: {
              type: "string",
              description: "Número de patrimônio",
              example: "123456",
            },
            description: {
              type: "string",
              description: "Descrição do item",
              example: "Notebook Dell Latitude 3420",
            },
            brandModel: {
              type: "string",
              description: "Marca e modelo",
              example: "Dell Latitude 3420",
            },
            currentResponsibility: {
              type: "string",
              description: "Responsável atual",
              example: "Setor de Informática",
            },
            conservationState: {
              type: "string",
              enum: ["Excelente", "Bom", "Regular", "Ruim"],
              description: "Estado de conservação",
              example: "Bom",
            },
            location: {
              type: "string",
              description: "Localização atual",
              example: "Sala 102",
            },
            tags: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Tags para categorização",
              example: ["notebook", "TI"],
            },
            ed: {
              type: "string",
              description: "Ano de referência",
              example: "2025",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Data da última atualização",
              example: "2025-06-26T10:30:00.000Z",
            },
            sector: {
              type: "string",
              description: "Setor responsável",
              example: "Informática",
            },
          },
        },
        InventoryHistory: {
          type: "object",
          required: [
            "inventoryItemId",
            "userId",
            "action",
            "changes",
            "observation",
            "timestamp",
          ],
          properties: {
            id: {
              type: "string",
              description: "ID único do histórico",
              example: "history-uuid-1",
            },
            inventoryItemId: {
              type: "string",
              description: "ID do item relacionado",
              example: "inventory-uuid-1",
            },
            userId: {
              type: "string",
              description: "ID do usuário que fez a ação",
              example: "user-uuid-1",
            },
            action: {
              type: "string",
              enum: ["create", "update", "delete"],
              description: "Tipo de ação realizada",
              example: "create",
            },
            changes: {
              type: "string",
              description: "Descrição das mudanças",
              example: "Item adicionado ao sistema.",
            },
            observation: {
              type: "string",
              description: "Observações adicionais",
              example: "Notebook cadastrado durante inventário inicial.",
            },
            image_url: {
              type: "array",
              items: {
                type: "string",
                format: "uri",
              },
              description: "URLs das imagens relacionadas",
              example: ["https://example.com/foto-item1.jpg"],
            },
            timestamp: {
              type: "string",
              format: "date-time",
              description: "Data e hora da ação",
              example: "2025-01-15T10:30:00.000Z",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Mensagem de erro",
              example: "Recurso não encontrado",
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Users",
        description: "Gerenciamento de usuários do sistema",
      },
      {
        name: "Allowed Users",
        description: "Gerenciamento de usuários permitidos (whitelist)",
      },
      {
        name: "Organizations",
        description: "Gerenciamento de organizações (IFMS, UFMS, IFSP)",
      },
      {
        name: "Organization Members",
        description: "Gerenciamento de membros das organizações",
      },
      {
        name: "Campus",
        description: "Gerenciamento de campus das organizações",
      },
      {
        name: "Campus Members",
        description: "Gerenciamento de membros dos campus",
      },
      {
        name: "Commissions",
        description: "Gerenciamento de comissões de inventário",
      },
      {
        name: "Commission Members",
        description: "Gerenciamento de membros das comissões",
      },
      {
        name: "Inventory",
        description: "Gerenciamento de itens de inventário",
      },
      {
        name: "Inventory History",
        description: "Histórico de ações nos itens de inventário",
      },
    ],
  },
  apis: ["./app/api/**/route.ts"], // Caminho para os arquivos de rota da API
};

const specs = swaggerJSDoc(options);
export default specs;
