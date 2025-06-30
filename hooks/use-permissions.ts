"use client";

import { useEffect, useState } from "react";

interface UserPermissions {
  isAdmin: boolean;
  isPresident: boolean;
  canManageCommissions: boolean;
  canUploadSpreadsheets: boolean;
  loading: boolean;
  error: string | null;
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<UserPermissions>({
    isAdmin: false,
    isPresident: false,
    canManageCommissions: false,
    canUploadSpreadsheets: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        // Verificar role do usuário
        const roleResponse = await fetch("/api/auth/get-user-role");
        if (!roleResponse.ok) {
          throw new Error("Erro ao verificar permissões");
        }

        const roleData = await roleResponse.json();
        const userRole = roleData.role;

        const isAdmin = userRole === "admin";
        const isPresident = userRole === "presidente" || isAdmin;

        setPermissions({
          isAdmin,
          isPresident,
          canManageCommissions: isAdmin || isPresident,
          canUploadSpreadsheets: isAdmin || isPresident,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error("Erro ao verificar permissões:", error);
        setPermissions({
          isAdmin: false,
          isPresident: false,
          canManageCommissions: false,
          canUploadSpreadsheets: false,
          loading: false,
          error: error instanceof Error ? error.message : "Erro desconhecido",
        });
      }
    };

    checkPermissions();
  }, []);

  return permissions;
}
