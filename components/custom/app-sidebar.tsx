"use client";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Building2, Home, Info, Landmark, Settings, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { NavigationButton } from "@/components/ui/navigation-button";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  cargo?: "admin" | "operador" | "presidente";
}

export function AppSidebar({ cargo, ...props }: AppSidebarProps) {
  return (
    <Sidebar {...props}>
      <SidebarHeader className="bg-[var(--secondary-color)]">
        <div className="relative w-60 h-32 mx-auto">
          <Link href={`/application`}>
            <Image
              fill
              className="object-contain"
              src="/logotipo.svg"
              alt="logo"
            />
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-[var(--secondary-color)] flex flex-col justify-between h-full">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <li className="p-2 gap-2 flex items-center">
                <NavigationButton
                  href={`/application`}
                  className="bg-[var(--secondary-color)] text-[var(--font-color2)] flex items-center gap-2 hover:!bg-[var(--hover-3-color)] hover:!text-white"
                >
                  <Home className="text-[var(--font-color2)]" />
                  Dashboard
                </NavigationButton>
              </li>
              <hr className="my-2 border-[var(--border-color)]" />

              {/* Admin Menu */}
              {cargo === "admin" && (
                <>
                  <li className="p-2 gap-2 flex items-center">
                    <NavigationButton
                      href={`/application/users`}
                      className="bg-[var(--secondary-color)] text-[var(--font-color2)] flex items-center gap-2 hover:!bg-[var(--hover-3-color)] hover:!text-white"
                    >
                      <Users className="text-[var(--font-color2)]" />
                      Gerenciar Usuários
                    </NavigationButton>
                  </li>
                  <li className="p-2 gap-2 flex items-center">
                    <NavigationButton
                      href={`/application/organizations`}
                      className="bg-[var(--secondary-color)] text-[var(--font-color2)] flex items-center gap-2 hover:!bg-[var(--hover-3-color)] hover:!text-white"
                    >
                      <Building2 className="text-[var(--font-color2)]" />
                      Gerenciar Organizações
                    </NavigationButton>
                  </li>
                  <li className="p-2 gap-2 flex items-center">
                    <NavigationButton
                      href={`/application/campus`}
                      className="bg-[var(--secondary-color)] text-[var(--font-color2)] flex items-center gap-2 hover:!bg-[var(--hover-3-color)] hover:!text-white"
                    >
                      <Landmark className="text-[var(--font-color2)]" />
                      Gerenciar Campus
                    </NavigationButton>
                  </li>
                  <hr className="my-2 border-[var(--border-color)]" />
                </>
              )}

              {/* Comissões Menu - Todos os usuários */}
              <li className="p-2 gap-2 flex items-center">
                <NavigationButton
                  href={`/application/commissions`}
                  className="bg-[var(--secondary-color)] text-[var(--font-color2)] flex items-center gap-2 hover:!bg-[var(--hover-3-color)] hover:!text-white"
                >
                  <Users className="text-[var(--font-color2)]" />
                  {cargo === "admin"
                    ? "Todas as Comissões"
                    : "Minhas Comissões"}
                </NavigationButton>
              </li>

              <hr className="my-2 border-[var(--border-color)]" />

              {/* Menu de configurações */}
              <li className="p-2 gap-2 flex items-center">
                <NavigationButton
                  href={`/application/settings`}
                  className="bg-[var(--secondary-color)] text-[var(--font-color2)] flex items-center gap-2 hover:!bg-[var(--hover-3-color)] hover:!text-white"
                >
                  <Settings className="text-[var(--font-color2)]" />
                  Configurações
                </NavigationButton>
              </li>
              <li className="p-2 gap-2 flex items-center">
                <NavigationButton
                  href={`/application/about`}
                  className="bg-[var(--secondary-color)] text-[var(--font-color2)] flex items-center gap-2 hover:!bg-[var(--hover-3-color)] hover:!text-white"
                >
                  <Info className="text-[var(--font-color2)]" />
                  Sobre o Sistema
                </NavigationButton>
              </li>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
