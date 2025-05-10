import { AppSidebar } from "@/components/custom/app-sidebar";
import DarkModeToggle from "@/components/custom/dark-mode-toggle";
import { UserAvatar } from "@/components/custom/user-avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { users } from "@/data/db.json";
import HeaderTitle from "../../components/custom/header-title";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const usuarioData = users.find((u) => u.role === "admin");

  if (!usuarioData) {
    return <div>Usuário não encontrado</div>;
  }


  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--card-color)]">
      <SidebarProvider>
        <AppSidebar />
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
                  <Button
                    className="hidden bg-[var(--button-color)] text-[var(--font-color2)] transition-all hover:bg-[var(--hover-2-color)] hover:text-white md:flex"
                    asChild
                  >
                    <a href="/comission">Abrir Comissão</a>
                  </Button>
                  <DarkModeToggle />
                  <UserAvatar
                    nome={usuarioData.name}
                    email={usuarioData.email}
                    foto={usuarioData.profile.image} cargo={"admin"}
                  />
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
  );
};

export default Layout;
