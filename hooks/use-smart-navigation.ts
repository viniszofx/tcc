"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";

/**
 * Hook para navegação inteligente com fallbacks baseados na hierarquia de rotas
 */
export function useSmartNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Define a rota de fallback baseada na hierarquia atual
   */
  const getFallbackRoute = useCallback((currentPath: string): string => {
    // Remover parâmetros de query e normalizar path
    const cleanPath = currentPath.split("?")[0];
    const segments = cleanPath.split("/").filter(Boolean);

    // Mapeamento de fallbacks específicos
    const routeMap: Record<string, string> = {
      // Páginas de perfil e configurações
      "application/profile": "/application",
      "application/settings": "/application",

      // Organizações
      "application/organizations": "/application",

      // Campus
      "application/campus": "/application",

      // Usuários
      "application/users": "/application",

      // Comissões - padrões hierárquicos
      "application/commissions": "/application",

      // Fallbacks diretos para seções principais
      "application/inventories": "/application",
      "application/upload": "/application",
      "application/history": "/application",
    };

    // Verificar rotas específicas primeiro
    const routeKey = segments.slice(0, -1).join("/"); // Remove último segmento
    if (routeMap[routeKey]) {
      return routeMap[routeKey];
    }

    // Lógica hierárquica para sub-rotas
    if (segments.includes("application")) {
      const appIndex = segments.indexOf("application");

      // Se está em detalhes de organização
      if (
        segments[appIndex + 1] === "organizations" &&
        segments[appIndex + 3]
      ) {
        return "/application/organizations";
      }

      // Se está em detalhes de campus
      if (segments[appIndex + 1] === "campus" && segments[appIndex + 3]) {
        return "/application/campus";
      }

      // Se está em detalhes de usuário
      if (segments[appIndex + 1] === "users" && segments[appIndex + 3]) {
        return "/application/users";
      }

      // Se está em comissões
      if (segments[appIndex + 1] === "commissions") {
        const commissionIndex = appIndex + 1;

        // Se está em sub-páginas de comissão específica
        if (segments[commissionIndex + 2]) {
          const subPage = segments[commissionIndex + 2];
          const commissionId = segments[commissionIndex + 1];

          switch (subPage) {
            case "members":
              // Se está em detalhe de membro, volta para lista de membros
              if (segments[commissionIndex + 4]) {
                return `/application/commissions/${commissionId}/members`;
              }
              // Se está na lista de membros, volta para detalhes da comissão
              return `/application/commissions/${commissionId}`;

            case "inventories":
              // Se está em item específico, volta para lista de inventário
              if (segments[commissionIndex + 4]) {
                return `/application/commissions/${commissionId}/inventories`;
              }
              // Se está na lista de inventário, volta para detalhes da comissão
              return `/application/commissions/${commissionId}`;

            case "upload":
            case "history":
              // Sub-páginas voltam para detalhes da comissão
              return `/application/commissions/${commissionId}`;

            default:
              return `/application/commissions/${commissionId}`;
          }
        }

        // Se está em detalhes de comissão, volta para lista de comissões
        if (segments[commissionIndex + 1]) {
          return "/application/commissions";
        }
      }

      // Fallback geral para application
      return "/application";
    }

    // Se está em auth
    if (segments.includes("auth")) {
      return "/auth/login";
    }

    // Fallback final
    return "/application";
  }, []);

  /**
   * Navega de volta usando hierarquia inteligente
   */
  const goBack = useCallback(() => {
    const fallbackRoute = getFallbackRoute(pathname);
    router.push(fallbackRoute);
  }, [pathname, router, getFallbackRoute]);

  /**
   * Navega para uma rota específica ou usa fallback
   */
  const navigateTo = useCallback(
    (route?: string) => {
      if (route) {
        router.push(route);
      } else {
        goBack();
      }
    },
    [router, goBack]
  );

  /**
   * Verifica se é seguro usar router.back() baseado no histórico
   */
  const canSafelyGoBack = useCallback((): boolean => {
    // Verificar se existe histórico no navegador
    if (typeof window !== "undefined") {
      // Se a página foi acessada diretamente (sem referrer), não é seguro
      if (!document.referrer) {
        return false;
      }

      // Se o referrer é de um domínio diferente, não é seguro
      try {
        const referrerUrl = new URL(document.referrer);
        const currentUrl = new URL(window.location.href);

        if (referrerUrl.origin !== currentUrl.origin) {
          return false;
        }

        // Verificar se o referrer é uma rota válida da aplicação
        const referrerPath = referrerUrl.pathname;
        if (
          !referrerPath.startsWith("/application") &&
          !referrerPath.startsWith("/auth")
        ) {
          return false;
        }
      } catch {
        return false;
      }

      // Verificar se há histórico suficiente
      if (window.history.length <= 1) {
        return false;
      }

      // Se chegou até aqui, provavelmente é seguro
      return true;
    }

    return false;
  }, []);

  /**
   * Navegação inteligente que tenta router.back() se seguro, senão usa fallback
   */
  const smartGoBack = useCallback(() => {
    if (canSafelyGoBack()) {
      router.back();
    } else {
      goBack();
    }
  }, [router, canSafelyGoBack, goBack]);

  return {
    goBack,
    navigateTo,
    smartGoBack,
    getFallbackRoute,
    canSafelyGoBack,
    currentPath: pathname,
  };
}
