"use client";

import { useCallback, useEffect, useState } from "react";

interface StorageStatus {
  isConfigured: boolean;
  buckets: string[];
  hasInventoryBucket: boolean;
  error: string | null;
}

interface SystemStatus {
  isConfigured: boolean;
  hasUsers: boolean;
  hasOrganizations: boolean;
  hasUserProfiles: boolean;
  needsSetup: boolean;
  storage: StorageStatus;
  stats: {
    allowedUsers: number;
    organizations: number;
    userProfiles: number;
  };
}

interface SystemStatusResponse {
  status: SystemStatus;
  message: string;
  error?: string;
}

export function useSystemStatus() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRepairing, setIsRepairing] = useState(false);

  const checkSystemStatus = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/system/status", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store", // Sempre buscar dados atualizados
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(
            "Muitas tentativas. Tente novamente em alguns minutos."
          );
        }
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data: SystemStatusResponse = await response.json();

      if (data.error) {
        setError(data.error);
        // Em caso de erro, assumir que precisa de setup
        setStatus({
          isConfigured: false,
          hasUsers: false,
          hasOrganizations: false,
          hasUserProfiles: false,
          needsSetup: true,
          storage: {
            isConfigured: false,
            buckets: [],
            hasInventoryBucket: false,
            error: "Não foi possível verificar o status do storage",
          },
          stats: {
            allowedUsers: 0,
            organizations: 0,
            userProfiles: 0,
          },
        });
      } else {
        // Usar diretamente o objeto status da resposta
        setStatus(data.status);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      console.error("Erro ao verificar status do sistema:", err);

      // Em caso de erro, assumir que precisa de setup
      setStatus({
        isConfigured: false,
        hasUsers: false,
        hasOrganizations: false,
        hasUserProfiles: false,
        needsSetup: true,
        storage: {
          isConfigured: false,
          buckets: [],
          hasInventoryBucket: false,
          error: "Não foi possível verificar o status do storage",
        },
        stats: {
          allowedUsers: 0,
          organizations: 0,
          userProfiles: 0,
        },
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSystemStatus();
  }, [checkSystemStatus]);

  const refetch = useCallback(() => {
    checkSystemStatus();
  }, [checkSystemStatus]);

  // Função para tentar reparar problemas do sistema automaticamente
  const repairSystem = useCallback(async () => {
    setIsRepairing(true);
    setError(null);

    try {
      console.log("🔧 Tentando reparar sistema...");
      const response = await fetch("/api/system/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(
            "Muitas tentativas. Tente novamente em alguns minutos."
          );
        }
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Atualizar o status com os dados mais recentes
      setStatus(data.currentStatus);

      console.log(
        "✅ Tentativa de reparo concluída:",
        data.success ? "Sucesso" : "Falha"
      );
      return data.success;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      console.error("Erro ao tentar reparar sistema:", err);
      return false;
    } finally {
      setIsRepairing(false);
    }
  }, []);

  return {
    status,
    loading,
    error,
    refetch,
    repairSystem,
    isRepairing,
    // Métodos utilitários - só retornar needsSetup como true se explicitamente verdadeiro
    isConfigured: status?.isConfigured || false,
    needsSetup: status?.needsSetup === true,
    // Status do storage
    storageOk: status?.storage?.hasInventoryBucket || false,
    storageError: status?.storage?.error || null,
  };
}
