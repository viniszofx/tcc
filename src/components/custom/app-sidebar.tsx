import * as React from "react"
import { Home, Settings } from "lucide-react"
import { Button } from "../ui/button"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarRail,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader className="bg-[var(--secondary-color)]">
        <div>
          <img className="mx-auto h-auto" src="/Logotipo.svg" alt="logo" />
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-[var(--secondary-color)] flex flex-col justify-between h-full">
        <SidebarGroup>
          <SidebarGroupLabel></SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <li className="p-2 gap-2 text-[var(--font-color2)] flex items-center justify-center">
                <Home />
                <Button className="bg-[var(--secondary-color)]" asChild>
                  <a href="/dashboard">Dashboard</a>
                </Button>
              </li>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="p-2 gap-2 text-[var(--font-color2)] flex items-center justify-center mb-12">
          <Settings />
          <Button className="bg-[var(--secondary-color)]" asChild>
            <a href="/settings">Configurações</a>
          </Button>
        </div>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
