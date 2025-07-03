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

  return (
    <div className="flex items-center gap-4">
      {!isMainPage && <BackButton useSmartNavigation={true} />}
      <h1 className="text-xl font-bold text-[var(--font-color)] hidden sm:block">
        {title}
      </h1>
    </div>
  );
};

export default HeaderTitle;
