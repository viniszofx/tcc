"use client";

import { usePathname } from "next/navigation";

const HeaderTitle = () => {
  const pathname = usePathname();

  const pageTitles: { [key: string]: string } = {
    "/dashboard/profile": "Perfil",
    "/dashboard/comission": "Comissão",
    "/dashboard/settings": "Configurações",
    "/dashboard": "Dashboard",
  };

  const title = pageTitles[pathname] || "Dashboard";

  return (
    <h1 className="text-lg font-bold text-[var(--font-color)]">
      {title}
    </h1>
  );
};

export default HeaderTitle;