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
import { File, Home, Info, Settings } from "lucide-react";
import Image from "next/image";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar {...props}>
            <SidebarHeader className="bg-[var(--secondary-color)]">
                <div className="mt-4">
                    <Image className="mx-auto h-auto" src="/logotipo.svg" alt="logo" />
                </div>
            </SidebarHeader>
            <SidebarContent className="bg-[var(--secondary-color)] flex flex-col justify-between h-full">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="mt-4">
                            <li className="p-2 gap-2 flex items-center justify-center">
                                <Button className="bg-[var(--secondary-color)] text-[var(--font-color2)]" asChild>
                                    <a href="/dashboard" className="flex items-center gap-2 hover:!bg-[var(--hover-3-color)] hover:!text-white">
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
                <div className="flex flex-col gap-2 p-4 mt-auto mb-6">
                    <Button className="bg-[var(--secondary-color)] text-[var(--font-color2)] mb-4" asChild>
                        <a href="/dashboard/about" className="flex items-center gap-2 hover:!bg-[var(--hover-3-color)] hover:!text-white">
                            <Info className="text-[var(--font-color2)]" />
                            Sobre
                        </a>
                    </Button>
                    <Button className="bg-[var(--secondary-color)] text-[var(--font-color2)]" asChild>
                        <a href="/dashboard/settings" className="flex items-center gap-2 hover:!bg-[var(--hover-3-color)] hover:!text-white">
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