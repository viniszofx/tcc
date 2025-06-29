"use client";

import type { Campus, UserProfile } from "@/interface";
import ProfileForm from "./profile-form";

interface ProfileEditorProps {
  usuario: UserProfile;
  campus?: Campus;
  onFieldChange: (field: string, value: string) => void;
}

export default function ProfileEditor({
  usuario,
  campus,
  onFieldChange,
}: ProfileEditorProps) {
  const handleNomeChange = (value: string) => onFieldChange("name", value);
  const handleEmailChange = (value: string) => onFieldChange("email", value);
  const handleDescricaoChange = (value: string) =>
    onFieldChange("description", value);

  return (
    <div className="w-full md:w-2/3">
      <div className="bg-[var(--bg-simple)] rounded-lg p-6 border border-[var(--border-color)] shadow-sm h-auto md:h-full">
        <h3 className="text-lg font-medium text-[var(--font-color)] mb-6">
          Editar Perfil
        </h3>
        <ProfileForm
          usuario={usuario}
          campus={campus}
          onNomeChange={handleNomeChange}
          onEmailChange={handleEmailChange}
          onDescricaoChange={handleDescricaoChange}
        />
      </div>
    </div>
  );
}
