"use client"

import { AddUserModal } from "@/components/manager-users/add-user-modal"
import { EditUserModal } from "@/components/manager-users/edit-user-modal"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { user } from "@/utils/user"
import { Eye, Pencil, Plus } from 'lucide-react'
import Link from "next/link"
import { useState } from "react"

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [users, setUsers] = useState(user)

  const filteredUsers = users.filter(
    (usuario) =>
      usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.papel.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddUser = (newUser: any) => {
    const newUserId = (Math.max(...users.map((u) => Number.parseInt(u.usuario_id))) + 1).toString()

    const userToAdd = {
      ...newUser,
      usuario_id: newUserId,
      foto: newUser.foto || "/default-avatar.jpg",
    }

    setUsers([...users, userToAdd])
  }

  const handleEditUser = (updatedUser: any) => {
    const updatedUsers = users.map((user) => (user.usuario_id === updatedUser.usuario_id ? updatedUser : user))
    setUsers(updatedUsers)
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-blue-500 hover:bg-blue-600"
      case "presidente":
        return "bg-green-500 hover:bg-green-600"
      case "operador":
        return "bg-amber-500 hover:bg-amber-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  return (
    <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-lg transition-all duration-300 lg:max-w-5xl xl:max-w-6xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold text-[var(--font-color)] md:text-2xl lg:text-3xl">
        </CardTitle>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white transition-all"
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Usuário
        </Button>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <div className="relative">
          <Input
            placeholder="Buscar usuários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-[var(--border-input)] pl-10"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--font-color)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <div className="rounded-md border border-[var(--border-color)]">
          <div className="grid grid-cols-12 gap-2 bg-[var(--header-color)] p-4 font-medium text-[var(--font-color)]">
            <div className="col-span-1">Foto</div>
            <div className="col-span-3">Nome</div>
            <div className="col-span-4">Email</div>
            <div className="col-span-2">Papel</div>
            <div className="col-span-2 text-right">Ações</div>
          </div>

          <div className="divide-y divide-[var(--border-color)]">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((usuario) => (
                <div
                  key={usuario.usuario_id}
                  className="grid grid-cols-12 items-center gap-2 p-4 text-[var(--font-color)]"
                >
                  <div className="col-span-1">
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={usuario.foto || "/placeholder.svg?height=40&width=40"} alt={usuario.nome} />
                      <AvatarFallback>{usuario.nome.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="col-span-3 truncate">{usuario.nome}</div>
                  <div className="col-span-4 truncate">{usuario.email}</div>
                  <div className="col-span-2">
                    <Badge className={`${getRoleBadgeColor(usuario.papel)} text-white`}>
                      {usuario.papel.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="col-span-2 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-[var(--border-color)] bg-[var(--bg-simple)] hover:bg-[var(--hover-color)] hover:text-white"
                      onClick={() => {
                        setSelectedUser(usuario)
                        setIsEditModalOpen(true)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Link href={`/dashboard/manager/users/${usuario.usuario_id}`}>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-[var(--border-color)] bg-[var(--bg-simple)] hover:bg-[var(--hover-color)] hover:text-white"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-[var(--font-color)]">Nenhum usuário encontrado.</div>
            )}
          </div>
        </div>
      </CardContent>

      <AddUserModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAddUser={handleAddUser} />

      {selectedUser && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={selectedUser}
          onEditUser={handleEditUser}
        />
      )}
    </Card>
  )
}