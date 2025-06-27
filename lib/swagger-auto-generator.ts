import fs from "fs";
import path from "path";

interface RouteInfo {
  path: string;
  methods: string[];
  fileName: string;
}

interface SwaggerPath {
  [key: string]: {
    [method: string]: {
      tags: string[];
      summary: string;
      description: string;
      parameters?: any[];
      requestBody?: any;
      responses: any;
      [key: string]: any; // Permite propriedades adicionais
    };
  };
}

class SwaggerAutoGenerator {
  private apiDir: string;
  private routes: RouteInfo[] = [];

  constructor(apiDir: string = "./app/api") {
    this.apiDir = apiDir;
  }

  // Escaneia todas as rotas da API
  scanRoutes(): RouteInfo[] {
    const routes: RouteInfo[] = [];
    const scanDirectory = (dir: string, basePath: string = "") => {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          // Recursivamente escaneia subdiretórios
          scanDirectory(fullPath, path.join(basePath, item));
        } else if (item === "route.ts" || item === "route.js") {
          // Encontrou um arquivo de rota
          const routePath = basePath.replace(/\\/g, "/");
          const apiPath = `/api${routePath ? "/" + routePath : ""}`;

          // Lê o arquivo para detectar métodos HTTP
          const content = fs.readFileSync(fullPath, "utf-8");
          const methods = this.detectHttpMethods(content);

          routes.push({
            path: apiPath,
            methods,
            fileName: fullPath,
          });
        }
      }
    };

    scanDirectory(this.apiDir);
    this.routes = routes;
    return routes;
  }

  // Detecta métodos HTTP no arquivo
  private detectHttpMethods(content: string): string[] {
    const methods: string[] = [];
    const httpMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"];

    for (const method of httpMethods) {
      const regex = new RegExp(`export\\s+async\\s+function\\s+${method}`, "i");
      if (regex.test(content)) {
        methods.push(method.toLowerCase());
      }
    }

    return methods;
  }

  // Gera schema baseado no nome da rota
  private generateSchemaName(routePath: string): string {
    const pathParts = routePath
      .split("/")
      .filter((part) => part && part !== "api");
    if (pathParts.length === 0) return "Default";

    // Converte kebab-case para PascalCase
    return pathParts
      .map((part) =>
        part
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join("")
      )
      .join("");
  }

  // Gera tag baseado no nome da rota
  private generateTag(routePath: string): string {
    const pathParts = routePath
      .split("/")
      .filter((part) => part && part !== "api");
    if (pathParts.length === 0) return "Default";

    return pathParts
      .map((part) =>
        part
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      )
      .join(" ");
  }

  // Gera documentação automática para cada rota
  generateSwaggerPaths(): SwaggerPath {
    const paths: SwaggerPath = {};

    for (const route of this.routes) {
      const schemaName = this.generateSchemaName(route.path);
      const tag = this.generateTag(route.path);

      paths[route.path] = {};

      for (const method of route.methods) {
        paths[route.path][method] = this.generateMethodDocumentation(
          method,
          route.path,
          schemaName,
          tag
        );
      }
    }

    return paths;
  }

  // Gera documentação para um método específico
  private generateMethodDocumentation(
    method: string,
    path: string,
    schemaName: string,
    tag: string
  ): any {
    // Mapeia esquemas conhecidos - se não existir, usa um esquema genérico
    const knownSchemas = [
      'User', 'AllowedUser', 'Organization', 'OrganizationMember',
      'Campus', 'CampusMember', 'Commission', 'CommissionMember',
      'InventoryItem', 'InventoryHistory'
    ];

    const schemaRef = knownSchemas.includes(schemaName) 
      ? `#/components/schemas/${schemaName}`
      : '#/components/schemas/GenericObject';

    const baseDoc = {
      tags: [tag],
      summary: `${method.toUpperCase()} ${tag.toLowerCase()}`,
      description: `Operação ${method.toUpperCase()} para ${tag.toLowerCase()}`,
      responses: {
        "200": {
          description: "Operação realizada com sucesso",
          content: {
            "application/json": {
              schema: {
                oneOf: [
                  { $ref: schemaRef },
                  {
                    type: "array",
                    items: { $ref: schemaRef },
                  },
                ],
              },
            },
          },
        },
        "400": {
          description: "Dados inválidos",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        "404": {
          description: "Recurso não encontrado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        "500": {
          description: "Erro interno do servidor",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
      },
    };

    switch (method.toLowerCase()) {
      case "get":
        return {
          ...baseDoc,
          summary: `Listar ${tag.toLowerCase()} ou buscar por ID`,
          description: `Retorna uma lista de ${tag.toLowerCase()} ou um item específico se o ID for fornecido`,
          parameters: [
            {
              in: "query",
              name: "id",
              schema: { type: "string" },
              description: `ID específico para buscar`,
              required: false,
            },
          ],
        };

      case "post":
        return {
          ...baseDoc,
          summary: `Criar novo ${tag.toLowerCase().slice(0, -1)}`,
          description: `Cria um novo ${tag
            .toLowerCase()
            .slice(0, -1)} no sistema`,
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: schemaRef },
              },
            },
          },
          responses: {
            ...baseDoc.responses,
            "201": {
              description: "Recurso criado com sucesso",
              content: {
                "application/json": {
                  schema: { $ref: schemaRef },
                },
              },
            },
          },
        };

      case "put":
        return {
          ...baseDoc,
          summary: `Atualizar ${tag.toLowerCase().slice(0, -1)} existente`,
          description: `Atualiza um ${tag
            .toLowerCase()
            .slice(0, -1)} existente no sistema`,
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: schemaRef },
              },
            },
          },
        };

      case "delete":
        return {
          ...baseDoc,
          summary: `Deletar ${tag.toLowerCase().slice(0, -1)}`,
          description: `Remove um ${tag.toLowerCase().slice(0, -1)} do sistema`,
          parameters: [
            {
              in: "query",
              name: "id",
              required: true,
              schema: { type: "string" },
              description: `ID do ${tag
                .toLowerCase()
                .slice(0, -1)} a ser deletado`,
            },
          ],
          responses: {
            ...baseDoc.responses,
            "200": {
              description: "Recurso deletado com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        example: "Recurso deletado com sucesso",
                      },
                    },
                  },
                },
              },
            },
          },
        };

      default:
        return baseDoc;
    }
  }

  // Gera especificação Swagger completa
  generateSwaggerSpec() {
    this.scanRoutes();
    const paths = this.generateSwaggerPaths();

    return {
      openapi: "3.0.0",
      info: {
        title: "Sistema de Inventário Multi-Organizacional - Auto Generated",
        version: "1.0.0",
        description: `
          API completa para gerenciamento de inventário de múltiplas organizações educacionais.
          
          **Documentação gerada automaticamente**
          
          **Organizações Suportadas:**
          - IFMS - Instituto Federal de Mato Grosso do Sul
          - UFMS - Universidade Federal de Mato Grosso do Sul
          - IFSP - Instituto Federal de São Paulo
          
          Esta documentação foi gerada automaticamente escaneando as rotas da API.
          Total de rotas encontradas: ${this.routes.length}
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
      paths,
      components: {
        schemas: {
          // Schemas básicos - podem ser expandidos conforme necessário
          User: {
            type: "object",
            properties: {
              id: { type: "string", example: "user-uuid-1" },
              name: { type: "string", example: "João Silva" },
              email: {
                type: "string",
                format: "email",
                example: "joao@example.com",
              },
              description: { type: "string", example: "Administrador" },
              avatar: {
                type: "string",
                format: "uri",
                example: "https://example.com/avatar.jpg",
              },
              active: { type: "boolean", example: true },
            },
          },
          AllowedUser: {
            type: "object",
            properties: {
              id: { type: "string", example: "allowed-user-uuid-1" },
              name: { type: "string", example: "João Silva" },
              email: {
                type: "string",
                format: "email",
                example: "joao@example.com",
              },
              status: { type: "boolean", example: true },
            },
          },
          Organization: {
            type: "object",
            properties: {
              id: { type: "string", example: "org-uuid-1" },
              name: {
                type: "string",
                example: "Instituto Federal de Mato Grosso do Sul",
              },
              shortName: { type: "string", example: "IFMS" },
              active: { type: "boolean", example: true },
            },
          },
          OrganizationMember: {
            type: "object",
            properties: {
              userId: { type: "string", example: "user-uuid-1" },
              organizationId: { type: "string", example: "org-uuid-1" },
              role: {
                type: "string",
                enum: ["admin", "member"],
                example: "admin",
              },
            },
          },
          Campus: {
            type: "object",
            properties: {
              id: { type: "string", example: "campus-uuid-1" },
              organizationId: { type: "string", example: "org-uuid-1" },
              name: { type: "string", example: "Campus Corumbá" },
              code: { type: "string", example: "IFMS-CBA" },
              active: { type: "boolean", example: true },
            },
          },
          CampusMember: {
            type: "object",
            properties: {
              userId: { type: "string", example: "user-uuid-1" },
              campusId: { type: "string", example: "campus-uuid-1" },
            },
          },
          Commission: {
            type: "object",
            properties: {
              id: { type: "string", example: "commission-uuid-1" },
              campusId: { type: "string", example: "campus-uuid-1" },
              name: { type: "string", example: "Comissão Inventário 2025" },
              type: {
                type: "string",
                enum: ["Permanente", "Temporária", "Especial"],
                example: "Permanente",
              },
              description: {
                type: "string",
                example: "Responsável pelo inventário do ano 2025",
              },
              spreadsheet_url: {
                type: "string",
                format: "uri",
                example: "https://docs.google.com/planilha",
              },
              active: { type: "boolean", example: true },
              year: { type: "integer", example: 2025 },
            },
          },
          CommissionMember: {
            type: "object",
            properties: {
              userId: { type: "string", example: "user-uuid-1" },
              commissionId: { type: "string", example: "commission-uuid-1" },
              roleInCommission: {
                type: "string",
                enum: ["Presidente", "Secretário", "Membro"],
                example: "Presidente",
              },
            },
          },
          InventoryItem: {
            type: "object",
            properties: {
              id: { type: "string", example: "inventory-uuid-1" },
              commissionId: { type: "string", example: "commission-uuid-1" },
              campusId: { type: "string", example: "campus-uuid-1" },
              number: { type: "string", example: "123456" },
              description: {
                type: "string",
                example: "Notebook Dell Latitude 3420",
              },
              brandModel: { type: "string", example: "Dell Latitude 3420" },
              currentResponsibility: {
                type: "string",
                example: "Setor de Informática",
              },
              conservationState: {
                type: "string",
                enum: ["Excelente", "Bom", "Regular", "Ruim"],
                example: "Bom",
              },
              location: { type: "string", example: "Sala 102" },
              tags: {
                type: "array",
                items: { type: "string" },
                example: ["notebook", "TI"],
              },
              ed: { type: "string", example: "2025" },
              updatedAt: {
                type: "string",
                format: "date-time",
                example: "2025-06-26T10:30:00.000Z",
              },
              sector: { type: "string", example: "Informática" },
            },
          },
          InventoryHistory: {
            type: "object",
            properties: {
              id: { type: "string", example: "history-uuid-1" },
              inventoryItemId: { type: "string", example: "inventory-uuid-1" },
              userId: { type: "string", example: "user-uuid-1" },
              action: {
                type: "string",
                enum: ["create", "update", "delete"],
                example: "create",
              },
              changes: {
                type: "string",
                example: "Item adicionado ao sistema.",
              },
              observation: {
                type: "string",
                example: "Notebook cadastrado durante inventário inicial.",
              },
              image_url: {
                type: "array",
                items: { type: "string", format: "uri" },
                example: ["https://example.com/foto.jpg"],
              },
              timestamp: {
                type: "string",
                format: "date-time",
                example: "2025-01-15T10:30:00.000Z",
              },
            },
          },
          Error: {
            type: "object",
            properties: {
              error: { type: "string", example: "Mensagem de erro" },
            },
          },
          GenericObject: {
            type: "object",
            description: "Objeto genérico para rotas sem esquema específico definido",
            properties: {
              id: { type: "string", example: "uuid-example" },
              name: { type: "string", example: "Nome do recurso" },
              description: { type: "string", example: "Descrição do recurso" },
              active: { type: "boolean", example: true },
              createdAt: {
                type: "string",
                format: "date-time",
                example: "2025-06-26T10:30:00.000Z",
              },
              updatedAt: {
                type: "string",
                format: "date-time",
                example: "2025-06-26T10:30:00.000Z",
              },
            },
            additionalProperties: true,
          },
        },
      },
    };
  }

  // Salva a especificação em um arquivo
  saveSwaggerSpec(outputPath: string = "./lib/swagger-auto.json") {
    const spec = this.generateSwaggerSpec();
    fs.writeFileSync(outputPath, JSON.stringify(spec, null, 2));
    console.log(`📚 Swagger spec gerado automaticamente em: ${outputPath}`);
    console.log(`🔍 Rotas encontradas: ${this.routes.length}`);
    this.routes.forEach((route) => {
      console.log(
        `   ${route.path} [${route.methods.join(", ").toUpperCase()}]`
      );
    });
  }

  // Retorna informações sobre as rotas escaneadas
  getRouteInfo() {
    return {
      totalRoutes: this.routes.length,
      routes: this.routes.map((route) => ({
        path: route.path,
        methods: route.methods,
        fileName: path.relative(process.cwd(), route.fileName),
      })),
    };
  }
}

export default SwaggerAutoGenerator;
