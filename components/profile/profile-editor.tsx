"use client"

import type { Usuario } from "@/lib/interface"
import ProfileForm from "./profile-form"

interface ProfileEditorProps {
  usuario: Usuario
  campusName: string
  onFieldChange: (field: keyof Usuario, value: any) => void
}

export default function ProfileEditor({
  usuario,
  campusName,
  onFieldChange,
}: ProfileEditorProps) {
  const handleNomeChange = (value: string) => onFieldChange('nome', value)
  const handleEmailChange = (value: string) => onFieldChange('email', value)
  const handleDescricaoChange = (value: string) => {
    onFieldChange('perfil', {
      ...usuario.perfil,
      descricao: value
    })
  }

  return (
    <div className="w-full md:w-2/3">
      <div className="bg-[var(--bg-simple)] rounded-lg p-6 border border-[var(--border-color)] shadow-sm h-auto md:h-full">
        <h3 className="text-lg font-medium text-[var(--font-color)] mb-6">Editar Perfil</h3>
        <ProfileForm
          nome={usuario.nome}
          email={usuario.email}
          campus={campusName}
          descricao={usuario.perfil?.descricao || ""}
          onNomeChange={handleNomeChange}
          onEmailChange={handleEmailChange}
          onDescricaoChange={handleDescricaoChange}
        />
      </div>
    </div>
  )
}