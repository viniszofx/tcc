"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Building, History, LogOut, User, Users } from "lucide-react"

interface UserAvatarProps {
  nome: string
  email: string
  cargo: "admin" | "operador" | "presidente"
  foto?: string
}

export function UserAvatar({ nome, email, cargo, foto }: UserAvatarProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar className="w-10 h-10 cursor-pointer border">
          <AvatarImage src={foto || "/default-avatar.jpg"} alt="Foto do usuário" />
          <AvatarFallback>{nome.charAt(0)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 bg-[var(--perfil-color)]">
        <DropdownMenuLabel className="flex flex-col">
          <span className="font-bold text-[var(--font-color2)]">{nome}</span>
          <span className="text-sm text-[var(--font-color2)]">{email}</span>
          <span className="text-xs text-[var(--font-color2)]">{cargo.toUpperCase()}</span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-[var(--font-color2)]" />

        <a href="/dashboard/profile">
          <DropdownMenuItem className="flex items-center gap-2 text-[var(--font-color2)] hover:!bg-[var(--hover-color)] hover:!text-white transition-all cursor-pointer">
            <User size={16} className="text-[var(--font-color2)]" />
            <span>Perfil</span>
          </DropdownMenuItem>
        </a>

        {cargo === "admin" && (
          <>
            <DropdownMenuItem className="flex items-center gap-2 text-[var(--font-color2)] hover:!bg-[var(--hover-color)] hover:!text-white transition-all cursor-pointer">
              <Building size={16} className="text-[var(--font-color2)]" />
              <span>Gerenciar Campus</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 text-[var(--font-color2)] hover:!bg-[var(--hover-color)] hover:!text-white transition-all cursor-pointer">
              <Users size={16} className="text-[var(--font-color2)]" />
              <span>Gerenciar Usuários</span>
            </DropdownMenuItem>
          </>
        )}

        {cargo === "presidente" && (
          <DropdownMenuItem className="flex items-center gap-2 text-[var(--font-color2)] hover:!bg-[var(--hover-color)] hover:!text-white transition-all cursor-pointer">
            <Users size={16} className="text-[var(--font-color2)]" />
            <span>Gerenciar Comissão</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem className="flex items-center gap-2 text-[var(--font-color2)] hover:!bg-[var(--hover-color)] hover:!text-white transition-all cursor-pointer">
          <History size={16} className="text-[var(--font-color2)]" />
          <span>Histórico</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-[var(--font-color2)]" />

        <a href="/auth">
          <DropdownMenuItem className="flex items-center gap-2 text-[var(--button-2-color)] hover:!bg-[var(--hover-color)] hover:!text-white transition-all cursor-pointer">
            <LogOut size={16} className="text-[var(--button-2-color)]" />
            <span>Sair</span>
          </DropdownMenuItem>
        </a>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}