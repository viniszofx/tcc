import { NextResponse } from "next/server";

// Especificação Swagger estática otimizada para Vercel
const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Sistema de Inventário - API",
    version: "1.0.0",
    description: "API para gerenciamento de inventário acadêmico",
    contact: {
      name: "Sistema de Inventário",
      email: "suporte@inventario.edu.br",
    },
  },
  servers: [
    {
      url:
        process.env.NODE_ENV === "production"
          ? "https://sua-url-vercel.vercel.app/api"
          : "http://localhost:3000/api",
      description:
        process.env.NODE_ENV === "production" ? "Produção" : "Desenvolvimento",
    },
  ],
  tags: [
    { name: "Auth", description: "Autenticação e autorização" },
    { name: "Users", description: "Gerenciamento de usuários" },
    { name: "Campus", description: "Gerenciamento de campus" },
    { name: "Organizations", description: "Gerenciamento de organizações" },
    { name: "Commissions", description: "Gerenciamento de comissões" },
    { name: "Inventory", description: "Gerenciamento de inventário" },
    { name: "System", description: "Informações do sistema" },
  ],
  paths: {
    "/auth/verify-session": {
      get: {
        tags: ["Auth"],
        summary: "Verificar sessão do usuário",
        description: "Verifica se a sessão do usuário está válida",
        responses: {
          200: {
            description: "Sessão válida",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: { $ref: "#/components/schemas/User" },
                    isValid: { type: "boolean" },
                  },
                },
              },
            },
          },
          401: { description: "Sessão inválida" },
        },
      },
    },
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
                schema: {
                  type: "object",
                  properties: {
                    user: { $ref: "#/components/schemas/User" },
                    temporaryPassword: { type: "string" },
                  },
                },
              },
            },
          },
          400: { description: "Dados inválidos" },
        },
      },
    },
    "/campus": {
      get: {
        tags: ["Campus"],
        summary: "Listar campus",
        description: "Lista todos os campus do sistema",
        responses: {
          200: {
            description: "Lista de campus",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Campus" },
                },
              },
            },
          },
        },
      },
    },
    "/organization": {
      get: {
        tags: ["Organizations"],
        summary: "Listar organizações",
        description: "Lista todas as organizações do sistema",
        responses: {
          200: {
            description: "Lista de organizações",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Organization" },
                },
              },
            },
          },
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
      post: {
        tags: ["Commissions"],
        summary: "Criar comissão",
        description: "Cria uma nova comissão",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateCommission" },
            },
          },
        },
        responses: {
          201: {
            description: "Comissão criada com sucesso",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Commission" },
              },
            },
          },
        },
      },
    },
    "/commission/{id}": {
      get: {
        tags: ["Commissions"],
        summary: "Buscar comissão por ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Comissão encontrada",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Commission" },
              },
            },
          },
          404: { description: "Comissão não encontrada" },
        },
      },
      put: {
        tags: ["Commissions"],
        summary: "Atualizar comissão",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateCommission" },
            },
          },
        },
        responses: {
          200: {
            description: "Comissão atualizada",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Commission" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Commissions"],
        summary: "Deletar comissão",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Comissão deletada com sucesso" },
          404: { description: "Comissão não encontrada" },
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
          {
            name: "campusId",
            in: "query",
            schema: { type: "string" },
            description: "Filtrar por ID do campus",
          },
          {
            name: "sector",
            in: "query",
            schema: { type: "string" },
            description: "Filtrar por setor",
          },
          {
            name: "ed",
            in: "query",
            schema: { type: "string" },
            description: "Filtrar por edifício",
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
      post: {
        tags: ["Inventory"],
        summary: "Upload de planilha de inventário",
        description: "Processa dados de inventário em lote",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  commissionId: { type: "string" },
                  items: {
                    type: "array",
                    items: { $ref: "#/components/schemas/InventoryItemInput" },
                  },
                  metadata: {
                    type: "object",
                    properties: {
                      fileName: { type: "string" },
                      fileSize: { type: "number" },
                      fileUrl: { type: "string" },
                      recordCount: { type: "number" },
                      uploadedBy: { type: "string" },
                      timestamp: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Dados processados com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    summary: {
                      type: "object",
                      properties: {
                        totalItems: { type: "number" },
                        processedCount: { type: "number" },
                        errorCount: { type: "number" },
                        commissionId: { type: "string" },
                        timestamp: { type: "string" },
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
    "/system": {
      get: {
        tags: ["System"],
        summary: "Status do sistema",
        description: "Informações sobre o status do sistema",
        responses: {
          200: {
            description: "Status do sistema",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string" },
                    version: { type: "string" },
                    timestamp: { type: "string" },
                    environment: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          role: { type: "string", enum: ["admin", "user"] },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CreateUser: {
        type: "object",
        required: ["name", "email", "role", "campusId"],
        properties: {
          name: { type: "string" },
          email: { type: "string", format: "email" },
          role: { type: "string", enum: ["admin", "user"] },
          campusId: { type: "string", format: "uuid" },
          organizationRole: { type: "string", enum: ["admin", "member"] },
        },
      },
      Campus: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          organizationId: { type: "string", format: "uuid" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Organization: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          type: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Commission: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          type: { type: "string" },
          description: { type: "string" },
          campusId: { type: "string", format: "uuid" },
          spreadsheetUrl: { type: "string" },
          active: { type: "boolean" },
          year: { type: "number" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      CreateCommission: {
        type: "object",
        required: ["name", "type", "campusId", "year"],
        properties: {
          name: { type: "string" },
          type: { type: "string" },
          description: { type: "string" },
          campusId: { type: "string", format: "uuid" },
          year: { type: "number" },
        },
      },
      UpdateCommission: {
        type: "object",
        properties: {
          name: { type: "string" },
          type: { type: "string" },
          description: { type: "string" },
          spreadsheetUrl: { type: "string" },
          active: { type: "boolean" },
          year: { type: "number" },
        },
      },
      InventoryItem: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          commissionId: { type: "string", format: "uuid" },
          campusId: { type: "string", format: "uuid" },
          number: { type: "string" },
          description: { type: "string" },
          brandModel: { type: "string" },
          currentResponsibility: { type: "string" },
          conservationState: { type: "string" },
          location: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
          ed: { type: "string" },
          sector: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      InventoryItemInput: {
        type: "object",
        properties: {
          numeroPatrimonio: { type: "string" },
          item: { type: "string" },
          especificacao: { type: "string" },
          estado: { type: "string" },
          subsecao: { type: "string" },
          ed: { type: "string" },
          setor: { type: "string" },
          observacoes: { type: "string" },
        },
      },
    },
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [{ BearerAuth: [] }],
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
