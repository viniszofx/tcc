"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";

/**
 * Hook para gerenciar o estado de loading durante navegações
 */
export function useNavigationLoading() {
  const router = useRouter();
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  /**
   * Navega para uma URL com estado de loading
   */
  const navigateWithLoading = useCallback(
    (url: string, loadingKey?: string) => {
      const key = loadingKey || url;
      
      // Ativar loading
      setLoadingStates(prev => ({ ...prev, [key]: true }));
      
      // Navegar
      router.push(url);
      
      // Desativar loading após um tempo (fallback)
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, [key]: false }));
      }, 3000);
    },
    [router]
  );

  /**
   * Verifica se uma navegação específica está carregando
   */
  const isNavigating = useCallback(
    (loadingKey: string) => {
      return loadingStates[loadingKey] || false;
    },
    [loadingStates]
  );

  /**
   * Limpa o estado de loading para uma chave específica
   */
  const clearLoading = useCallback((loadingKey: string) => {
    setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
  }, []);

  /**
   * Limpa todos os estados de loading
   */
  const clearAllLoading = useCallback(() => {
    setLoadingStates({});
  }, []);

  return {
    navigateWithLoading,
    isNavigating,
    clearLoading,
    clearAllLoading,
  };
}

/**
 * Hook simplificado para um único botão de navegação
 */
export function useButtonNavigation(url: string, loadingKey?: string) {
  const { navigateWithLoading, isNavigating } = useNavigationLoading();
  const key = loadingKey || url;

  const navigate = useCallback(() => {
    navigateWithLoading(url, key);
  }, [navigateWithLoading, url, key]);

  return {
    navigate,
    isLoading: isNavigating(key),
  };
}