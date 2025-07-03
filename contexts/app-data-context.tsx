"use client";

import { useCampuses } from "@/hooks/queries/use-campus-query";
import { useOrganizations } from "@/hooks/queries/use-organizations-query";
import { useUserRole } from "@/hooks/queries/use-users-query";
import type { UserRole } from "@/hooks/use-user-permissions";
import type { Campus, Organization } from "@/interface";
import { createContext, ReactNode, useContext } from "react";

interface AppData {
  // Dados globais que raramente mudam
  organizations: Organization[];
  campuses: Campus[];

  // Estados de loading
  isLoadingOrganizations: boolean;
  isLoadingCampuses: boolean;

  // Funções de refresh
  refreshOrganizations: () => void;
  refreshCampuses: () => void;
}

interface UserData {
  user: UserRole | null;
  role: string | null;
  isPresident: boolean;
  isFirstAccess: boolean;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

interface AppDataContextType {
  appData: AppData;
  userData: UserData;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  // Queries para dados globais com cache otimizado
  const {
    data: organizations = [],
    isLoading: isLoadingOrganizations,
    refetch: refreshOrganizations,
  } = useOrganizations();

  const {
    data: campuses = [],
    isLoading: isLoadingCampuses,
    refetch: refreshCampuses,
  } = useCampuses();

  // Query para dados do usuário
  const {
    data: userRoleData,
    isLoading: isLoadingUser,
    error: userError,
    refetch: refetchUser,
  } = useUserRole();

  const appData: AppData = {
    organizations,
    campuses,
    isLoadingOrganizations,
    isLoadingCampuses,
    refreshOrganizations,
    refreshCampuses,
  };

  const userData: UserData = {
    user: userRoleData?.user || null,
    role: userRoleData?.role || null,
    isPresident: userRoleData?.isPresident || false,
    isFirstAccess: userRoleData?.isFirstAccess || false,
    isLoading: isLoadingUser,
    error: userError instanceof Error ? userError.message : null,
    refetch: refetchUser,
  };

  return (
    <AppDataContext.Provider value={{ appData, userData }}>
      {children}
    </AppDataContext.Provider>
  );
}

// Hooks para acessar os dados
export function useAppData() {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error("useAppData must be used within an AppDataProvider");
  }
  return context.appData;
}

export function useAppUserData() {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error("useAppUserData must be used within an AppDataProvider");
  }
  return context.userData;
}

// Hook combinado para facilidade
export function useAppContext() {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppDataProvider");
  }
  return context;
}
