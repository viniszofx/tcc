import { AppSidebar } from "@/components/custom/app-sidebar";
import React from "react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-1 bg-zinc-100 gap-4">
            <AppSidebar />
            <main className="w-full p-4">
                {children}
            </main>
        </div>
    );
}
