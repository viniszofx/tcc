"use client"

import { routes } from "@/components/custom/routes-title"
import { usePathname } from "next/navigation"

const HeaderTitle = () => {
  const pathname = usePathname()

  const convertToRegex = (prefix: string) => {
    const regexString = "^" + prefix.replace(/\[.*?\]/g, "[^/]+")
    return new RegExp(regexString)
  }

  const matchedRoute = routes.find((route) => convertToRegex(route.prefix).test(pathname))
  const title = matchedRoute?.title || "Dashboard"

  return (
    <>
      <h1 className="text-xl font-bold text-[var(--font-color)]">{title}</h1>
    </>
  )
}

export default HeaderTitle