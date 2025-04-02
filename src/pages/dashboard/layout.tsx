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
                    <header className="bg-[var(--bg-simple)] flex md:h-18 h-16 shrink-0 items-center md:gap-12 border-b px-4 md:justify-between sticky top-0 z-10">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4 hidden md:block" />
                        
                        <div className="flex-1">
                            <p className="md:text-lg md:ml-8 font-bold text-[var(--font-color)]">Processamento</p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <Button className="bg-[var(--secondary-color)] hidden md:flex" asChild>
                                <a href="/comission">Abrir Comissão</a>
                            </Button>
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
