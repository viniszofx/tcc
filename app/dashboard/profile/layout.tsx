"use client";

import { AppSidebar } from "@/app/custom/app-sidebar";
import DarkModeToggle from "@/app/custom/dark-mode-toggle";
import { UserAvatar } from "@/app/custom/user-avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import Link from "next/link";
import React from "react";

function ProfileLayout({ children }: { children: React.ReactNode }) {
    const usuario = {
      nome: "João Silva",
      email: "joao@email.com",
      cargo: "admin" as "admin",
      foto: "/logo.svg",
    };
  
    return (
      <div className="flex flex-1 items-center justify-center min-h-screen bg-[var(--card-color)]">
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="flex flex-col h-full">
            <header className="bg-[var(--header-color)] flex md:h-18 h-16 shrink-0 items-center md:gap-12 border-b px-4 md:justify-between sticky top-0 z-10">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 h-4 hidden md:block"
              />
  
              <div className="flex-1">
                <p className="md:text-lg md:ml-8 font-bold text-[var(--font-color)]">
                  Perfil
                </p>
              </div>
  
              <div className="flex items-center gap-4 md:mr-40">
                <Link href="/comission">
                  <Button className="bg-[var(--button-color)] hover:!bg-[var(--hover-2-color)] hover:!text-white transition-all cursor-pointer hidden md:flex">
                    Abrir Comissão
                  </Button>
                </Link>
                <DarkModeToggle />
                <UserAvatar {...usuario} />
              </div>
            </header>
            <main className="flex-1 bg-[var(--card-color)] overflow-auto py-4">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    );
  }
  
  export default ProfileLayout;