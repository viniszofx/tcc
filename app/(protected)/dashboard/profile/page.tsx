"use client";

import type { Campus, UserProfile } from "@/lib/new-interface";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import LoadingScreen from "@/components/custom/loading";
import ProfileActions from "@/components/profile/profile-actions";
import ProfileEditor from "@/components/profile/profile-editor";
import ProfileSidebar from "@/components/profile/profile-sidebar";
import { Card } from "@/components/ui/card";
import data from "@/data/new-db.json";

export default function ProfilePage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [usuario, setUsuario] = useState<UserProfile | null>(null);
  const [campuses, setCampuses] = useState<Campus[]>([]);

  // Simulando usuário logado - você pode ajustar para pegar do contexto de autenticação
  const currentUserId = "04160162-6ebf-4dcd-95dc-5e2e4599baad"; // Aline Souza

  const initialUsers = (data.user_profiles || []).map((user: any) => ({
    ...user,
  }));

  const getCampusForUser = (userId: string) => {
    // Busca o campus_member para encontrar o campusId do usuário
    const campusMember = data.campus_members.find(
      (member) => member.userId === userId
    );
    if (campusMember) {
      // Busca o campus pelo campusId
      return data.campus.find((campus) => campus.id === campusMember.campusId);
    }
    return null;
  };

  useEffect(() => {
    setCampuses((data.campus || []).map((campus: any) => ({ ...campus })));

    // Busca o usuário atual
    const foundUser = initialUsers.find((user) => user.id === currentUserId);
    if (foundUser) {
      // Busca o campus do usuário
      const userCampus = getCampusForUser(currentUserId);
      setUsuario({
        ...foundUser,
        campusName: userCampus?.name || "Campus não encontrado",
      });
    }
  }, []);

  const handleSave = async () => {
    if (!usuario) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(usuario.email)) {
      alert("Por favor, insira um e-mail válido antes de salvar.");
      return;
    }

    try {
      setIsSaving(true);
      alert("Perfil salvo com sucesso!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Erro ao salvar perfil. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    router.push("/dashboard");
  };

  const handleFieldChange = (field: string, value: string) => {
    if (!usuario) return;

    if (field === "description") {
      setUsuario({
        ...usuario,
        profile: {
          ...usuario.profile,
          description: value,
        },
      });
    } else {
      setUsuario({
        ...usuario,
        [field]: value,
      });
    }
  };

  if (!usuario || campuses.length === 0) {
    return <LoadingScreen />;
  }

  const campusNome =
    getCampusForUser(usuario.id)?.name || "Campus não encontrado";

  return (
    <div className="flex-1 w-full p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 flex items-center justify-center">
      <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-lg transition-all duration-300 lg:max-w-5xl xl:max-w-6xl">
        <div className="flex flex-col md:flex-row h-full p-6 sm:p-8 gap-8">
          <ProfileSidebar
            usuario={usuario}
            campus={getCampusForUser(usuario.id) || undefined}
          />

          <div className="hidden md:block w-px bg-border h-auto" />

          <ProfileEditor
            usuario={usuario}
            onFieldChange={handleFieldChange}
            campus={getCampusForUser(usuario.id) || undefined}
          />
        </div>

        <ProfileActions
          onSave={handleSave}
          onBack={handleBack}
          isSaving={isSaving}
        />
      </Card>
    </div>
  );
}
