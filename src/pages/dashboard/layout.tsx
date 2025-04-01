import { AppSidebar } from "@/components/custom/app-sidebar";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";
import React from "react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-1 items-center justify-center h-screen bg-[var(--card-color)]">
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center md:gap-12 border-b px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <div>
                            <p className="md:text-lg font-bold text-[var(--font-color)]">Processamento</p>
                        </div>
                        <div>
                            <Button className="bg-[var(--secondary-color)]" asChild>
                                <a href="/dashboard">Abrir Comissão</a>
                            </Button>
                        </div>
                    </header>
                    <main className="flex flex-col w-full bg-[var(--card-color)] flex-1">
                        {children}
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </div>
    );
}
