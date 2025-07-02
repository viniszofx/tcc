"use client";

import BackButton from "@/components/custom/back-button";
import { routes } from "@/components/custom/routes-title";
import { useParams, usePathname } from "next/navigation";

const HeaderTitle = () => {
  const pathname = usePathname();
  const params = useParams();

  const convertToRegex = (prefix: string) => {
    const regexString = "^" + prefix.replace(/\[.*?\]/g, "[^/]+") + "$";
    return new RegExp(regexString);
  };

  const matchedRoute = routes.find((route) =>
    convertToRegex(route.prefix).test(pathname)
  );

  let title = matchedRoute?.title || "Dashboard";
  if (params.commission_id && title.includes("[commission_id]")) {
    title = title.replace("[commission_id]", params.commission_id as string);
  }

  // Verificar se não está na página inicial do application
  const isMainPage = pathname === "/" || pathname === "/application";

  // Definir rotas customizadas para o botão de voltar
  const getCustomBackRoute = () => {
    // Rotas da aplicação unificada
    if (pathname.startsWith("/application/")) {
      if (pathname.startsWith("/application/users/") && params.id) {
        return "/application/users";
      }
      if (pathname.startsWith("/application/campus/") && params.id) {
        return "/application/campus";
      }
      if (pathname.startsWith("/application/organizations/") && params.id) {
        return "/application/organizations";
      }
      if (
        pathname.includes("/commissions/") &&
        pathname.includes("/inventories/") &&
        params.item_id
      ) {
        const commissionId = params.id;
        return `/application/commissions/${commissionId}/inventories`;
      }
      if (
        pathname.includes("/commissions/") &&
        pathname.includes("/members") &&
        params.id
      ) {
        return `/application/commissions/${params.id}`;
      }
      if (
        pathname.includes("/commissions/") &&
        pathname.includes("/upload") &&
        params.id
      ) {
        return `/application/commissions/${params.id}`;
      }
      if (
        pathname.includes("/commissions/") &&
        pathname.includes("/history") &&
        params.id
      ) {
        return `/application/commissions/${params.id}`;
      }
      if (
        pathname.includes("/commissions/") &&
        params.id &&
        !pathname.includes("/inventories") &&
        !pathname.includes("/members") &&
        !pathname.includes("/upload") &&
        !pathname.includes("/history")
      ) {
        return "/application/commissions";
      }
    }

    // Rotas legacy (admin/dashboard) - redirecionadas para /application
    if (pathname.startsWith("/admin/users/") && params.id) {
      return "/application/users";
    }
    if (pathname.startsWith("/admin/campus/") && params.id) {
      return "/application/campus";
    }
    if (pathname.startsWith("/admin/organizations/") && params.id) {
      return "/application/organizations";
    }
    if (
      pathname.includes("/commissions/") &&
      pathname.includes("/inventories/") &&
      params.id
    ) {
      // Volta para a lista de inventários da comissão
      const commissionId = params.commission_id;
      return `/application/commissions/${commissionId}/inventories`;
    }
    if (
      pathname.includes("/commissions/") &&
      pathname.includes("/members") &&
      params.commission_id
    ) {
      return `/application/commissions/${params.commission_id}`;
    }
    return undefined;
  };

  return (
    <div className="flex items-center gap-4">
      {!isMainPage && (
        <BackButton
          customHref={getCustomBackRoute()}
          useRouterBack={!getCustomBackRoute()}
        />
      )}
      <h1 className="text-xl font-bold text-[var(--font-color)]">{title}</h1>
    </div>
  );
};

export default HeaderTitle;
