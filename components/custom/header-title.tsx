"use client"

import { routes } from "@/components/custom/routes-title"
import { useParams, usePathname } from "next/navigation"

const HeaderTitle = () => {
  const pathname = usePathname()
  const params = useParams()

  const convertToRegex = (prefix: string) => {
    const regexString = "^" + prefix.replace(/\[.*?\]/g, "[^/]+") + "$"
    return new RegExp(regexString)
  }

  const matchedRoute = routes.find((route) => convertToRegex(route.prefix).test(pathname))
  
  let title = matchedRoute?.title || "Dashboard"
  if (params.commission_id && title.includes("[commission_id]")) {
    title = title.replace("[commission_id]", params.commission_id as string)
  }

  return (
    <h1 className="text-xl font-bold text-[var(--font-color)]">{title}</h1>
  )
}

export default HeaderTitle