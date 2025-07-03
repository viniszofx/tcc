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
                <Button
                  className="bg-[var(--secondary-color)] text-[var(--font-color2)]"
                  asChild
                >
                  <Link
                    href={`/application`}
                    className="flex items-center gap-2 hover:!bg-[var(--hover-3-color)] hover:!text-white"
                  >
                    <Home className="text-[var(--font-color2)]" />
                    Dashboard
                  </Link>
                </Button>
              </li>
              <hr className="my-2 border-[var(--border-color)]" />

              {/* Admin Menu */}
              {cargo === "admin" && (
                <>
                  <li className="p-2 gap-2 flex items-center">
                    <Button
                      className="bg-[var(--secondary-color)] text-[var(--font-color2)]"
                      asChild
                    >
                      <Link
                        href={`/application/users`}
                        className="flex items-center gap-2 hover:!bg-[var(--hover-3-color)] hover:!text-white"
                      >
                        <Users className="text-[var(--font-color2)]" />
                        Gerenciar Usuários
                      </Link>
                    </Button>
                  </li>
                  <li className="p-2 gap-2 flex items-center">
                    <Button
                      className="bg-[var(--secondary-color)] text-[var(--font-color2)]"
                      asChild
                    >
                      <Link
                        href={`/application/organizations`}
                        className="flex items-center gap-2 hover:!bg-[var(--hover-3-color)] hover:!text-white"
                      >
                        <Building2 className="text-[var(--font-color2)]" />
                        Gerenciar Organizações
                      </Link>
                    </Button>
                  </li>
                  <li className="p-2 gap-2 flex items-center">
                    <Button
                      className="bg-[var(--secondary-color)] text-[var(--font-color2)]"
                      asChild
                    >
                      <Link
                        href={`/application/campus`}
                        className="flex items-center gap-2 hover:!bg-[var(--hover-3-color)] hover:!text-white"
                      >
                        <Landmark className="text-[var(--font-color2)]" />
                        Gerenciar Campus
                      </Link>
                    </Button>
                  </li>
                  <hr className="my-2 border-[var(--border-color)]" />
                </>
              )}

              {/* Comissões Menu - Todos os usuários */}
              <li className="p-2 gap-2 flex items-center">
                <Button
                  className="bg-[var(--secondary-color)] text-[var(--font-color2)]"
                  asChild
                >
                  <Link
                    href={`/application/commissions`}
                    className="flex items-center gap-2 hover:!bg-[var(--hover-3-color)] hover:!text-white"
                  >
                    <Users className="text-[var(--font-color2)]" />
                    {cargo === "admin"
                      ? "Todas as Comissões"
                      : "Minhas Comissões"}
                  </Link>
                </Button>
              </li>

              <hr className="my-2 border-[var(--border-color)]" />

              {/* Menu de configurações */}
              <li className="p-2 gap-2 flex items-center">
                <Button
                  className="bg-[var(--secondary-color)] text-[var(--font-color2)]"
                  asChild
                >
                  <Link
                    href={`/application/settings`}
                    className="flex items-center gap-2 hover:!bg-[var(--hover-3-color)] hover:!text-white"
                  >
                    <Settings className="text-[var(--font-color2)]" />
                    Configurações
                  </Link>
                </Button>
              </li>
              <li className="p-2 gap-2 flex items-center">
                <Button
                  className="bg-[var(--secondary-color)] text-[var(--font-color2)]"
                  asChild
                >
                  <Link
                    href={`/application/about`}
                    className="flex items-center gap-2 hover:!bg-[var(--hover-3-color)] hover:!text-white"
                  >
                    <Info className="text-[var(--font-color2)]" />
                    Sobre o Sistema
                  </Link>
                </Button>
              </li>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
