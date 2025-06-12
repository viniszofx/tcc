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
import db from "@/data/db.json";
import { Usuario } from "@/lib/interface";
import { LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";

export function UserAvatar() {
  const [user, setUser] = useState<Usuario | null>(null);

  useEffect(() => {
    const currentUser = db.users.find(u => u.papel === "admin") || null;
    setUser(currentUser);
  }, []);

  if (!user) {
    return (
      <Avatar className="w-10 h-10 border">
        <AvatarFallback>?</AvatarFallback>
      </Avatar>
    );
  }

  const cargo = user.papel as "admin" | "operador" | "presidente";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar className="w-10 h-10 cursor-pointer border">
          <AvatarImage
            src={user.perfil?.imagem_url || "/logo.svg"}
            alt="Foto do usuário"
          />
          <AvatarFallback>{user.nome.charAt(0)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 bg-[var(--perfil-color)]"
      >
        <DropdownMenuLabel className="flex flex-col">
          <span className="font-bold text-[var(--font-color2)]">{user.nome}</span>
          <span className="text-sm text-[var(--font-color2)]">{user.email}</span>
          <span className="text-xs text-[var(--font-color2)]">
            {user.papel ? user.papel.toUpperCase() : ""}
          </span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-[var(--font-color2)]" />

        {(cargo === "admin" || cargo === "presidente") && (
          <a href={`/admin/profile`}>
            <DropdownMenuItem className="flex items-center gap-2 text-[var(--font-color2)] hover:!bg-[var(--hover-color)] hover:!text-white transition-all cursor-pointer">
              <User size={16} className="text-[var(--font-color2)]" />
              <span>Perfil</span>
            </DropdownMenuItem>
          </a>
        )}

        {cargo === "operador" && (
          <a href={`/dashboard/profile`}>
            <DropdownMenuItem className="flex items-center gap-2 text-[var(--font-color2)] hover:!bg-[var(--hover-color)] hover:!text-white transition-all cursor-pointer">
              <User size={16} className="text-[var(--font-color2)]" />
              <span>Perfil</span>
            </DropdownMenuItem>
          </a>
        )}

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