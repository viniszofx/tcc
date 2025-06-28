"use client";

import data from "@/data/new-db.json";
import type { Campus, UserProfile } from "@/lib/new-interface";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import LoadingScreen from "@/components/custom/loading";
import ProfileActions from "@/components/profile/profile-actions";
import ProfileEditor from "@/components/profile/profile-editor";
import ProfileSidebar from "@/components/profile/profile-sidebar";
import { Card } from "@/components/ui/card";
import NotFound from "./not-found";

export default function ProfileDynamicPage() {
  const params = useParams();
  const router = useRouter();
  const profileId = params.id as string;

  const [usuario, setUsuario] = useState<UserProfile | null>(null);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const initialUsers = (data.user_profiles || []).map((user: any) => ({
    ...user,
  }));

  const getCampusForUser = (userId: string) => {
    const campusMember = data.campus_members.find(
      (member) => member.userId === userId
    );
    if (campusMember) {
      return data.campus.find((campus) => campus.id === campusMember.campusId);
    }
    return null;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setCampuses((data.campus || []).map((campus: any) => ({ ...campus })));

        const user = initialUsers.find((u) => u.id === profileId);

        if (!user) {
          NotFound();
          return;
        }

        const userCampus = getCampusForUser(profileId);
        setUsuario({
          ...user,
          campusName: userCampus?.name || "Campus não encontrado",
        });
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [profileId]);

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
    router.push(`/dashboard`);
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

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!usuario) {
    return <NotFound />;
  }

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
