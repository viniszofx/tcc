import { prisma } from "@/lib/prisma";
import { createSupabaseServer } from "@/lib/supabase-server";
import { NextRequest } from "next/server";

export interface UserWithPermissions {
  id: string;
  name: string;
  email: string;
  role: "admin global" | "admin" | "member";
  organization?: {
    id: string;
    name: string;
    shortName: string;
  };
  commissions?: {
    id: string;
    name: string;
    roleInCommission: string;
  }[];
  permissions: {
    canManageOrganizations: boolean;
    canManageCampuses: boolean;
    canManageUsers: boolean;
    canManageCommissions: boolean;
    canUploadSpreadsheets: boolean;
    canManageCommissionMembers: boolean;
    canAccessCommission: boolean;
    canViewInventory: boolean;
  };
}

export async function withAuth(
  request: NextRequest,
  requiredPermissions?: string[]
): Promise<
  | { success: true; user: UserWithPermissions }
  | { success: false; error: string; status: number }
> {
  try {
    // Verificar autenticação via Supabase
    const supabase = await createSupabaseServer();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user?.email) {
      return {
        success: false,
        error: "Usuário não autenticado",
        status: 401,
      };
    }

    const email = session.user.email;

    // Verificar se o usuário está autorizado
    const allowedUser = await prisma.allowedUser.findUnique({
      where: { email },
    });

    if (!allowedUser || !allowedUser.status) {
      return {
        success: false,
        error: "Usuário não autorizado",
        status: 403,
      };
    }

    // Buscar dados completos do usuário
    const userProfile = await prisma.userProfile.findUnique({
      where: { email },
      include: {
        organizationMembers: {
          include: {
            organization: true,
          },
        },
        commissionMembers: {
          include: {
            commission: true,
          },
        },
      },
    });

    if (!userProfile) {
      return {
        success: false,
        error: "Usuário não encontrado",
        status: 404,
      };
    }

    // Determinar role principal baseado no UserProfile.role
    let role: "admin global" | "admin" | "member" = userProfile.role as
      | "admin global"
      | "admin"
      | "member";
    let organization = null;
    let commissions: any[] = [];

    // Verificar se é admin de alguma organização para contexto
    if (userProfile.organizationMembers?.length > 0) {
      const adminMembership = userProfile.organizationMembers.find(
        (member) => member.role === "admin"
      );

      if (adminMembership) {
        organization = {
          id: adminMembership.organization.id,
          name: adminMembership.organization.name,
          shortName: adminMembership.organization.shortName,
        };
      } else {
        const memberMembership = userProfile.organizationMembers[0];
        organization = {
          id: memberMembership.organization.id,
          name: memberMembership.organization.name,
          shortName: memberMembership.organization.shortName,
        };
      }
    }

    // Verificar se é presidente de alguma comissão
    if (userProfile.commissionMembers?.length > 0) {
      commissions = userProfile.commissionMembers.map((member) => ({
        id: member.commission.id,
        name: member.commission.name,
        roleInCommission: member.roleInCommission,
      }));
    }

    // Definir permissões baseadas no role
    const isAdmin = role === "admin" || role === "admin global";
    const isMember = role === "member";

    const permissions = {
      canManageOrganizations: isAdmin,
      canManageCampuses: isAdmin,
      canManageUsers: isAdmin,
      canManageCommissions: isAdmin,
      canUploadSpreadsheets: isAdmin,
      canManageCommissionMembers: isAdmin,
      canAccessCommission: isAdmin || isMember,
      canViewInventory: isAdmin || isMember,
    };

    // Verificar permissões específicas se requeridas
    if (requiredPermissions && requiredPermissions.length > 0) {
      for (const permission of requiredPermissions) {
        if (!permissions[permission as keyof typeof permissions]) {
          return {
            success: false,
            error: "Permissão insuficiente",
            status: 403,
          };
        }
      }
    }

    const userWithPermissions: UserWithPermissions = {
      id: userProfile.id,
      name: userProfile.name,
      email: userProfile.email,
      role,
      organization: organization || undefined,
      commissions,
      permissions,
    };

    return {
      success: true,
      user: userWithPermissions,
    };
  } catch (error) {
    console.error("Erro no middleware de autenticação:", error);
    return {
      success: false,
      error: "Erro interno do servidor",
      status: 500,
    };
  }
}
