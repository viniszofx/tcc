"use client";

import { AppSidebar } from "@/components/custom/app-sidebar";
import DarkModeToggle from "@/components/custom/dark-mode-toggle";
import { UserAvatar } from "@/components/custom/user-avatar";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import type { UserProfile } from "@/interface";
import { useEffect, useState } from "react";
import HeaderTitle from "../../../components/custom/header-title";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [usuarioData, setUsuarioData] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Para desenvolvimento, usar um usuário padrão ou buscar da sessão/auth
        // Por enquanto vou usar a API de usuários
        const usersResponse = await fetch("/api/user");
        const usersData = await usersResponse.json();

        if (usersResponse.ok && usersData.length > 0) {
          // Usar o primeiro usuário por enquanto
          // Em produção, isso deveria vir da sessão/autenticação
          setUsuarioData(usersData[0]);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <ThemeProvider>
      <div className="flex h-screen w-full overflow-hidden bg-[var(--card-color)]">
        <SidebarProvider>
          <AppSidebar cargo="operador" />{" "}
          {/* mudar aqui para o cargo do usuario no sidebar */}
          <SidebarInset className="flex flex-col">
            <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-[var(--header-color)]">
              <div className="w-full px-4 md:px-6 lg:px-8 flex items-center">
                <SidebarTrigger className="text-[var(--font-color)] -ml-2" />
                <Separator
                  orientation="vertical"
                  className="h-6 hidden md:block mx-2"
                />

                <div className="flex w-full max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto items-center justify-between">
                  <HeaderTitle />

                  <div className="flex items-center gap-4">
                    <DarkModeToggle />
                    {usuarioData && <UserAvatar />}
                  </div>
                </div>
              </div>
            </header>

            <main className="flex-1 overflow-auto bg-[var(--card-color)] p-0">
              <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
                {children}
              </div>
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </ThemeProvider>
  );
}
