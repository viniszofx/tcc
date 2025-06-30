import { z } from "zod";

// Schema para validação de email
export const emailSchema = z
  .string()
  .email("Email inválido")
  .min(1, "Email é obrigatório");

// Schema para validação de dados do usuário
export const userDataSchema = z.object({
  email: emailSchema,
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  id: z.string().uuid("ID inválido").optional(),
});

// Schema para validação de login
export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .max(100, "Senha muito longa"),
});

// Schema para validação de setup
export const setupSchema = z.object({
  organization: z.object({
    name: z
      .string()
      .min(1, "Nome da organização é obrigatório")
      .max(100, "Nome muito longo"),
    shortName: z
      .string()
      .min(1, "Nome curto é obrigatório")
      .max(20, "Nome curto muito longo"),
  }),
  campus: z.object({
    name: z
      .string()
      .min(1, "Nome do campus é obrigatório")
      .max(100, "Nome muito longo"),
    code: z
      .string()
      .min(1, "Código do campus é obrigatório")
      .max(20, "Código muito longo"),
  }),
  admin: z.object({
    name: z
      .string()
      .min(1, "Nome do administrador é obrigatório")
      .max(100, "Nome muito longo"),
    email: emailSchema,
  }),
});

// Tipo para resposta segura do usuário (sem dados sensíveis)
export interface SafeUserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  organization?: {
    id: string;
    name: string;
    shortName: string;
  };
  redirectPath: string;
}

// Função para sanitizar dados do usuário antes de enviar ao cliente
export function sanitizeUserData(userData: any): SafeUserResponse {
  return {
    id: userData.id,
    name: userData.name,
    email: userData.email,
    role: userData.role || "member",
    organization: userData.organization
      ? {
          id: userData.organization.id,
          name: userData.organization.name,
          shortName: userData.organization.shortName,
        }
      : undefined,
    redirectPath: userData.redirectPath || "/dashboard",
  };
}

// Função para validar se o usuário está autenticado via Supabase
export async function validateSupabaseSession(
  request: Request
): Promise<{ user: any; error: string | null }> {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { user: null, error: "Token de autenticação não fornecido" };
    }

    // Aqui você pode implementar validação adicional do token se necessário
    // Por enquanto, vamos confiar no middleware do Supabase

    return { user: true, error: null };
  } catch (error) {
    return { user: null, error: "Erro ao validar sessão" };
  }
}

// Função para validar entrada de API
export function validateApiInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: boolean; data?: T; error?: string } {
  try {
    const result = schema.safeParse(data);

    if (!result.success) {
      const errors = result.error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");
      return { success: false, error: errors };
    }

    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: "Erro na validação dos dados" };
  }
}

// Função para verificar rate limiting (implementação básica)
const requestCounts = new Map<string, { count: number; lastReset: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = requestCounts.get(identifier);

  if (!record || now - record.lastReset > windowMs) {
    requestCounts.set(identifier, { count: 1, lastReset: now });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}
