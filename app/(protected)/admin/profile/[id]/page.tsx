"use client";

import type { Campus, UserProfile } from "@/interface";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import LoadingScreen from "@/components/custom/loading";
import ProfileActions from "@/components/profile/profile-actions";
import ProfileEditor from "@/components/profile/profile-editor";
import ProfileSidebar from "@/components/profile/profile-sidebar";
import { Card } from "@/components/ui/card";
import { useParams } from "next/navigation";

type UserWithCampus = UserProfile & {
  campusName?: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const [isSaving, setIsSaving] = useState(false);
  const [usuario, setUsuario] = useState<UserWithCampus | null>(null);
  const [campuses, setCampuses] = useState<Campus[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        try {
          // Buscar usuário específico
          const userResponse = await fetch(`/api/user?id=${userId}`);
          const userData = await userResponse.json();

          // Buscar campus
          const campusesResponse = await fetch("/api/campus");
          const campusesData = await campusesResponse.json();

          // Buscar membros de campus
          const campusMembersResponse = await fetch("/api/campus-member");
          const campusMembersData = await campusMembersResponse.json();

          if (
            userResponse.ok &&
            campusesResponse.ok &&
            campusMembersResponse.ok
          ) {
            setCampuses(campusesData);

            if (userData) {
              // Encontrar campus do usuário
              const userCampusMember = campusMembersData.find(
                (cm: any) => cm.userId === userData.id
              );
              const userCampus = userCampusMember
                ? campusesData.find(
                    (c: Campus) => c.id === userCampusMember.campusId
                  )
                : null;

              setUsuario({
                ...userData,
                campusName: userCampus?.name || "Campus não encontrado",
              });
            }
          }
        } catch (error) {
          console.error("Erro ao carregar dados do usuário:", error);
        }
      }
    };

    fetchUserData();
  }, [userId]);

  const handleSave = async () => {
    if (!usuario) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(usuario.email)) {
      alert("Por favor, insira um e-mail válido antes de salvar.");
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch("/api/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(usuario),
      });

      if (response.ok) {
        alert("Perfil salvo com sucesso!");
      } else {
        alert("Erro ao salvar perfil.");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Erro ao salvar perfil. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    router.push("/admin");
  };

  const handleFieldChange = (field: string, value: string) => {
    if (!usuario) return;

    if (field === "description") {
      setUsuario({
        ...usuario,
        description: value,
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

  const campusNome = usuario.campusName || "Campus não encontrado";

  return (
    <div className="flex-1 w-full p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 flex items-center justify-center">
      <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-lg transition-all duration-300 lg:max-w-5xl xl:max-w-6xl">
        <div className="flex flex-col md:flex-row h-full p-6 sm:p-8 gap-8">
          <ProfileSidebar
            usuario={usuario}
            campus={campuses.find((c) => c.name === usuario.campusName)}
          />

          <div className="hidden md:block w-px bg-border h-auto" />

          <ProfileEditor
            usuario={usuario}
            onFieldChange={handleFieldChange}
            campus={campuses.find((c) => c.name === usuario.campusName)}
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
