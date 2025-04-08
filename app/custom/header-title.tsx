"use client";

import { usePathname } from "next/navigation";

const HeaderTitle = () => {
  const pathname = usePathname();

  const routes = [
    { prefix: "/dashboard/profile", title: "Perfil" },
    { prefix: "/dashboard/comission", title: "Comissão" },
    { prefix: "/dashboard/settings", title: "Configurações" },
    { prefix: "/dashboard/inventories", title: "Inventário" },
    { prefix: "/dashboard/about", title: "Sobre" },
    { prefix: "/dashboard", title: "Dashboard" },
  ];

  const matchedRoute = routes.find(route => pathname.startsWith(route.prefix));
  const title = matchedRoute?.title || "Dashboard";

  return (
    <h1 className="font-bold text-[var(--font-color)]">
      {title}
    </h1>
  );
};

export default HeaderTitle;
