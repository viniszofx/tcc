import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function UserAvatar() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar className="w-10 h-10 cursor-pointer">
          <AvatarImage src="/logo.svg" alt="Foto do usuário" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <a href="/perfil">Perfil</a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="/configuracoes">Configurações</a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="/logout" className="text-red-500">Sair</a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}