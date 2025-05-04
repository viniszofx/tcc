"use client"

import { usePathname } from "next/navigation"

const HeaderTitle = () => {
  const pathname = usePathname()

  const routes = [
    { prefix: "/dashboard/campus/[comission_id]/commissions", title: "Comissões" },
    { prefix: "/dashboard/campus", title: "Câmpus" },
  ]

  const convertToRegex = (prefix: string) => {
    const regexString = "^" + prefix.replace(/\[.*?\]/g, "[^/]+")
    return new RegExp(regexString)
  }

  const matchedRoute = routes.find((route) => convertToRegex(route.prefix).test(pathname))
  const title = matchedRoute?.title || "Dashboard"

  console.log("Current pathname:", pathname)
  console.log("Matched route:", matchedRoute)

  return <h1 className="text-xl font-bold text-[var(--font-color)]">{title}</h1>
}

export default HeaderTitle