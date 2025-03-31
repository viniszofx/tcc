import { AppSidebar } from "@/components/custom/app-sidebar";
import React from "react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-1 items-center justify-center h-screen p-4 bg-[var(--card-color)]">
            <AppSidebar />
            <main className="w-full">
                {children}
            </main>
        </div>
    );
}
