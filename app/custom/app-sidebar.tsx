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
import { File, Home, Settings } from "lucide-react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar {...props}>
            <SidebarHeader className="bg-[var(--secondary-color)]">
                <div className="mt-4">
                    <img className="mx-auto h-auto" src="/Logotipo.svg" alt="logo" />
                </div>
            </SidebarHeader>
            <SidebarContent className="bg-[var(--secondary-color)] flex flex-col justify-between h-full">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="mt-4">
                            <li className="p-2 gap-2 flex items-center justify-center">
                                <Button className="bg-[var(--secondary-color)] text-[var(--font-color2)]" asChild>
                                    <a href="/dashboard/home" className="flex items-center gap-2 hover:!bg-[var(--hover-3-color)] hover:!text-white">
                                        <Home className="text-[var(--font-color2)]" />
                                        Dashboard
                                    </a>
                                </Button>
                            </li>
                            <li className="p-2 gap-2 flex items-center justify-center md:hidden">
                                <Button className="bg-[var(--secondary-color)] text-[var(--font-color2)]" asChild>
                                    <a href="/dashboard/committees" className="flex items-center gap-2 hover:!bg-[var(--hover-3-color)] hover:!text-white">
                                        <File className="text-[var(--font-color2)]" />
                                        Abrir Comissão
                                    </a>
                                </Button>
                            </li>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <div className="p-2 gap-2 flex items-center justify-center mt-auto mb-12">
                    <Button className="bg-[var(--secondary-color)] text-[var(--font-color2)]" asChild>
                        <a href="/dashoboard/settings" className="flex items-center gap-2 hover:!bg-[var(--hover-3-color)] hover:!text-white">
                            <Settings className="text-[var(--font-color2)]" />
                            Configurações
                        </a>
                    </Button>
                </div>
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    );
}