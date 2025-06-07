"use client"

import data from "@/data/db.json"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import ProfileActions from "@/components/profile/profile-actions"
import ProfileEditor from "@/components/profile/profile-editor"
import ProfileSidebar from "@/components/profile/profile-sidebar"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ProfileType } from "@/lib/interface"

import ProfileLoading from "./loading"
import NotFound from "./not-found"

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const profileId = params.id as string

  const [perfil, setPerfil] = useState<ProfileType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const fetchProfileData = async (id: string): Promise<ProfileType | null> => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const foundUser = data.users.find((u) => u.id === id)
    if (!foundUser) {
      return null
    }

    const userCampus = data.campuses.find(c => c.campus_id === foundUser.campus_id)

    return {
      id: foundUser.id,
      nome: foundUser.name,
      email: foundUser.email,
      campus: userCampus?.nome || "",
      descricao: foundUser.profile.description,
      cargo: foundUser.role as "admin" | "operador" | "presidente",
      foto: foundUser.profile.image
    }
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        const profileData = await fetchProfileData(profileId)

        if (!profileData) {
          NotFound()
          return
        }

        setPerfil(profileData)
      } catch (error) {
        console.error("Failed to fetch profile:", error)
        throw new Error("Falha ao carregar o perfil")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [profileId])

  const handleSave = async () => {
    if (!perfil) return

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
    router.push(`/dashboard/org/${params.slug}/campus/${params.campus_id}/commissions/${params.commission_id}`)
  }

  if (isLoading) {
    return <ProfileLoading />
  }

  return (
    <div className="flex-1 w-full p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 flex items-center justify-center">
      <Card className="bg-[var(--bg-simple)] w-full max-w-[98%] xs:max-w-[95%] sm:max-w-[90%] md:max-w-[85%] lg:max-w-[calc(100%-var(--sidebar-width)-2rem)] mx-auto shadow-md rounded-lg flex flex-col h-full md:h-auto flex-grow">
        <CardContent className="flex-grow p-0">
          <div className="flex flex-col md:flex-row h-full p-6 sm:p-8 gap-8">
            <ProfileSidebar
              nome={perfil!.nome}
              email={perfil!.email}
              campus={perfil!.campus}
              descricao={perfil!.descricao}
              cargo={perfil!.cargo}
              foto={perfil!.foto}
            />

            <Separator orientation="vertical" className="hidden md:block" />

            <ProfileEditor
              nome={perfil!.nome}
              email={perfil!.email}
              campus={perfil!.campus}
              descricao={perfil!.descricao}
              onNomeChange={(value) => setPerfil({ ...perfil!, nome: value })}
              onEmailChange={(value) => setPerfil({ ...perfil!, email: value })}
              onDescricaoChange={(value) => setPerfil({ ...perfil!, descricao: value })}
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
