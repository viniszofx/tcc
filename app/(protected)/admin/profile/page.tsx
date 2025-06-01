"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import ProfileActions from "@/components/profile/profile-actions"
import ProfileEditor from "@/components/profile/profile-editor"
import ProfileSidebar from "@/components/profile/profile-sidebar"
import { Card } from "@/components/ui/card"

function getCampusNameById(campusId: string, campuses: any[]) {
  const campus = campuses.find((c) => c.id === campusId)
  console.log(campus, "campus")
  return campus ? campus.name : "Sem campus"
}

export default function ProfilePage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [perfil, setPerfil] = useState<any>(null)
  const [campuses, setCampuses] = useState<any[]>([])

  useEffect(() => {
    // Busca usuário
    fetch("/api/v1/user")
      .then((res) => res.json())
      .then((user) => {
        setPerfil({
          id: user.id,
          nome: user.name,
          email: user.email,
          campus: user.campus_id,
          descricao: user.profile?.description || "",
          cargo: user.role,
          foto: user.profile?.image || "/logo.svg",
        })
      })
    // Busca campuses para mostrar nome do campus
    fetch("/api/v1/campuses")
      .then((res) => res.json())
      .then(setCampuses)
  }, [])

  const handleSave = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(perfil.email)) {
      alert("Por favor, insira um e-mail válido antes de salvar.")
      return
    }

    try {
      setIsSaving(true)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      alert("Perfil salvo com sucesso!")
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("Erro ao salvar perfil. Tente novamente.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleBack = () => {
    router.push("/")
  }

  if (!perfil || campuses.length === 0) return <div>Carregando...</div>;
  const campusNome = getCampusNameById(perfil.campus, campuses);

  return (
    <div className="flex-1 w-full p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 flex items-center justify-center">
      <Card className="bg-[var(--bg-simple)] w-full max-w-[98%] xs:max-w-[95%] sm:max-w-[90%] md:max-w-[85%] lg:max-w-[calc(100%-var(--sidebar-width)-2rem)] mx-auto shadow-md rounded-lg flex flex-col h-full md:h-auto flex-grow">
        <div className="flex flex-col md:flex-row h-full p-6 sm:p-8 gap-8">
          <ProfileSidebar
            nome={perfil.nome}
            email={perfil.email}
            campus={campusNome}
            descricao={perfil.descricao}
            cargo={perfil.cargo}
            foto={perfil.foto}
          />

          <div className="hidden md:block w-px bg-border h-auto" />

          <ProfileEditor
            nome={perfil.nome}
            email={perfil.email}
            campus={campusNome}
            descricao={perfil.descricao}
            onNomeChange={(value) => setPerfil({ ...perfil, nome: value })}
            onEmailChange={(value) => setPerfil({ ...perfil, email: value })}
            onDescricaoChange={(value) => setPerfil({ ...perfil, descricao: value })}
          />
        </div>

        <ProfileActions onSave={handleSave} onBack={handleBack} isSaving={isSaving} />
      </Card>
    </div>
  )
}