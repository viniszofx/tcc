"use client";

import { signOut } from "@/app/(auth)/auth/_action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Building, History, LogOut, User, Users } from "lucide-react";
import { useParams } from "next/navigation";

interface UserAvatarProps {
  nome: string;
  email: string;
  cargo: "admin" | "operador" | "presidente";
  foto?: string;
}

export function UserAvatar({ nome, email, cargo, foto }: UserAvatarProps) {
  const params = useParams();
  const campusId = params?.campus_id || 'corumba';
  const commissionId = params?.commission_id || 'comissao';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar className="w-10 h-10 cursor-pointer border">
          <AvatarImage
            src={foto || "/logo.svg"}
            alt="Foto do usuário"
          />
          <AvatarFallback>{nome.charAt(0)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 bg-[var(--perfil-color)]"
      >
        <DropdownMenuLabel className="flex flex-col">
          <span className="font-bold text-[var(--font-color2)]">{nome}</span>
          <span className="text-sm text-[var(--font-color2)]">{email}</span>
          <span className="text-xs text-[var(--font-color2)]">
            {cargo.toUpperCase()}
          </span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-[var(--font-color2)]" />

        <a href={`/dashboard/campus/${campusId}/commissions/${commissionId}/profile`}>
          <DropdownMenuItem className="flex items-center gap-2 text-[var(--font-color2)] hover:!bg-[var(--hover-color)] hover:!text-white transition-all cursor-pointer">
            <User size={16} className="text-[var(--font-color2)]" />
            <span>Perfil</span>
          </DropdownMenuItem>
        </a>

        <DropdownMenuItem className="flex items-center gap-2 text-[var(--font-color2)] hover:!bg-[var(--hover-color)] hover:!text-white transition-all cursor-pointer">
          <History size={16} className="text-[var(--font-color2)]" />
          <span>Histórico</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-[var(--font-color2)]" />

        <form>
          <DropdownMenuItem asChild>
            <button
              formAction={signOut}
              className="w-full flex items-center gap-2 text-[var(--button-2-color)] hover:!bg-[var(--hover-color)] hover:!text-white transition-all cursor-pointer"
            >
              <LogOut size={16} className="text-[var(--button-2-color)]" />
              <span>Sair</span>
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
