"use client"

import ProfileForm from "./profile-form"

interface ProfileEditorProps {
  nome: string
  email: string
  campus: string
  descricao: string
  onNomeChange: (value: string) => void
  onEmailChange: (value: string) => void
  onDescricaoChange: (value: string) => void
}

export default function ProfileEditor({
  nome,
  email,
  campus,
  descricao,
  onNomeChange,
  onEmailChange,
  onDescricaoChange,
}: ProfileEditorProps) {
  return (
    <div className="w-full md:w-2/3">
      <div className="bg-[var(--bg-simple)] rounded-lg p-6 border border-[var(--border-color)] shadow-sm h-auto md:h-full">
        <h3 className="text-lg font-medium text-[var(--font-color)] mb-6">Editar Perfil</h3>
        <ProfileForm
          nome={nome}
          email={email}
          campus={campus}
          descricao={descricao}
          onNomeChange={onNomeChange}
          onEmailChange={onEmailChange}
          onDescricaoChange={onDescricaoChange}
        />
      </div>
    </div>
  )
}