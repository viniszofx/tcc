"use client"

import { DeleteUserDialog } from "@/components/manager-users/delete-user-dialog"
import { EditUserModal } from "@/components/manager-users/edit-user-modal"
import { UserDetailsCard } from "@/components/manager-users/user-details-card"
import { UserProfileCard } from "@/components/manager-users/user-profile-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Pencil, Trash2 } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

function getCampusNameById(campusId: string, campuses: any[]) {
  const campus = campuses.find((c) => String(c.id) === String(campusId))
  return campus ? campus.name : "Sem campus"
}

export default function UserDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : ""
  const [userData, setUserData] = useState<any>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [campuses, setCampuses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const [userRes, campusRes] = await Promise.all([
        fetch("/api/v1/users"),
        fetch("/api/v1/campuses"),
      ])
      const users = await userRes.json()
      const campusesData = await campusRes.json()
      setCampuses(campusesData)
      const foundUser = users.find(
        (u: any) =>
          String(u.id) === String(id) ||
          String(u.usuario_id) === String(id)
      )
      setUserData(foundUser || null)
      setLoading(false)
    }
    fetchData()
  }, [id])

  const handleDeleteUser = () => {
    router.push("/admin/users")
  }

  const handleEditUser = (updatedUser: any) => {
    setUserData(updatedUser)
  }

  if (loading) {
    return <div>Carregando...</div>
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
        <UserProfileCard
          usuario={{
            nome: userData.nome,
            papel: userData.papel,
            perfil: {
              imagem_url: userData.perfil?.imagem_url || "/logo.svg",
              descricao: userData.perfil?.descricao || ""
            }
          }}
        />

        <UserDetailsCard
          usuario={{
            usuario_id: userData.usuario_id,
            email: userData.email,
            campus_id: userData.campus_id,
            papel: userData.papel,
            campusName: getCampusNameById(userData.campus_id, campuses)
          }}
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
        userName={userData.name || userData.nome}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={userData}
        onEditUser={handleEditUser}
        campusList={campuses}
      />
    </Card>
  )
}