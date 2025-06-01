"use client"

import { AddUserModal } from "@/components/manager-users/add-user-modal"
import { EditUserModal } from "@/components/manager-users/edit-user-modal"
import { UserListCard } from "@/components/manager-users/user-list-card"
import { UserSearchCard } from "@/components/manager-users/user-search-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { useEffect, useState } from "react"

function getCampusNameById(campusId: string, campuses: any[]) {
  const campus = campuses.find((c) => c.id === campusId)
  return campus ? campus.name : "Sem campus"
}

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [campuses, setCampuses] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/v1/users")
      .then((res) => res.json())
      .then(setUsers)
    fetch("/api/v1/campuses")
      .then((res) => res.json())
      .then(setCampuses)
  }, [])

  const filteredUsers = users.filter(
    (usuario) =>
      (usuario.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (usuario.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (usuario.role?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (usuario.campus_id && getCampusNameById(usuario.campus_id, campuses).toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleAddUser = (newUser: Partial<any>) => {
    const newUserId = `dev-user-${Date.now()}`
    const userToAdd = {
      ...(newUser as any),
      id: newUserId,
      name: newUser.name || "",
      email: newUser.email || "",
      role: newUser.role || "operador",
      campus_id: newUser.campus_id || "",
      active: true,
      profile: {
        description: newUser.profile?.description || "",
        image: newUser.profile?.image || "/logo.svg",
      },
    }
    setUsers([...users, userToAdd])
  }

  const handleEditUser = (updatedUser: any) => {
    const updatedUsers = users.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    setUsers(updatedUsers)
  }

  const handleEditClick = (user: any) => {
    setSelectedUser(user)
    setIsEditModalOpen(true)
  }

  if (users.length === 0 || campuses.length === 0) return <div>Carregando...</div>

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
        campusList={campuses}
      />

      {selectedUser && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={selectedUser}
          onEditUser={handleEditUser}
          campusList={campuses}
        />
      )}
    </Card>
  )
}