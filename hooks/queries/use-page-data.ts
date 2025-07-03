import type {
  Campus,
  CampusMember,
  Organization,
  UserProfileWithRelations,
} from "@/interface";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { cacheConfig, queryKeys } from "./query-keys";

/**
 * Hook otimizado para página de perfil
 * Usa contexto global quando possível, senão faz query específica
 */
export function useProfilePageData(userId?: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(userId || ""),
    queryFn: async () => {
      if (!userId) throw new Error("User ID required");

      const response = await fetch(`/api/user?id=${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }
      return response.json() as Promise<UserProfileWithRelations>;
    },
    enabled: !!userId,
    ...cacheConfig.semiStatic,
  });
}

/**
 * Hook otimizado para página de detalhes do campus
 * Faz prefetch de dados relacionados automaticamente
 */
export function useCampusDetailData(campusId: string) {
  const queryClient = useQueryClient();

  // Query principal do campus
  const campusQuery = useQuery({
    queryKey: queryKeys.campuses.detail(campusId),
    queryFn: async () => {
      const response = await fetch(`/api/campus?id=${campusId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch campus");
      }
      return response.json() as Promise<Campus>;
    },
    enabled: !!campusId,
    ...cacheConfig.semiStatic,
  });

  // Query da organização (prefetch quando campus é carregado)
  const organizationQuery = useQuery({
    queryKey: queryKeys.organizations.detail(
      campusQuery.data?.organizationId || ""
    ),
    queryFn: async () => {
      if (!campusQuery.data?.organizationId)
        throw new Error("Organization ID not available");

      const response = await fetch(
        `/api/organization?id=${campusQuery.data.organizationId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch organization");
      }
      return response.json() as Promise<Organization>;
    },
    enabled: !!campusQuery.data?.organizationId,
    ...cacheConfig.static,
  });

  // Query dos membros do campus
  const membersQuery = useQuery({
    queryKey: queryKeys.campuses.members(campusId),
    queryFn: async () => {
      const response = await fetch(`/api/campus-member?campusId=${campusId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch campus members");
      }
      return response.json() as Promise<CampusMember[]>;
    },
    enabled: !!campusId,
    ...cacheConfig.dynamic,
  });

  // Prefetch dados relacionados em background
  React.useEffect(() => {
    if (campusQuery.data) {
      // Prefetch comissões do campus
      queryClient.prefetchQuery({
        queryKey: queryKeys.commissions.list(campusId),
        queryFn: async () => {
          const response = await fetch(`/api/commission?campusId=${campusId}`);
          return response.ok ? response.json() : [];
        },
        ...cacheConfig.semiStatic,
      });
    }
  }, [campusQuery.data, campusId, queryClient]);

  return {
    campus: campusQuery.data,
    organization: organizationQuery.data,
    members: membersQuery.data || [],
    isLoading: campusQuery.isLoading,
    isLoadingOrganization: organizationQuery.isLoading,
    isLoadingMembers: membersQuery.isLoading,
    error: campusQuery.error || organizationQuery.error || membersQuery.error,
    refetch: () => {
      campusQuery.refetch();
      organizationQuery.refetch();
      membersQuery.refetch();
    },
  };
}

/**
 * Hook otimizado para página de detalhes da organização
 * Similar ao campus mas com foco em org → campuses → members
 */
export function useOrganizationDetailData(organizationId: string) {
  const queryClient = useQueryClient();

  // Query principal da organização
  const organizationQuery = useQuery({
    queryKey: queryKeys.organizations.detail(organizationId),
    queryFn: async () => {
      const response = await fetch(`/api/organization?id=${organizationId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch organization");
      }
      return response.json() as Promise<Organization>;
    },
    enabled: !!organizationId,
    ...cacheConfig.static,
  });

  // Query dos campuses da organização
  const campusesQuery = useQuery({
    queryKey: queryKeys.campuses.list(organizationId),
    queryFn: async () => {
      const response = await fetch(
        `/api/campus?organizationId=${organizationId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch organization campuses");
      }
      return response.json() as Promise<Campus[]>;
    },
    enabled: !!organizationId,
    ...cacheConfig.semiStatic,
  });

  // Query dos membros da organização
  const membersQuery = useQuery({
    queryKey: queryKeys.organizations.members(organizationId),
    queryFn: async () => {
      const response = await fetch(
        `/api/organization-member?organizationId=${organizationId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch organization members");
      }
      return response.json();
    },
    enabled: !!organizationId,
    ...cacheConfig.dynamic,
  });

  return {
    organization: organizationQuery.data,
    campuses: campusesQuery.data || [],
    members: membersQuery.data || [],
    isLoading: organizationQuery.isLoading,
    isLoadingCampuses: campusesQuery.isLoading,
    isLoadingMembers: membersQuery.isLoading,
    error: organizationQuery.error || campusesQuery.error || membersQuery.error,
    refetch: () => {
      organizationQuery.refetch();
      campusesQuery.refetch();
      membersQuery.refetch();
    },
  };
}

/**
 * Hook para cache de dados de referência usados em modais
 * Mantém organizações em cache para modais de usuário, campus, etc.
 */
export function useReferenceData() {
  const organizations = useQuery({
    queryKey: queryKeys.organizations.lists(),
    queryFn: async () => {
      const response = await fetch("/api/organization");
      if (!response.ok) {
        throw new Error("Failed to fetch organizations");
      }
      return response.json();
    },
    ...cacheConfig.static, // Dados de referência ficam em cache por mais tempo
  });

  const users = useQuery({
    queryKey: queryKeys.users.lists(),
    queryFn: async () => {
      const response = await fetch("/api/user");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      return response.json();
    },
    ...cacheConfig.semiStatic,
  });

  const campuses = useQuery({
    queryKey: queryKeys.campuses.lists(),
    queryFn: async () => {
      const response = await fetch("/api/campus");
      if (!response.ok) {
        throw new Error("Failed to fetch campuses");
      }
      return response.json();
    },
    ...cacheConfig.semiStatic,
  });

  return {
    organizations: organizations.data || [],
    users: users.data || [],
    campuses: campuses.data || [],
    isLoading: organizations.isLoading || users.isLoading || campuses.isLoading,
    error: organizations.error || users.error || campuses.error,
  };
}

/**
 * Hook para buscar dados de usuário específico com relacionamentos
 * Otimizado para página de detalhes do usuário
 */
export function useUserDetailData(userId: string) {
  const userQuery = useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: async () => {
      const response = await fetch(`/api/user?id=${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      return response.json();
    },
    enabled: !!userId && userId !== "skip",
  });

  const campusesQuery = useQuery({
    queryKey: queryKeys.campuses.lists(),
    queryFn: async () => {
      const response = await fetch("/api/campus");
      if (!response.ok) {
        throw new Error("Failed to fetch campuses");
      }
      return response.json();
    },
  });

  const campusMembersQuery = useQuery({
    queryKey: ["campus-members"],
    queryFn: async () => {
      const response = await fetch("/api/campus-member");
      if (!response.ok) {
        throw new Error("Failed to fetch campus members");
      }
      return response.json();
    },
  });

  const organizationsQuery = useQuery({
    queryKey: queryKeys.organizations.lists(),
    queryFn: async () => {
      const response = await fetch("/api/organization");
      if (!response.ok) {
        throw new Error("Failed to fetch organizations");
      }
      return response.json();
    },
  });

  const organizationMembersQuery = useQuery({
    queryKey: ["organization-members"],
    queryFn: async () => {
      const response = await fetch("/api/organization-member");
      if (!response.ok) {
        throw new Error("Failed to fetch organization members");
      }
      return response.json();
    },
  });

  const isLoading =
    userQuery.isLoading ||
    campusesQuery.isLoading ||
    campusMembersQuery.isLoading ||
    organizationsQuery.isLoading ||
    organizationMembersQuery.isLoading;

  const error =
    userQuery.error ||
    campusesQuery.error ||
    campusMembersQuery.error ||
    organizationsQuery.error ||
    organizationMembersQuery.error;

  // Processar dados relacionais
  const userCampuses = React.useMemo(() => {
    if (!campusMembersQuery.data || !campusesQuery.data) return [];

    return campusMembersQuery.data
      .filter((member: any) => member.userId === userId)
      .map((member: any) =>
        campusesQuery.data.find((campus: any) => campus.id === member.campusId)
      )
      .filter(Boolean);
  }, [campusMembersQuery.data, campusesQuery.data, userId]);

  const userOrganizations = React.useMemo(() => {
    if (!organizationMembersQuery.data || !organizationsQuery.data) return [];

    return organizationMembersQuery.data
      .filter((member: any) => member.userId === userId)
      .map((member: any) =>
        organizationsQuery.data.find(
          (org: any) => org.id === member.organizationId
        )
      )
      .filter(Boolean);
  }, [organizationMembersQuery.data, organizationsQuery.data, userId]);

  return {
    user: userQuery.data,
    campuses: campusesQuery.data || [],
    userCampuses,
    organizations: organizationsQuery.data || [],
    userOrganizations,
    campusMembers: campusMembersQuery.data || [],
    organizationMembers: organizationMembersQuery.data || [],
    isLoading,
    error,
    refetch: () => {
      userQuery.refetch();
      campusesQuery.refetch();
      campusMembersQuery.refetch();
      organizationsQuery.refetch();
      organizationMembersQuery.refetch();
    },
  };
}

/**
 * Hook para buscar dados de comissão específica com relacionamentos
 * Otimizado para página de detalhes da comissão
 */
export function useCommissionDetailData(commissionId: string) {
  const commissionQuery = useQuery({
    queryKey: queryKeys.commissions.detail(commissionId),
    queryFn: async () => {
      const response = await fetch(`/api/commission/${commissionId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch commission");
      }
      return response.json();
    },
    enabled: !!commissionId,
    ...cacheConfig.dynamic,
  });

  return {
    commission: commissionQuery.data,
    isLoading: commissionQuery.isLoading,
    error: commissionQuery.error,
    refetch: commissionQuery.refetch,
  };
}

/**
 * Hook para buscar dados de comissão e membros
 * Otimizado para página de gerenciamento de membros da comissão
 */
export function useCommissionMembersData(commissionId: string) {
  const commissionQuery = useQuery({
    queryKey: queryKeys.commissions.detail(commissionId),
    queryFn: async () => {
      const response = await fetch(`/api/commission/${commissionId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch commission");
      }
      return response.json();
    },
    enabled: !!commissionId,
    ...cacheConfig.dynamic,
  });

  const membersQuery = useQuery({
    queryKey: queryKeys.commissions.members(commissionId),
    queryFn: async () => {
      const response = await fetch(
        `/api/commission-member?commissionId=${commissionId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch commission members");
      }
      return response.json();
    },
    enabled: !!commissionId,
    ...cacheConfig.dynamic,
  });

  return {
    commission: commissionQuery.data,
    members: membersQuery.data || [],
    isLoadingCommission: commissionQuery.isLoading,
    isLoadingMembers: membersQuery.isLoading,
    isLoading: commissionQuery.isLoading || membersQuery.isLoading,
    error: commissionQuery.error || membersQuery.error,
    refetchCommission: commissionQuery.refetch,
    refetchMembers: membersQuery.refetch,
    refetch: () => {
      commissionQuery.refetch();
      membersQuery.refetch();
    },
  };
}

/**
 * Hook para buscar dados de membro específico da comissão
 * Otimizado para página de detalhes do membro
 */
export function useCommissionMemberDetailData(
  commissionId: string,
  userId: string
) {
  const memberQuery = useQuery({
    queryKey: ["commission-member", commissionId, userId],
    queryFn: async () => {
      const response = await fetch(
        `/api/commission-member?commissionId=${commissionId}&userId=${userId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch commission member");
      }
      return response.json();
    },
    enabled: !!commissionId && !!userId,
    ...cacheConfig.dynamic,
  });

  const commissionQuery = useQuery({
    queryKey: queryKeys.commissions.detail(commissionId),
    queryFn: async () => {
      const response = await fetch(`/api/commission/${commissionId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch commission");
      }
      return response.json();
    },
    enabled: !!commissionId,
    ...cacheConfig.dynamic,
  });

  return {
    member: memberQuery.data,
    commission: commissionQuery.data,
    isLoadingMember: memberQuery.isLoading,
    isLoadingCommission: commissionQuery.isLoading,
    isLoading: memberQuery.isLoading || commissionQuery.isLoading,
    error: memberQuery.error || commissionQuery.error,
    refetch: () => {
      memberQuery.refetch();
      commissionQuery.refetch();
    },
  };
}

/**
 * Hook para buscar histórico de inventário da comissão
 * Otimizado para página de histórico
 */
export function useCommissionHistoryData(commissionId: string) {
  const commissionQuery = useQuery({
    queryKey: queryKeys.commissions.detail(commissionId),
    queryFn: async () => {
      const response = await fetch(`/api/commission/${commissionId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch commission");
      }
      return response.json();
    },
    enabled: !!commissionId,
    ...cacheConfig.dynamic,
  });

  const historyQuery = useQuery({
    queryKey: ["commission-history", commissionId],
    queryFn: async () => {
      const response = await fetch(
        `/api/inventory-history?commissionId=${commissionId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch inventory history");
      }
      return response.json();
    },
    enabled: !!commissionId,
    ...cacheConfig.dynamic,
  });

  return {
    commission: commissionQuery.data,
    history: historyQuery.data || [],
    isLoadingCommission: commissionQuery.isLoading,
    isLoadingHistory: historyQuery.isLoading,
    isLoading: commissionQuery.isLoading || historyQuery.isLoading,
    error: commissionQuery.error || historyQuery.error,
    refetch: () => {
      commissionQuery.refetch();
      historyQuery.refetch();
    },
  };
}

/**
 * Hook para buscar dados de item individual de inventário
 * Otimizado para página de detalhes do item
 */
export function useInventoryItemDetailData(itemId: string) {
  const itemQuery = useQuery({
    queryKey: ["inventory-item", itemId],
    queryFn: async () => {
      const response = await fetch(`/api/inventory?id=${itemId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch inventory item");
      }
      return response.json();
    },
    enabled: !!itemId,
    ...cacheConfig.dynamic,
  });

  return {
    item: itemQuery.data,
    isLoading: itemQuery.isLoading,
    error: itemQuery.error,
    refetch: itemQuery.refetch,
  };
}
