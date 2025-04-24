"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import ProfileActions from "@/components/profile/profile-actions"
import ProfileEditor from "@/components/profile/profile-editor"
import ProfileSidebar from "@/components/profile/profile-sidebar"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { user, getCampusNameById } from "@/utils/user"

import ProfileLoading from "./loading"
import NotFound from "./not-found"

type ProfileType = {
  id: string
  nome: string
  email: string
  campus: string
  descricao: string
  cargo: "admin" | "operador" | "presidente"
  foto: string
}

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const profileId = params.id as string

  const [perfil, setPerfil] = useState<ProfileType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Função para simular a busca de dados do usuário
  // Em produção, isso seria substituído por uma chamada de API real
  const fetchProfileData = async (id: string): Promise<ProfileType | null> => {
    // Simulando um atraso de rede
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Encontrando o usuário pelo ID
    const foundUser = user.find((u) => u.usuario_id === id)

    // Se não encontrar o usuário, retorne null
    if (!foundUser) {
      return null
    }

    return {
      id: foundUser.usuario_id,
      nome: foundUser.nome,
      email: foundUser.email,
      campus: getCampusNameById(foundUser.campus_id || ""),
      descricao: "Descrição do usuário não disponível.", // Placeholder, já que não temos esse campo no modelo
      cargo: foundUser.papel as "admin" | "operador" | "presidente",
      foto: foundUser.imagem_url || "/logo.svg",
    }
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        const profileData = await fetchProfileData(profileId)

        if (!profileData) {
          // Se não encontrar o perfil, use o componente not-found
          NotFound()
          return
        }

        setPerfil(profileData)
      } catch (error) {
        console.error("Failed to fetch profile:", error)
        // Erros serão capturados pelo componente error.tsx
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

      // Simulando uma chamada de API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Aqui você implementaria a chamada real para a API
      // const response = await fetch(`/api/profile/${profileId}`, {
      //   method: "PUT",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(perfil),
      // })

      alert("Perfil salvo com sucesso!")
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("Erro ao salvar perfil. Tente novamente.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleBack = () => {
    router.push("/profile")
  }

  // Mostrar o componente de carregamento enquanto os dados estão sendo buscados
  if (isLoading) {
    return <ProfileLoading />
  }

  // O caso de perfil não encontrado agora é tratado pelo componente not-found.tsx

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
