"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Usuario } from "@/lib/interface"
import { Eye, Pencil } from "lucide-react"
import Link from "next/link"

interface UserListCardProps {
  users: Usuario[]
  onEditUser: (user: Usuario) => void
  getCampusName: (campusId: string) => string
}

export function UserListCard({ users, onEditUser, getCampusName }: UserListCardProps) {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-blue-500 hover:bg-blue-600"
      case "presidente": return "bg-green-500 hover:bg-green-600"
      case "operador": return "bg-amber-500 hover:bg-amber-600"
      default: return "bg-gray-500 hover:bg-gray-600"
    }
  }

  return (
    <Card className="border-[var(--border-color)] bg-[var(--bg-simple)]">
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-lg font-medium text-[var(--font-color)]">
          Lista de Usuários
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="rounded-md border border-[var(--border-color)]">
          <div className="grid grid-cols-12 gap-2 bg-[var(--header-color)] p-4 font-medium text-[var(--font-color)]">
            <div className="col-span-1 hidden md:block">Foto</div>
            <div className="col-span-4 md:col-span-2">Nome</div>
            <div className="col-span-4 md:col-span-3">Email</div>
            <div className="col-span-2 hidden md:block">Campus</div>
            <div className="col-span-2 hidden md:block">Papel</div>
            <div className="col-span-4 md:col-span-2 text-right">Ações</div>
          </div>

          <div className="divide-y divide-[var(--border-color)]">
            {users.length > 0 ? (
              users.map(usuario => (
                <div key={usuario.usuario_id} className="grid grid-cols-12 items-center gap-2 p-4 text-[var(--font-color)]">
                  <div className="col-span-1 hidden md:block">
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={usuario.perfil?.imagem_url || "/placeholder.svg"} alt={usuario.nome} />
                      <AvatarFallback>{usuario.nome.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="col-span-4 md:col-span-2 truncate">
                    <div className="flex items-center gap-2 md:hidden">
                      <Avatar className="h-8 w-8 border">
                        <AvatarImage src={usuario.perfil?.imagem_url || "/placeholder.svg"} alt={usuario.nome} />
                        <AvatarFallback>{usuario.nome.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{usuario.nome}</span>
                    </div>
                    <span className="hidden md:inline">{usuario.nome}</span>
                  </div>
                  <div className="col-span-4 md:col-span-3 truncate">{usuario.email}</div>
                  <div className="col-span-2 hidden md:block truncate">
                    {getCampusName(usuario.campus_id || "")}
                  </div>
                  <div className="col-span-2 hidden md:block">
                    <Badge className={`${getRoleBadgeColor(usuario.papel)} text-white`}>
                      {usuario.papel.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="col-span-4 md:col-span-2 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-[var(--border-color)] hover:bg-[var(--hover-color)]"
                      onClick={() => onEditUser(usuario)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Link href={`/admin/users/${usuario.usuario_id}`}>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-[var(--border-color)] hover:bg-[var(--hover-color)]"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-[var(--font-color)]">
                Nenhum usuário encontrado
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}