"use client";

import type { Campus, UserProfile } from '@/types';
import ProfileField from "./profile-field";

interface ProfileFormProps {
  usuario: UserProfile;
  campus?: Campus;
  onNomeChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onDescricaoChange: (value: string) => void;
}

export default function ProfileForm({
  usuario,
  campus,
  onNomeChange,
  onEmailChange,
  onDescricaoChange,
}: ProfileFormProps) {
  const MAX_NOME_LENGTH = 70;
  const MAX_EMAIL_LENGTH = 70;
  const MAX_DESCRICAO_LENGTH = 160;

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <div className="space-y-6">
      <ProfileField
        id="nome"
        label="Nome"
        value={usuario.name}
        onChange={onNomeChange}
        maxLength={MAX_NOME_LENGTH}
      />

      <ProfileField
        id="email"
        label="Email"
        value={usuario.email}
        onChange={onEmailChange}
        maxLength={MAX_EMAIL_LENGTH}
        type="email"
        placeholder="exemplo@dominio.com"
        validator={validateEmail}
        errorMessage="Formato de e-mail inválido"
        disabled={usuario.role !== "admin global"}
      />

      <ProfileField
        id="campus"
        label="Campus"
        value={campus?.name || ""}
        onChange={() => {}}
        disabled={true}
      />

      <ProfileField
        id="descricao"
        label="Descrição"
        value={usuario.description || ""}
        onChange={onDescricaoChange}
        maxLength={MAX_DESCRICAO_LENGTH}
        isTextarea={true}
      />
    </div>
  );
}
