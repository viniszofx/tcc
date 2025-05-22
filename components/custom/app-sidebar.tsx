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
import {
  Building2,
  Clock,
  Home,
  Info,
  Landmark,
  Settings,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  cargo?: "admin" | "operador" | "presidente";
}

export function AppSidebar({ cargo, ...props }: AppSidebarProps) {
  const params = useParams();
  const campusId = params?.campus_id || "corumba";
  const commissionId = params?.commission_id || "comissao";

  return (
    <Sidebar {...props}>
      <SidebarHeader className="bg-[var(--secondary-color)]">
        <div className="relative w-60 h-32 mx-auto">
          <Link href={`/admin`}>
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
                    href={`/admin`}
                    className="flex items-center gap-2 hover:!bg-[var(--hover-3-color)] hover:!text-white"
                  >
                    <Home className="text-[var(--font-color2)]" />
                    Dashboard
                  </Link>
                </Button>
              </li>
              <hr className="my-2 border-[var(--border-color)]" />
              {cargo === "admin" && (
                <>
                  <li className="p-2 gap-2 flex items-center">
                    <Button
                      className="bg-[var(--secondary-color)] text-[var(--font-color2)]"
                      asChild
                    >
                      <Link
                        href={`/admin/users`}
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
                        href={`/admin/campus`}
                        className="flex items-center gap-2 hover:!bg-[var(--hover-3-color)] hover:!text-white"
                      >
                        <Building2 className="text-[var(--font-color2)]" />
                        Gerenciar Campus
                      </Link>
                    </Button>
                  </li>
                  <li className="p-2 gap-2 flex items-center">
                    <Button
                      className="bg-[var(--secondary-color)] text-[var(--font-color2)]"
                      asChild
                    >
                      <Link
                        href={`/dashboard/campus/${campusId}/manager/organizations`}
                        className="flex items-center gap-2 hover:!bg-[var(--hover-3-color)] hover:!text-white"
                      >
                        <Landmark className="text-[var(--font-color2)]" />
                        Gerenciar Organizações
                      </Link>
                    </Button>
                  </li>
                </>
              )}
              {cargo === "presidente" && (
                <>
                  <li className="p-2 gap-2 flex items-center">
                    <Button
                      className="bg-[var(--secondary-color)] text-[var(--font-color2)]"
                      asChild
                    >
                      <Link
                        href={`/dashboard/campus/${campusId}/manager/committees`}
                        className="flex items-center gap-2 hover:!bg-[var(--hover-3-color)] hover:!text-white"
                      >
                        <Landmark className="text-[var(--font-color2)]" />
                        Gerenciar Comissões
                      </Link>
                    </Button>
                  </li>
                </>
              )}
              <li className="p-2 gap-2 flex items-center">
                <Button
                  className="bg-[var(--secondary-color)] text-[var(--font-color2)]"
                  asChild
                >
                  <Link
                    href={`/dashboard/campus/${campusId}/commissions/${commissionId}/history`}
                    className="flex items-center gap-2 hover:!bg-[var(--hover-3-color)] hover:!text-white"
                  >
                    <Clock className="text-[var(--font-color2)]" />
                    Histórico
                  </Link>
                </Button>
              </li>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="flex flex-col items-start gap-2 p-4 mt-auto mb-6 [var(--border-color)]">
          <hr className="my-2 border-[var(--border-color)] w-full" />
          <Button
            className="bg-[var(--secondary-color)] text-[var(--font-color2)] mb-2"
            asChild
          >
            <Link
              href={`/dashboard/campus/${campusId}/commissions/${commissionId}/about`}
              className="flex gap-2 hover:!bg-[var(--hover-3-color)] hover:!text-white"
            >
              <Info className="text-[var(--font-color2)]" />
              Sobre
            </Link>
          </Button>
          <Button
            className="bg-[var(--secondary-color)] text-[var(--font-color2)]"
            asChild
          >
            <Link
              href={`/dashboard/campus/${campusId}/commissions/${commissionId}/settings`}
              className="flex gap-2 hover:!bg-[var(--hover-3-color)] hover:!text-white"
            >
              <Settings className="text-[var(--font-color2)]" />
              Configurações
            </Link>
          </Button>
        </div>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
