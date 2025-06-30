"use client";

import { useCallback, useState } from "react";

interface ApiError {
  message: string;
  status: number;
}

interface UseSecureApiOptions {
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
}

export function useSecureApi(options: UseSecureApiOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const { baseUrl = "", defaultHeaders = {} } = options;

  const makeRequest = useCallback(
    async <T>(
      endpoint: string,
      options: {
        method?: string;
        body?: any;
        headers?: Record<string, string>;
      } = {}
    ): Promise<T> => {
      const { method = "GET", body, headers = {} } = options;

      setLoading(true);
      setError(null);

      try {
        const url = `${baseUrl}${endpoint}`;
        const requestHeaders = {
          "Content-Type": "application/json",
          ...defaultHeaders,
          ...headers,
        };

        const config: RequestInit = {
          method,
          headers: requestHeaders,
          credentials: "include", // Incluir cookies de sessão
        };

        if (body && method !== "GET") {
          config.body = JSON.stringify(body);
        }

        const response = await fetch(url, config);

        if (!response.ok) {
          let errorMessage = "Erro na requisição";

          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch {
            // Se não conseguir fazer parse do erro, usar mensagem padrão
            switch (response.status) {
              case 401:
                errorMessage = "Não autenticado";
                break;
              case 403:
                errorMessage = "Acesso negado";
                break;
              case 404:
                errorMessage = "Recurso não encontrado";
                break;
              case 429:
                errorMessage = "Muitas tentativas. Tente novamente mais tarde";
                break;
              case 500:
                errorMessage = "Erro interno do servidor";
                break;
              default:
                errorMessage = `Erro ${response.status}`;
            }
          }

          const apiError: ApiError = {
            message: errorMessage,
            status: response.status,
          };

          setError(apiError);
          throw apiError;
        }

        const data = await response.json();
        return data;
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError);
        throw apiError;
      } finally {
        setLoading(false);
      }
    },
    [baseUrl, defaultHeaders]
  );

  // Métodos específicos para facilitar o uso
  const get = useCallback(
    <T>(endpoint: string, headers?: Record<string, string>) =>
      makeRequest<T>(endpoint, { method: "GET", headers }),
    [makeRequest]
  );

  const post = useCallback(
    <T>(endpoint: string, body?: any, headers?: Record<string, string>) =>
      makeRequest<T>(endpoint, { method: "POST", body, headers }),
    [makeRequest]
  );

  const put = useCallback(
    <T>(endpoint: string, body?: any, headers?: Record<string, string>) =>
      makeRequest<T>(endpoint, { method: "PUT", body, headers }),
    [makeRequest]
  );

  const del = useCallback(
    <T>(endpoint: string, headers?: Record<string, string>) =>
      makeRequest<T>(endpoint, { method: "DELETE", headers }),
    [makeRequest]
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    loading,
    error,
    makeRequest,
    get,
    post,
    put,
    delete: del,
    clearError,
  };
}

// Hook específico para autenticação
export function useAuthApi() {
  const api = useSecureApi();

  const validateUser = useCallback(
    async (email: string) => {
      return api.post("/api/auth/validate-user", { email });
    },
    [api]
  );

  const getUserRole = useCallback(
    async (email: string) => {
      return api.post("/api/auth/get-user-role", { email });
    },
    [api]
  );

  const verifySession = useCallback(async () => {
    return api.get("/api/auth/verify-session");
  }, [api]);

  return {
    ...api,
    validateUser,
    getUserRole,
    verifySession,
  };
}

// Hook específico para usuários
export function useUserApi() {
  const api = useSecureApi();

  const getUsers = useCallback(
    async (organizationId?: string) => {
      const params = organizationId ? `?organizationId=${organizationId}` : "";
      return api.get(`/api/user/secure${params}`);
    },
    [api]
  );

  const getUser = useCallback(
    async (id: string) => {
      return api.get(`/api/user/secure?id=${id}`);
    },
    [api]
  );

  const createUser = useCallback(
    async (userData: { name: string; email: string }) => {
      return api.post("/api/user/secure", userData);
    },
    [api]
  );

  const updateUser = useCallback(
    async (id: string, userData: Partial<{ name: string; email: string }>) => {
      return api.put("/api/user/secure", { id, ...userData });
    },
    [api]
  );

  return {
    ...api,
    getUsers,
    getUser,
    createUser,
    updateUser,
  };
}
