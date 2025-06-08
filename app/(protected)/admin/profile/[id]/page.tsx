"use client"

import data from "@/data/db.json"
import type { Campus, Usuario } from "@/lib/interface"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import ProfileActions from "@/components/profile/profile-actions"
import ProfileEditor from "@/components/profile/profile-editor"
import ProfileSidebar from "@/components/profile/profile-sidebar"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import ProfileLoading from "./loading"
import NotFound from "./not-found"

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const profileId = params.id as string

  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [campuses, setCampuses] = useState<Campus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const getCampusNameById = (campusId: string): string => {
    const campus = campuses.find((c: Campus) => c.campus_id === campusId)
    return campus?.nome || "Sem campus"
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        // Simulando chamadas API com dados locais
        const user = data.users.find(u => u.usuario_id === profileId)
        const campusesData = data.campuses
        
        if (!user) {
          NotFound()
          return
        }

        setUsuario(user)
        setCampuses(campusesData)
      } catch (error) {
        console.error("Failed to fetch profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [profileId])

  const handleSave = async () => {
    if (!usuario) return

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(usuario.email)) {
      alert("Por favor, insira um e-mail válido antes de salvar.")
      return
    }

    try {
      setIsSaving(true)
      // Simulando salvamento
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert("Perfil salvo com sucesso!")
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("Erro ao salvar perfil. Tente novamente.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleBack = () => {
    router.push(`/dashboard/org/${params.slug}/campus/${params.campus_id}/commissions/${params.commission_id}`)
  }

  const handleFieldChange = (field: keyof Usuario, value: any) => {
    if (usuario) {
      setUsuario({
        ...usuario,
        [field]: value
      })
    }
  }

  if (isLoading || !usuario) {
    return <ProfileLoading />
  }

  const campusNome = getCampusNameById(usuario.campus_id || "")

  return (
    <div className="flex-1 w-full p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 flex items-center justify-center">
      <Card className="bg-[var(--bg-simple)] w-full max-w-[98%] xs:max-w-[95%] sm:max-w-[90%] md:max-w-[85%] lg:max-w-[calc(100%-var(--sidebar-width)-2rem)] mx-auto shadow-md rounded-lg flex flex-col h-full md:h-auto flex-grow">
        <CardContent className="flex-grow p-0">
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

            <Separator orientation="vertical" className="hidden md:block" />

            <ProfileEditor
              usuario={usuario}
              campusName={campusNome}
              onFieldChange={handleFieldChange}
            />
          </div>
        </CardContent>

        <CardFooter className="p-0">
          <ProfileActions onSave={handleSave} onBack={handleBack} isSaving={isSaving} />
        </CardFooter>
      </Card>
    </div>
  )
}