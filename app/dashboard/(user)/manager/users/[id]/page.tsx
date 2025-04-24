"use client"

import { user, campusList, getCampusNameById } from "@/utils/user"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { Usuario } from "@/lib/interface"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trash2, Pencil } from "lucide-react"
import { DeleteUserDialog } from "@/components/manager-users/delete-user-dialog"
import { EditUserModal } from "@/components/manager-users/edit-user-modal"
import { UserProfileCard } from "@/components/manager-users/user-profile-card"
import { UserDetailsCard } from "@/components/manager-users/user-details-card"

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
        if (foundUser) {
          setUserData(foundUser)
        } else {
          setUserData(null)
        }
      }
    }

    fetchUser()
  }, [params?.id])

  const handleDeleteUser = () => {
    router.push("/dashboard/manager/users")
  }

  const handleEditUser = (updatedUser: Usuario) => {
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

  return (
    <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-lg transition-all duration-300">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <CardTitle className="text-xl font-bold text-[var(--font-color)] md:text-2xl">Detalhes do Usuário</CardTitle>
          <CardDescription className="text-[var(--font-color)] opacity-70">
            Visualize e gerencie as informações do usuário
          </CardDescription>
        </div>
        <Button
          variant="outline"
          className="border-[var(--border-color)] bg-[var(--bg-simple)] hover:bg-[var(--hover-color)] hover:text-white w-full sm:w-auto"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </CardHeader>

      <CardContent className="flex flex-col gap-6 p-6">
        <UserProfileCard nome={userData.nome} papel={userData.papel} foto={userData.imagem_url} />

        <UserDetailsCard
          id={userData.usuario_id}
          email={userData.email}
          campus={getCampusNameById(userData.campus_id || "")}
          papel={userData.papel}
        />
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row sm:justify-between gap-2 p-6 pt-0">
        <Button
          variant="outline"
          className="border-[var(--border-color)] bg-[var(--bg-simple)] hover:bg-[var(--button-2-color)] hover:text-white w-full sm:w-auto"
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Excluir Usuário
        </Button>

        <Button
          className="bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white w-full sm:w-auto"
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
        campusList={campusList}
      />
    </Card>
  )
}