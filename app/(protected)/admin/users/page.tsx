"use client"

import { AddUserModal } from "@/components/manager-users/add-user-modal"
import { EditUserModal } from "@/components/manager-users/edit-user-modal"
import { UserListCard } from "@/components/manager-users/user-list-card"
import { UserSearchCard } from "@/components/manager-users/user-search-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Campus, Usuario } from "@/lib/interface"
import { ArrowLeft, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null)
  const [users, setUsers] = useState<Usuario[]>([])
  const [campuses, setCampuses] = useState<Campus[]>([])
  const router = useRouter()

  const getCampusNameById = (campusId: string): string => {
    const campus = campuses.find((c: Campus) => c.campus_id === campusId)
    return campus?.nome || "Sem campus"
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, campusesRes] = await Promise.all([
          fetch("/api/v1/users"),
          fetch("/api/v1/campuses")
        ])
        
        const usersData: Usuario[] = await usersRes.json()
        const campusesData: Campus[] = await campusesRes.json()
        
        setUsers(usersData)
        setCampuses(campusesData)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [])

  const filteredUsers = users.filter((usuario: Usuario) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      usuario.nome.toLowerCase().includes(searchLower) ||
      usuario.email.toLowerCase().includes(searchLower) ||
      usuario.papel.toLowerCase().includes(searchLower) ||
      (usuario.campus_id && getCampusNameById(usuario.campus_id).toLowerCase().includes(searchLower))
    )
  })

  const handleAddUser = (newUser: Partial<Usuario>) => {
    const userToAdd: Usuario = {
      ...newUser,
      usuario_id: `user-${Date.now()}`,
      nome: newUser.nome || "",
      email: newUser.email || "",
      papel: newUser.papel || "operador",
      campus_id: newUser.campus_id || "",
      habilitado: true,
      perfil: {
        descricao: newUser.perfil?.descricao || "",
        imagem_url: newUser.perfil?.imagem_url || "/logo.svg",
      },
      organizacao_id: "2000"
    } as Usuario
    
    setUsers([...users, userToAdd])
  }

  const handleEditUser = (updatedUser: Partial<Usuario>) => {
  setUsers(users.map(user => 
    user.usuario_id === updatedUser.usuario_id ? { ...user, ...updatedUser } : user
  ))
}

  const handleEditClick = (user: Usuario) => {
    setSelectedUser(user)
    setIsEditModalOpen(true)
  }

  if (users.length === 0 || campuses.length === 0) {
    return <div className="p-4">Carregando...</div>
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
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin")}
            className="text-[var(--font-color)] transition-all"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white transition-all w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Usuário
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <UserSearchCard searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <UserListCard
          users={filteredUsers}
          onEditUser={handleEditClick}
          getCampusName={getCampusNameById}
        />
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