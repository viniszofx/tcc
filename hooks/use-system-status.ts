"use client";

import { useCallback, useEffect, useState } from "react";

interface SystemStatus {
  isConfigured: boolean;
  needsSetup: boolean;
}

interface SystemStatusResponse {
  needsSetup: boolean;
  configured: boolean;
  message: string;
  error?: string;
}

export function useSystemStatus() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkSystemStatus = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/system/check-status", {
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
          needsSetup: true,
        });
      } else {
        // Converter a resposta da API para nosso formato interno
        const convertedStatus = {
          isConfigured: data.configured,
          needsSetup: data.needsSetup,
        };

        setStatus(convertedStatus);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      console.error("Erro ao verificar status do sistema:", err);

      // Em caso de erro, assumir que precisa de setup
      setStatus({
        isConfigured: false,
        needsSetup: true,
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

  return {
    status,
    loading,
    error,
    refetch,
    // Métodos utilitários - só retornar needsSetup como true se explicitamente verdadeiro
    isConfigured: status?.isConfigured || false,
    needsSetup: status?.needsSetup === true,
  };
}
