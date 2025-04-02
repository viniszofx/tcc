"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileSpreadsheet, BarChart2, History, Users, Settings, HelpCircle, Building2, FileText } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { RoleGate } from "@/components/auth/role-gate"

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="mr-4 flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
          <span className="text-xs font-bold text-primary-foreground">S</span>
        </div>
        <span className="hidden font-bold sm:inline-block">Saturn</span>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="-ml-4 text-base hover:bg-transparent focus:ring-0">
            Menu
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start" forceMount>
          <DropdownMenuLabel>Navegação</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className={cn("flex items-center", pathname === "/dashboard" && "bg-accent")}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                <span>Dados</span>
              </Link>
            </DropdownMenuItem>

            <RoleGate allowedRoles={["system_admin", "org_admin", "manager"]}>
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/analytics"
                  className={cn("flex items-center", pathname === "/dashboard/analytics" && "bg-accent")}
                >
                  <BarChart2 className="mr-2 h-4 w-4" />
                  <span>Análises</span>
                </Link>
              </DropdownMenuItem>
            </RoleGate>

            <DropdownMenuItem asChild>
              <Link
                href="/dashboard/history"
                className={cn("flex items-center", pathname === "/dashboard/history" && "bg-accent")}
              >
                <History className="mr-2 h-4 w-4" />
                <span>Histórico</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <RoleGate allowedRoles={["system_admin", "org_admin"]}>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Administração</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/users"
                  className={cn("flex items-center", pathname === "/dashboard/users" && "bg-accent")}
                >
                  <Users className="mr-2 h-4 w-4" />
                  <span>Usuários</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/organizations"
                  className={cn("flex items-center", pathname === "/dashboard/organizations" && "bg-accent")}
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  <span>Organizações</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </RoleGate>

          <RoleGate allowedRoles={["system_admin", "org_admin", "manager"]}>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Gerenciamento</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/teams"
                  className={cn("flex items-center", pathname === "/dashboard/teams" && "bg-accent")}
                >
                  <Users className="mr-2 h-4 w-4" />
                  <span>Equipes</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/reports"
                  className={cn("flex items-center", pathname === "/dashboard/reports" && "bg-accent")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Relatórios</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </RoleGate>

          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard/settings"
                className={cn("flex items-center", pathname === "/dashboard/settings" && "bg-accent")}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard/help"
                className={cn("flex items-center", pathname === "/dashboard/help" && "bg-accent")}
              >
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Ajuda</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

