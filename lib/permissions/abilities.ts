import { AbilityBuilder, createMongoAbility } from "@casl/ability";
import { AppAbility, UserContext } from "./types";

/**
 * Define as habilidades/permissões do usuário baseado no seu contexto
 */
export function defineAbilitiesFor(userContext: UserContext): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(
    createMongoAbility
  );

  // ========== NÍVEL DE SISTEMA ==========

  if (userContext.role === "admin global") {
    // Admin Global pode fazer TUDO no sistema
    can("manage", "all");
    return build();
  }

  if (userContext.role === "admin") {
    // Admin pode fazer TUDO no sistema (mesmo nível que admin global para simplificar)
    can("manage", "all");
    return build();
  }

  // ========== PERMISSÕES BASE PARA MEMBROS ==========

  // Todos os usuários autenticados podem:
  // - Ler e atualizar seus próprios dados
  can("read", "User");
  can("update", "User");

  // ========== NÍVEL DE ORGANIZAÇÃO ==========

  userContext.organizationMemberships.forEach((membership) => {
    if (membership.role === "admin") {
      // Admin de Organização pode gerenciar TUDO na sua organização
      can("manage", "Organization");
      can("manage", "Campus");
      can("manage", "User");
      can("manage", "Commission");
      can("manage", "InventoryItem");
      can("manage", "CommissionMember");
      can("manage", "Spreadsheet");
    } else {
      // Membro de organização pode visualizar dados da organização
      can("read", "Organization");
      can("read", "Campus");
      can("read", "Commission");
    }
  });

  // ========== NÍVEL DE COMISSÃO ==========

  userContext.commissionMemberships.forEach((membership) => {
    if (membership.roleInCommission === "Presidente") {
      // Presidente de Comissão pode:
      // - Gerenciar a comissão
      can("manage", "Commission");

      // - Fazer upload de arquivos
      can("upload", "Spreadsheet");

      // - Adicionar/remover usuários da sua organização
      can("assign", "CommissionMember");
      can("remove", "CommissionMember");

      // - Visualizar todos os itens da comissão
      can("read", "InventoryItem");
      can("read", "InventoryHistory");
    }

    // Todos os membros de comissão (incluindo presidentes) podem:
    // - Visualizar dados da comissão
    can("read", "Commission");

    // - Gerenciar itens de inventário (CRUD completo)
    can("create", "InventoryItem");
    can("read", "InventoryItem");
    can("update", "InventoryItem");
    can("delete", "InventoryItem");

    // - Visualizar histórico de inventário
    can("read", "InventoryHistory");

    // - Criar registros de histórico (quando editam itens)
    can("create", "InventoryHistory");
  });

  return build();
}

/**
 * Utilitário para verificar se o usuário pode executar uma ação em um recurso
 */
export function checkPermission(
  ability: any,
  action: string,
  subject: string,
  resource?: any
): boolean {
  if (resource) {
    return ability.can(action, subject, resource);
  }
  return ability.can(action, subject);
}

/**
 * Utilitário para verificar múltiplas permissões de uma vez
 */
export function checkPermissions(
  ability: any,
  permissions: Array<{ action: string; subject: string; resource?: any }>
): boolean {
  return permissions.every(({ action, subject, resource }) =>
    checkPermission(ability, action, subject, resource)
  );
}

/**
 * Utilitário para verificar se o usuário pode acessar uma página específica
 */
export function canAccessPage(ability: any, page: string): boolean {
  switch (page) {
    case "/application/organizations":
      return ability.can("read", "Organization");

    case "/application/campus":
      return ability.can("read", "Campus");

    case "/application/users":
      return ability.can("read", "User");

    case "/application/commissions":
      return ability.can("read", "Commission");

    default:
      return true; // Páginas não restritas
  }
}

/**
 * Cria um contexto de usuário a partir dos dados do banco
 */
export function createUserContext(user: {
  id: string;
  role?: string;
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
}): UserContext {
  return {
    id: user.id,
    role: (user.role || "member") as "admin global" | "admin" | "member",
    organizationMemberships:
      user.organizationMembers?.map((member) => ({
        organizationId: member.organization.id,
        role: member.role as "admin" | "member",
      })) || [],
    commissionMemberships:
      user.commissionMembers?.map((member) => ({
        commissionId: member.commission.id,
        roleInCommission: member.roleInCommission as "Presidente" | "Membro",
        organizationId: member.commission.campus.organizationId,
      })) || [],
  };
}
