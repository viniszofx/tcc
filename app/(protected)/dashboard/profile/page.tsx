"use client"

import type { Campus, Usuario } from "@/lib/interface"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import LoadingScreen from "@/components/custom/loading"
import ProfileActions from "@/components/profile/profile-actions"
import ProfileEditor from "@/components/profile/profile-editor"
import ProfileSidebar from "@/components/profile/profile-sidebar"
import { Card } from "@/components/ui/card"

export default function ProfilePage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [campuses, setCampuses] = useState<Campus[]>([])

  const getCampusNameById = (campusId: string): string => {
    const campus = campuses.find((c: Campus) => c.campus_id === campusId)
    return campus?.nome || "Sem campus"
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, campusesRes] = await Promise.all([
          fetch("/api/v1/user"),
          fetch("/api/v1/campuses")
        ])

        const userData: Usuario = await userRes.json()
        const campusesData: Campus[] = await campusesRes.json()

        setUsuario(userData)
        setCampuses(campusesData)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [])

  const handleSave = async () => {
    if (!usuario) return

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(usuario.email)) {
      alert("Por favor, insira um e-mail válido antes de salvar.")
      return
    }

    try {
      setIsSaving(true)
      await fetch("/api/v1/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(usuario)
      })
      alert("Perfil salvo com sucesso!")
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("Erro ao salvar perfil. Tente novamente.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleBack = () => {
    router.push("/dashboard")
  }

  const handleFieldChange = (field: keyof Usuario, value: any) => {
    if (usuario) {
      setUsuario({
        ...usuario,
        [field]: field === 'perfil' ? {
          ...usuario.perfil,
          descricao: value
        } : value
      })
    }
  }

  if (!usuario || campuses.length === 0) {
    return (
      <LoadingScreen />
    )
  }

  const campusNome = getCampusNameById(usuario.campus_id || "")

  return (
    <div className="flex-1 w-full p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 flex items-center justify-center">
      <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-lg transition-all duration-300 lg:max-w-5xl xl:max-w-6xl">
        <div className="flex flex-col md:flex-row h-full p-6 sm:p-8 gap-8">
          <ProfileSidebar
            usuario={{
              nome: usuario.nome,
              email: usuario.email,
              papel: usuario.papel as "admin" | "operador" | "presidente",
              perfil: {
                descricao: usuario.perfil?.descricao || "",
                imagem_url: usuario.perfil?.imagem_url || "/logo.svg"
              },
              campusName: campusNome
            }}
          />

          <div className="hidden md:block w-px bg-border h-auto" />

          <ProfileEditor
            usuario={usuario}
            campusName={campusNome}
            onFieldChange={handleFieldChange}
          />
        </div>

        <ProfileActions
          onSave={handleSave}
          onBack={handleBack}
          isSaving={isSaving}
        />
      </Card>
    </div>
  )
}