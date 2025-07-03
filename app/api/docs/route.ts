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
      externalDocs: {
        description: "Documentação do Supabase Auth",
        url: "https://supabase.com/docs/guides/auth",
      },
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
      name: "Inventory History",
      description: "📈 Histórico e auditoria de operações",
    },
    {
      name: "System",
      description: "⚙️ Configurações e status do sistema",
    },
    {
      name: "Upload",
      description: "📤 Upload de arquivos e planilhas",
    },
  ],
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
      InventoryItem: {
        type: "object",
        required: ["commissionId", "campusId", "number", "description"],
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "ID único do item",
          },
          commissionId: {
            type: "string",
            format: "uuid",
            description: "ID da comissão responsável",
          },
          campusId: {
            type: "string",
            format: "uuid",
            description: "ID do campus do item",
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
          conservationState: {
            type: "string",
            enum: ["bom", "regular", "ruim", "inservível"],
            description: "Estado de conservação",
            example: "bom",
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
        },
      },
    },
    responses: {
      NotFound: {
        description: "Recurso não encontrado",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
          },
        },
      },
      Unauthorized: {
        description: "Não autorizado - Token inválido ou ausente",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
          },
        },
      },
      ValidationError: {
        description: "Erro de validação",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
          },
        },
      },
      Forbidden: {
        description: "Acesso negado",
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
  paths: {
    "/user": {
      get: {
        tags: ["Users"],
        summary: "Listar usuários",
        description: "Lista todos os usuários do sistema com filtros opcionais",
        parameters: [
          {
            name: "id",
            in: "query",
            description: "ID específico do usuário",
            schema: {
              type: "string",
              format: "uuid",
            },
          },
          {
            name: "email",
            in: "query",
            description: "Email do usuário",
            schema: {
              type: "string",
              format: "email",
            },
          },
        ],
        responses: {
          200: {
            description: "Lista de usuários ou usuário específico",
            content: {
              "application/json": {
                schema: {
                  oneOf: [
                    {
                      type: "array",
                      items: { $ref: "#/components/schemas/User" },
                    },
                    { $ref: "#/components/schemas/User" },
                  ],
                },
              },
            },
          },
          404: { $ref: "#/components/responses/NotFound" },
        },
        security: [{ BearerAuth: [] }],
      },
      post: {
        tags: ["Users"],
        summary: "Criar usuário",
        description: "Cria um novo usuário no sistema",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email"],
                properties: {
                  name: {
                    type: "string",
                    minLength: 2,
                    maxLength: 100,
                    example: "João Santos",
                  },
                  email: {
                    type: "string",
                    format: "email",
                    example: "joao.santos@ifms.edu.br",
                  },
                  description: {
                    type: "string",
                    maxLength: 255,
                    example: "Técnico em Assuntos Educacionais",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Usuário criado com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: { $ref: "#/components/schemas/User" },
                    temporaryPassword: {
                      type: "string",
                      description: "Senha temporária gerada",
                    },
                  },
                },
              },
            },
          },
          400: { $ref: "#/components/responses/ValidationError" },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
        security: [{ BearerAuth: [] }],
      },
    },
    "/inventory": {
      get: {
        tags: ["Inventory"],
        summary: "Listar itens de inventário",
        description: "Lista itens de inventário com filtros por comissão",
        parameters: [
          {
            name: "commissionId",
            in: "query",
            required: true,
            description: "ID da comissão",
            schema: {
              type: "string",
              format: "uuid",
            },
          },
          {
            name: "campusId",
            in: "query",
            description: "Filtrar por campus",
            schema: {
              type: "string",
              format: "uuid",
            },
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
          403: { $ref: "#/components/responses/Forbidden" },
        },
        security: [{ BearerAuth: [] }],
      },
      post: {
        tags: ["Inventory"],
        summary: "Criar item de inventário",
        description: "Cria um novo item de inventário",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["commissionId", "item"],
                properties: {
                  commissionId: {
                    type: "string",
                    format: "uuid",
                    description: "ID da comissão",
                  },
                  item: {
                    $ref: "#/components/schemas/InventoryItem",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Item criado com sucesso",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/InventoryItem" },
              },
            },
          },
          400: { $ref: "#/components/responses/ValidationError" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
        security: [{ BearerAuth: [] }],
      },
    },
    "/commission/upload": {
      post: {
        tags: ["Upload"],
        summary: "Upload de planilha de inventário",
        description:
          "Faz upload e processamento de planilha de inventário para uma comissão específica",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["commissionId", "processedData"],
                properties: {
                  commissionId: {
                    type: "string",
                    format: "uuid",
                    description: "ID da comissão",
                  },
                  processedData: {
                    type: "array",
                    items: {
                      type: "object",
                      description: "Dados processados da planilha",
                    },
                    description:
                      "Array com os dados já processados da planilha",
                  },
                  description: {
                    type: "string",
                    description: "Descrição do upload",
                  },
                  fileName: {
                    type: "string",
                    description: "Nome do arquivo original",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Planilha processada com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    message: {
                      type: "string",
                      example: "Dados processados e salvos com sucesso",
                    },
                    itemsCreated: {
                      type: "integer",
                      description: "Número de itens criados",
                    },
                  },
                },
              },
            },
          },
          400: { $ref: "#/components/responses/ValidationError" },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
        },
        security: [{ BearerAuth: [] }],
      },
    },
    "/system/status": {
      get: {
        tags: ["System"],
        summary: "Status do sistema",
        description: "Verifica o status geral do sistema e suas dependências",
        responses: {
          200: {
            description: "Status do sistema",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      enum: ["healthy", "degraded", "down"],
                      description: "Status geral do sistema",
                    },
                    database: {
                      type: "object",
                      properties: {
                        connected: { type: "boolean" },
                        latency: { type: "number" },
                      },
                    },
                    storage: {
                      type: "object",
                      properties: {
                        available: { type: "boolean" },
                        hasSpreadsheetsBucket: { type: "boolean" },
                      },
                    },
                    auth: {
                      type: "object",
                      properties: {
                        available: { type: "boolean" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export async function GET() {
  try {
    return NextResponse.json(swaggerSpec, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600", // Cache por 1 hora no Vercel
      },
    });
  } catch (error) {
    console.error("Erro ao gerar especificação Swagger:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Adicionar suporte para OPTIONS para CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
