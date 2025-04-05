"use client"

import ProfileField from "./profile-field"

interface ProfileFormProps {
  nome: string
  email: string
  campus: string
  descricao: string
  onNomeChange: (value: string) => void
  onEmailChange: (value: string) => void
  onDescricaoChange: (value: string) => void
}

export default function ProfileForm({
  nome,
  email,
  campus,
  descricao,
  onNomeChange,
  onEmailChange,
  onDescricaoChange,
}: ProfileFormProps) {
  const MAX_NOME_LENGTH = 70
  const MAX_EMAIL_LENGTH = 70
  const MAX_DESCRICAO_LENGTH = 160

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  return (
    <div className="space-y-6">
      <ProfileField id="nome" label="Nome" value={nome} onChange={onNomeChange} maxLength={MAX_NOME_LENGTH} />

      <ProfileField
        id="email"
        label="Email"
        value={email}
        onChange={onEmailChange}
        maxLength={MAX_EMAIL_LENGTH}
        type="email"
        placeholder="exemplo@dominio.com"
        validator={validateEmail}
        errorMessage="Formato de e-mail inválido"
      />

      <ProfileField id="campus" label="Campus" value={campus} onChange={() => {}} disabled={true} />

      <ProfileField
        id="descricao"
        label="Descrição"
        value={descricao}
        onChange={onDescricaoChange}
        maxLength={MAX_DESCRICAO_LENGTH}
        isTextarea={true}
      />
    </div>
  )
}