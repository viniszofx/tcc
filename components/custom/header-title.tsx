"use client"

import { usePathname } from "next/navigation"

const HeaderTitle = () => {
  const pathname = usePathname()

  const routes = [
    { prefix: "/dashboard/profile", title: "Perfil" },
    { prefix: "/dashboard/manager/committees", title: "Comissão" },
    { prefix: "/dashboard/settings", title: "Configurações" },
    { prefix: "/dashboard/inventories", title: "Inventário" },
    { prefix: "/dashboard/about", title: "Sobre" },
    { prefix: "/dashboard", title: "Dashboard" },
    { prefix: "/dashboard/manager/users", title: "Gerenciamento de Usuários" },
    { prefix: "/dashboard/manager/campuses", title: "Gerenciamento de Campus" },
    { prefix: "/dashboard/manager/organizations", title: "Gerenciamento de Organizações" },
  ]

  const sortedRoutes = [...routes].sort((a, b) => b.prefix.length - a.prefix.length)

  const matchedRoute = sortedRoutes.find((route) => pathname.startsWith(route.prefix))
  const title = matchedRoute?.title || "Dashboard"

  console.log("Current pathname:", pathname)
  console.log("Matched route:", matchedRoute)

  return <h1 className="text-xl font-bold text-[var(--font-color)]">{title}</h1>
}

export default HeaderTitle
