"use client"

import { DeleteUserDialog } from "@/components/manager-users/delete-user-dialog"
import { EditUserModal } from "@/components/manager-users/edit-user-modal"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { Usuario } from "@/lib/interface"
import { user } from "@/utils/user"
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function UserDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [userData, setUserData] = useState<Usuario | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    function fetchUser() {
      if (params?.id) {
        const foundUser = user.find((u) => u.usuario_id === params.id)
        setUserData(foundUser || null)
      }
    }

    fetchUser()
  }, [params?.id])

  const handleDeleteUser = () => {
    router.push("/dashboard/manager/users")
  }

  const handleEditUser = (updatedUser: any) => {
    setUserData(updatedUser)
  }

  if (!userData) {
    return (
      <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-lg transition-all duration-300">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <div className="text-xl text-[var(--font-color)]">Usuário não encontrado</div>
          <Button
            className="mt-4 bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </CardContent>
      </Card>
    )
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
    <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-lg transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold text-[var(--font-color)] md:text-2xl">
        </CardTitle>
        <Button
          variant="outline"
          className="border-[var(--border-color)] bg-[var(--bg-simple)] hover:bg-[var(--hover-color)] hover:text-white"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-24 w-24 border">
            <AvatarImage src={userData.foto || "/placeholder.svg?height=96&width=96"} alt={userData.nome} />
            <AvatarFallback className="text-2xl">{userData.nome.charAt(0)}</AvatarFallback>
          </Avatar>
          <h2 className="text-2xl font-bold text-[var(--font-color)]">{userData.nome}</h2>
          <Badge className={`${getRoleBadgeColor(userData.papel)} text-white`}>{userData.papel.toUpperCase()}</Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-medium text-[var(--font-color)]">ID</p>
            <p className="text-[var(--font-color)]">{userData.usuario_id}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-[var(--font-color)]">Email</p>
            <p className="text-[var(--font-color)]">{userData.email}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between gap-2 p-6 pt-0">
        <Button
          variant="outline"
          className="border-[var(--border-color)] bg-[var(--bg-simple)] hover:bg-[var(--button-2-color)] hover:text-white"
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Excluir Usuário
        </Button>

        <Button
          className="bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white"
          onClick={() => setIsEditModalOpen(true)}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Editar Usuário
        </Button>
      </CardFooter>

      <DeleteUserDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteUser}
        userName={userData.nome}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={userData}
        onEditUser={handleEditUser}
      />
    </Card>
  )
}