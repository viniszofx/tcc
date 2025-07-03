import { prisma } from "@/lib/prisma";
import { createSupabaseServer } from "@/lib/supabase-server";
import { NextRequest } from "next/server";
import { createUserContext, defineAbilitiesFor } from "./abilities";
import { Actions, AppAbility, Subjects } from "./types";

export interface PermissionCheck {
  action: Actions;
  subject: Subjects;
  resource?: any;
}

export interface AuthorizedUser {
  id: string;
  role: string;
  organizationMembers?: Array<{
    organizationId: string;
    role: string;
    organization: { id: string };
  }>;
  commissionMembers?: Array<{
    commissionId: string;
    roleInCommission: string;
    commission: {
      id: string;
      campus: {
        organizationId: string;
      };
    };
  }>;
  ability: AppAbility;
}

/**
 * Middleware para verificar autenticação e permissões usando CASL
 */
export async function withPermissions(
  request: NextRequest,
  requiredPermissions: PermissionCheck[]
): Promise<
  | { success: true; user: AuthorizedUser }
  | { success: false; error: string; status: number }
> {
  try {
    // 1. Verificar autenticação com Supabase
    const supabase = await createSupabaseServer();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return {
        success: false,
        error: "Não autorizado",
        status: 401,
      };
    }

    // 2. Buscar dados completos do usuário no banco
    const userProfile = await prisma.userProfile.findUnique({
      where: { id: authUser.id },
      include: {
        organizationMembers: {
          include: {
            organization: true,
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

    if (!userProfile || !userProfile.active) {
      return {
        success: false,
        error: "Usuário não encontrado ou inativo",
        status: 404,
      };
    }

    // 3. Criar contexto do usuário e habilidades
    const userContext = createUserContext(userProfile);
    const ability = defineAbilitiesFor(userContext);

    // 4. Verificar se o usuário está na whitelist
    const allowedUser = await prisma.allowedUser.findUnique({
      where: { email: userProfile.email },
    });

    if (!allowedUser || !allowedUser.status) {
      return {
        success: false,
        error: "Usuário não autorizado a acessar o sistema",
        status: 403,
      };
    }

    // 5. Verificar permissões específicas
    for (const permission of requiredPermissions) {
      const hasPermission = permission.resource
        ? ability.can(
            permission.action,
            permission.subject,
            permission.resource
          )
        : ability.can(permission.action, permission.subject);

      if (!hasPermission) {
        return {
          success: false,
          error: `Permissão insuficiente: não pode ${permission.action} ${permission.subject}`,
          status: 403,
        };
      }
    }

    // 6. Retornar usuário autorizado com suas habilidades
    return {
      success: true,
      user: {
        ...userProfile,
        ability,
      },
    };
  } catch (error) {
    console.error("Erro no middleware de permissões:", error);
    return {
      success: false,
      error: "Erro interno do servidor",
      status: 500,
    };
  }
}

/**
 * Helper para verificar permissões específicas
 */
export function canPerform(
  ability: AppAbility,
  action: Actions,
  subject: Subjects,
  resource?: any
): boolean {
  return resource
    ? ability.can(action, subject, resource)
    : ability.can(action, subject);
}

/**
 * Helper para verificar múltiplas permissões
 */
export function canPerformAll(
  ability: AppAbility,
  permissions: PermissionCheck[]
): boolean {
  return permissions.every(({ action, subject, resource }) =>
    canPerform(ability, action, subject, resource)
  );
}

/**
 * Helper para verificar se pode acessar dados de uma organização específica
 */
export function canAccessOrganization(
  ability: AppAbility,
  organizationId: string,
  action: Actions = "read"
): boolean {
  return ability.can(action, "Organization");
}

/**
 * Helper para verificar se pode acessar dados de uma comissão específica
 */
export function canAccessCommission(
  ability: AppAbility,
  commissionId: string,
  action: Actions = "read"
): boolean {
  return ability.can(action, "Commission");
}

/**
 * Helper para verificar se pode gerenciar itens de inventário de uma comissão
 */
export function canManageInventoryItems(
  ability: AppAbility,
  commissionId: string,
  action: Actions = "read"
): boolean {
  return ability.can(action, "InventoryItem");
}
