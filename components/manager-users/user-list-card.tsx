"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Campus, UserProfile } from "@/lib/new-interface"
import { Eye, Pencil } from "lucide-react"
import Link from "next/link"

interface UserListCardProps {
  users: UserProfile[]
  onEditUser: (user: UserProfile) => void
  getCampusName: (campusId: Campus) => string
}

export function UserListCard({ users, onEditUser, getCampusName }: UserListCardProps) {
  const getRoleBadgeColor = (active: string) => {
    switch (active) {
      case "ativo": return "bg-green-500 hover:bg-green-600"
      case "inativo": return "bg-red-500 hover:bg-red-600"
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
            <div className="col-span-2 hidden md:block">Status</div>
            <div className="col-span-4 md:col-span-2 text-right">Ações</div>
          </div>

          <div className="divide-y divide-[var(--border-color)]">
            {users.length > 0 ? (
              users.map(usuario => (
                <div key={usuario.id} className="grid grid-cols-12 items-center gap-2 p-4 text-[var(--font-color)]">
                  <div className="col-span-1 hidden md:block">
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={usuario.profile?.image|| "/placeholder.svg"} alt={usuario.name} />
                      <AvatarFallback>{usuario.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="col-span-4 md:col-span-2 truncate">
                    <div className="flex items-center gap-2 md:hidden">
                      <Avatar className="h-8 w-8 border">
                        <AvatarImage src={usuario.profile?.image || "/placeholder.svg"} alt={usuario.name} />
                        <AvatarFallback>{usuario.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{usuario.name}</span>
                    </div>
                    <span className="hidden md:inline">{usuario.name}</span>
                  </div>
                  <div className="col-span-4 md:col-span-3 truncate">{usuario.email}</div>
                  <div className="col-span-2 hidden md:block truncate">
                    {getCampusName(usuario || "")}
                  </div>
                  <div className="col-span-4 md:col-span-2 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-[var(--border-color)] hover:bg-[var(--hover-3-color)]"
                      onClick={() => onEditUser(usuario)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Link href={`/admin/users/${usuario.id}`} className="w-full">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-[var(--border-color)] hover:bg-[var(--hover-3-color)]"
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