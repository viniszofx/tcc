"use client"

import ProfileAvatar from "./profile-avatar"
import RoleProfile from "./profile-role"

interface ProfileSidebarProps {
  nome: string
  email: string
  campus: string
  descricao: string
  cargo: "admin" | "operador" | "presidente"
  foto: string
}

export default function ProfileSidebar({ nome, email, campus, descricao, cargo, foto }: ProfileSidebarProps) {
  return (
    <div className="w-full md:w-1/3 flex flex-col space-y-6">
      <div className="flex flex-col items-center space-y-4 bg-[var(--bg-simple)] rounded-lg p-4 border border-[var(--border-color)] shadow-sm">
        <RoleProfile cargo={cargo} />
        <ProfileAvatar foto={foto} />
        <h3 className="font-medium text-[var(--font-color)] text-center break-words w-full max-w-full truncate px-2">
          {nome}
        </h3>
        <p className="text-sm text-[var(--font-color)]/70 text-center break-words w-full max-w-full truncate px-2">
          {email}
        </p>
      </div>

      <div className="bg-[var(--bg-simple)] rounded-lg p-4 border border-[var(--border-color)] shadow-sm">
        <h3 className="text-sm font-medium text-[var(--font-color)] mb-3">Sobre mim</h3>
        <div
          className="p-3 bg-[var(--bg-simple)] rounded-md border border-[var(--border-input)] min-h-24 max-h-48 text-sm text-[var(--font-color)] overflow-auto"
          style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}
        >
          {descricao || "Nenhuma descrição informada"}
        </div>
      </div>

      <div className="bg-[var(--bg-simple)] rounded-lg p-4 border border-[var(--border-color)] shadow-sm">
        <h3 className="text-sm font-medium text-[var(--font-color)] mb-3">Campus</h3>
        <p className="text-sm text-[var(--font-color)] break-words truncate">{campus}</p>
      </div>
    </div>
  )
}