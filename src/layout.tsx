import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/custom/app-sidebar";
import { Button } from "./components/ui/button";
import { Bell, Search } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <div className="w-full flex justify-between items-center">
          <SidebarTrigger />
          <h2 className="text-lg font-medium">Sistema Cadê</h2>
          <div>
            <Button variant={"secondary"}>
              <Bell></Bell>
            </Button>
            <Button>
              <Search></Search>
            </Button>
          </div>
        </div>
        {children}
      </main>
    </SidebarProvider>
  );
}
