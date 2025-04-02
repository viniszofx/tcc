"use client"

import type React from "react"

import { useAuth } from "@/lib/hooks/use-auth"
import type { UserRole } from "@/types/auth"

interface RoleGateProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  requiresAuth?: boolean
}

export function RoleGate({ children, allowedRoles = [], requiresAuth = true }: RoleGateProps) {
  const { user, isAuthenticated } = useAuth()

  if (requiresAuth && !isAuthenticated) {
    return null
  }

  if (allowedRoles.length > 0 && (!user || !allowedRoles.includes(user.role))) {
    return null
  }

  return <>{children}</>
}

