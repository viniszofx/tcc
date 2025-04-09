"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import ProfileActions from "@/components/profile/profile-actions"
import ProfileEditor from "@/components/profile/profile-editor"
import ProfileSidebar from "@/components/profile/profile-sidebar"
import { Card } from "@/components/ui/card"

export default function StaticProfilePage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const [perfil, setPerfil] = useState({
    id: "static-profile",
    nome: "João Silva",
    email: "joao@email.com",
    campus: "Campus Corumbá",
    descricao: "Administrador do sistema com experiência em gestão de comissões e processos acadêmicos.",
    cargo: "admin" as const,
    foto: "/logo.svg",
  })

  const handleSave = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(perfil.email)) {
      alert("Por favor, insira um e-mail válido antes de salvar.")
      return
    }

    try {
      setIsSaving(true)
      // Simulate API call
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
    router.back()
  }

  return (
    <div className="flex-1 w-full p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 flex items-center justify-center">
      <Card className="bg-[var(--bg-simple)] w-full max-w-[98%] xs:max-w-[95%] sm:max-w-[90%] md:max-w-[85%] lg:max-w-[calc(100%-var(--sidebar-width)-2rem)] mx-auto shadow-md rounded-lg flex flex-col h-full md:h-auto flex-grow">
        <div className="flex flex-col md:flex-row h-full p-6 sm:p-8 gap-8">
          <ProfileSidebar
            nome={perfil.nome}
            email={perfil.email}
            campus={perfil.campus}
            descricao={perfil.descricao}
            cargo={perfil.cargo}
            foto={perfil.foto}
          />

          <div className="hidden md:block w-px bg-border h-auto" />

          <ProfileEditor
            nome={perfil.nome}
            email={perfil.email}
            campus={perfil.campus}
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
