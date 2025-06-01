"use client"

import { AddUserModal } from "@/components/manager-users/add-user-modal"
import { EditUserModal } from "@/components/manager-users/edit-user-modal"
import { UserListCard } from "@/components/manager-users/user-list-card"
import { UserSearchCard } from "@/components/manager-users/user-search-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Usuario } from "@/lib/interface"
import { campusList, getCampusNameById, user } from "@/utils/user"
import { Plus } from "lucide-react"
import { useState } from "react"

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null)
  const [users, setUsers] = useState<Usuario[]>(user)

  const filteredUsers = users.filter(
    (usuario) =>
      usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.papel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (usuario.campus_id && getCampusNameById(usuario.campus_id).toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleAddUser = (newUser: Partial<Usuario>) => {
    const newUserId = `dev-user-${Date.now()}`

    const userToAdd: Usuario = {
      ...(newUser as Usuario),
      usuario_id: newUserId,
      imagem_url: newUser.imagem_url || "/logo.svg",
      habilitado: true,
      organizacao_id: "org-001",
    }

    setUsers([...users, userToAdd])
  }

  const handleEditUser = (updatedUser: Usuario) => {
    const updatedUsers = users.map((user) => (user.usuario_id === updatedUser.usuario_id ? updatedUser : user))
    setUsers(updatedUsers)
  }

  const handleEditClick = (user: Usuario) => {
    setSelectedUser(user)
    setIsEditModalOpen(true)
  }

  return (
    <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-lg transition-all duration-300 lg:max-w-5xl xl:max-w-6xl">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <CardTitle className="text-xl font-bold text-[var(--font-color)] md:text-2xl lg:text-3xl">
            Gerenciamento de Usuários
          </CardTitle>
          <CardDescription className="text-[var(--font-color)] opacity-70">
            Gerencie os usuários do sistema
          </CardDescription>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white transition-all w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Usuário
        </Button>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <UserSearchCard searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        <UserListCard users={filteredUsers} onEditUser={handleEditClick} />
      </CardContent>

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddUser={handleAddUser}
        campusList={campusList}
      />

      {selectedUser && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={selectedUser}
          onEditUser={handleEditUser}
          campusList={campusList}
        />
      )}
    </Card>
  )
}