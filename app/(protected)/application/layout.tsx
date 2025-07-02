"use client";

import { AppSidebar } from "@/components/custom/app-sidebar";
import DarkModeToggle from "@/components/custom/dark-mode-toggle";
import HeaderTitle from "@/components/custom/header-title";
import LoadingScreen from "@/components/custom/loading";
import { UserAvatar } from "@/components/custom/user-avatar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useUserPermissions } from "@/hooks/use-user-permissions";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ApplicationLayoutProps {
  children: React.ReactNode;
}

function ApplicationContent({ children }: ApplicationLayoutProps) {
  const { user, loading, error } = useUserPermissions();
  const router = useRouter();

  useEffect(() => {
    if (!loading && error) {
      // Se houver erro de autenticação, redirecionar para login
      router.push("/login");
    }
  }, [loading, error, router]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error || !user) {
    return <LoadingScreen />;
  }

  // Determinar o cargo para o sidebar baseado no role do usuário
  const cargo =
    user.role === "admin"
      ? "admin"
      : user.role === "presidente"
      ? "presidente"
      : "operador";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--card-color)]">
      <SidebarProvider>
        <AppSidebar cargo={cargo} />
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
                  <UserAvatar />
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
            <div className="w-full max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto">
              {children}
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export default function ApplicationLayout({
  children,
}: ApplicationLayoutProps) {
  return <ApplicationContent>{children}</ApplicationContent>;
}
