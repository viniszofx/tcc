import { NextResponse } from "next/server";

// Especificação Swagger otimizada para Next.js e Vercel
const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Sistema de Inventário Multi-Organizacional - API",
    version: "2.0.0",
    description: `
      ## Sistema de Inventário Acadêmico
      
      API RESTful para gerenciamento completo de inventário de múltiplas organizações educacionais.
      
      ### Organizações Suportadas:
      - **IFMS** - Instituto Federal de Mato Grosso do Sul
      - **UFMS** - Universidade Federal de Mato Grosso do Sul  
      - **IFSP** - Instituto Federal de São Paulo
      
      ### Funcionalidades Principais:
      - 🔐 **Autenticação Segura** - Sistema baseado em Supabase Auth
      - 👥 **Gestão Multi-Organizacional** - Suporte a múltiplas instituições
      - 🏢 **Gestão de Campus** - Organização por campus e unidades
      - 📊 **Comissões de Inventário** - Gestão de comissões e membros
      - 📋 **Inventário Completo** - CRUD de itens com histórico
      - 🔒 **Isolamento de Dados** - Segurança por comissão e campus
      - 📤 **Upload de Planilhas** - Importação em lote via Excel/CSV
      - 📈 **Auditoria Completa** - Histórico de todas as operações
      
      ### Autenticação:
      Esta API utiliza autenticação baseada em tokens JWT fornecidos pelo Supabase.
      Para usar os endpoints protegidos, inclua o token no header Authorization.
    `,
    contact: {
      name: "Sistema de Inventário",
      email: "suporte@inventario.edu.br",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}/api`
        : process.env.NODE_ENV === "production"
        ? "https://your-production-domain.vercel.app/api"
        : "http://localhost:3000/api",
      description:
        process.env.NODE_ENV === "production"
          ? "Servidor de Produção (Vercel)"
          : "Servidor de Desenvolvimento",
    },
  ],
  tags: [
    {
      name: "Auth",
      description: "🔐 Autenticação e autorização de usuários",
    },
    {
      name: "Users",
      description: "👥 Gerenciamento completo de usuários e perfis",
    },
    {
      name: "Organizations",
      description: "🏛️ Gestão de organizações educacionais",
    },
    {
      name: "Campus",
      description: "🏢 Gerenciamento de campus e unidades",
    },
    {
      name: "Commissions",
      description: "📊 Gestão de comissões de inventário",
    },
    {
      name: "Inventory",
      description: "📋 Operações de inventário e itens patrimoniais",
    },
    {
      name: "System",
      description: "⚙️ Configurações e status do sistema",
    },
  ],
  paths: {
    "/user": {
      get: {
        tags: ["Users"],
        summary: "Listar usuários",
        description: "Lista todos os usuários do sistema",
        responses: {
          200: {
            description: "Lista de usuários",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/User" },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Users"],
        summary: "Criar usuário",
        description: "Cria um novo usuário no sistema",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateUser" },
            },
          },
        },
        responses: {
          201: {
            description: "Usuário criado com sucesso",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
          400: { $ref: "#/components/responses/ValidationError" },
        },
      },
    },
    "/commission": {
      get: {
        tags: ["Commissions"],
        summary: "Listar comissões",
        description: "Lista todas as comissões do sistema",
        responses: {
          200: {
            description: "Lista de comissões",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Commission" },
                },
              },
            },
          },
        },
      },
    },
    "/inventory": {
      get: {
        tags: ["Inventory"],
        summary: "Listar itens de inventário",
        description: "Lista itens de inventário com filtros opcionais",
        parameters: [
          {
            name: "commissionId",
            in: "query",
            schema: { type: "string" },
            description: "Filtrar por ID da comissão",
          },
        ],
        responses: {
          200: {
            description: "Lista de itens de inventário",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/InventoryItem" },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Token JWT fornecido pelo Supabase Auth",
      },
    },
    schemas: {
      User: {
        type: "object",
        required: ["id", "name", "email", "active"],
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "ID único do usuário (UUID)",
            example: "550e8400-e29b-41d4-a716-446655440000",
          },
          name: {
            type: "string",
            minLength: 2,
            maxLength: 100,
            description: "Nome completo do usuário",
            example: "Vinicius Souza Silva",
          },
          email: {
            type: "string",
            format: "email",
            description: "Email institucional do usuário",
            example: "vinicius.silva@ifms.edu.br",
          },
          description: {
            type: "string",
            maxLength: 255,
            description: "Descrição/cargo do usuário",
            example: "Coordenador de Patrimônio",
            nullable: true,
          },
          avatar: {
            type: "string",
            format: "uri",
            description: "URL do avatar do usuário",
            example: "https://storage.supabase.co/avatars/user.jpg",
            nullable: true,
          },
          active: {
            type: "boolean",
            description: "Status ativo do usuário",
            example: true,
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Data de criação do usuário",
            example: "2024-01-15T10:30:00Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "Data da última atualização",
            example: "2024-01-20T14:22:00Z",
          },
        },
      },
      CreateUser: {
        type: "object",
        required: ["name", "email"],
        properties: {
          name: {
            type: "string",
            minLength: 2,
            maxLength: 100,
            description: "Nome completo do usuário",
            example: "João Santos",
          },
          email: {
            type: "string",
            format: "email",
            description: "Email institucional",
            example: "joao.santos@ifms.edu.br",
          },
          description: {
            type: "string",
            maxLength: 255,
            description: "Descrição/cargo do usuário",
            example: "Técnico em Assuntos Educacionais",
          },
        },
      },
      Commission: {
        type: "object",
        required: ["id", "name", "type", "year"],
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "ID único da comissão",
          },
          name: {
            type: "string",
            description: "Nome da comissão",
            example: "Comissão de Inventário 2024",
          },
          type: {
            type: "string",
            enum: ["Permanente", "Temporária", "Especial"],
            description: "Tipo da comissão",
            example: "Permanente",
          },
          year: {
            type: "integer",
            minimum: 2020,
            maximum: 2030,
            description: "Ano da comissão",
            example: 2024,
          },
        },
      },
      InventoryItem: {
        type: "object",
        required: ["id", "number", "description"],
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "ID único do item",
          },
          number: {
            type: "string",
            description: "Número patrimonial único",
            example: "123456789",
          },
          description: {
            type: "string",
            description: "Descrição do item",
            example: "Notebook Dell Inspiron 15",
          },
        },
      },
      Error: {
        type: "object",
        required: ["error"],
        properties: {
          error: {
            type: "string",
            description: "Mensagem de erro",
            example: "Recurso não encontrado",
          },
          details: {
            type: "string",
            description: "Detalhes adicionais do erro",
          },
        },
      },
    },
    responses: {
      ValidationError: {
        description: "Erro de validação nos dados enviados",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
          },
        },
      },
    },
  },
  security: [
    {
      BearerAuth: [],
    },
  ],
};

export async function GET() {
  try {
    return NextResponse.json(swaggerSpec);
  } catch (error) {
    console.error("Erro ao gerar especificação Swagger:", error);
    return NextResponse.json(
      { error: "Erro ao gerar documentação da API" },
      { status: 500 }
    );
  }
}
