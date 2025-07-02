"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache por 5 minutos por padrão
            staleTime: 5 * 60 * 1000,
            // Manter dados em cache por 10 minutos mesmo quando não usado
            gcTime: 10 * 60 * 1000,
            // Tentar novamente em caso de erro
            retry: 1,
            // Refetch quando a janela volta ao foco
            refetchOnWindowFocus: false,
            // Refetch quando a conexão é restaurada
            refetchOnReconnect: true,
          },
          mutations: {
            // Tentar novamente em caso de erro nas mutações
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
