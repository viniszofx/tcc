"use client";

import LoadingScreen from "@/components/custom/loading";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { ProfileEditForm } from "@/components/profile/profile-edit-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUserPermissions } from "@/hooks/use-user-permissions";
import type { UserProfile, UserProfileWithRelations } from "@/interface";
import { Key, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MyProfilePage() {
  const { user, loading: permissionsLoading } = useUserPermissions();
  const router = useRouter();
  const [userData, setUserData] = useState<UserProfileWithRelations | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!permissionsLoading && !user) {
      router.push("/auth/login");
    }
  }, [permissionsLoading, user, router]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        const response = await fetch(`/api/user?id=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          console.error("Erro ao buscar dados do usuário");
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchUserData();
    }
  }, [user?.id]);

  const handleAvatarUpdate = (avatarUrl: string) => {
    setUserData((prev) => (prev ? { ...prev, avatar: avatarUrl } : null));
  };

  const handleAvatarDelete = () => {
    setUserData((prev) => (prev ? { ...prev, avatar: null } : null));
  };

  const handleProfileUpdate = (updatedData: Partial<UserProfile>) => {
    setUserData((prev) => (prev ? { ...prev, ...updatedData } : null));
  };

  if (permissionsLoading || loading) {
    return <LoadingScreen />;
  }

  if (!user || !userData) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">Erro ao carregar dados do perfil</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <Card className="bg-[var(--bg-simple)] shadow-lg border border-[var(--border-color)]">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold text-[var(--font-color)]">
                Meu Perfil
              </CardTitle>
              <CardDescription className="text-[var(--font-color)] opacity-70">
                Gerencie suas informações pessoais e configurações
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Link href="/application/settings">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[var(--border-color)] hover:bg-[var(--hover-3-color)]"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Avatar e Upload */}
        <Card className="bg-[var(--bg-simple)] border-[var(--border-color)]">
          <CardHeader className="text-center">
            <CardTitle className="text-[var(--font-color)]">Avatar</CardTitle>
            <CardDescription className="text-[var(--font-color)] opacity-70">
              Sua foto de perfil
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <AvatarUpload
              currentAvatar={userData.avatar}
              userName={userData.name}
              onAvatarUpdate={handleAvatarUpdate}
              onAvatarDelete={handleAvatarDelete}
              isLoading={loading}
            />
          </CardContent>
        </Card>

        {/* Informações do Perfil */}
        <ProfileEditForm
          user={userData}
          onUpdate={handleProfileUpdate}
          isLoading={loading}
        />
      </div>

      {/* Informações Adicionais */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Associações */}
        <Card className="bg-[var(--bg-simple)] border-[var(--border-color)]">
          <CardHeader>
            <CardTitle className="text-[var(--font-color)]">
              Suas Associações
            </CardTitle>
            <CardDescription className="text-[var(--font-color)] opacity-70">
              Campus e comissões que você faz parte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Campus */}
            {userData.campusMembers && userData.campusMembers.length > 0 ? (
              <div>
                <h4 className="font-medium text-[var(--font-color)] mb-2">
                  Campus
                </h4>
                {userData.campusMembers.map((member: any, index: number) => (
                  <div
                    key={index}
                    className="text-sm text-[var(--font-color)] opacity-80"
                  >
                    {member.campus?.name}
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <h4 className="font-medium text-[var(--font-color)] mb-2">
                  Campus
                </h4>
                <p className="text-sm text-[var(--font-color)] opacity-60">
                  Nenhum campus associado
                </p>
              </div>
            )}

            {/* Comissões */}
            {userData.commissionMembers &&
            userData.commissionMembers.length > 0 ? (
              <div>
                <h4 className="font-medium text-[var(--font-color)] mb-2">
                  Comissões
                </h4>
                {userData.commissionMembers.map(
                  (member: any, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-[var(--font-color)] opacity-80">
                        {member.commission?.name}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          member.roleInCommission === "Presidente"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {member.roleInCommission}
                      </span>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div>
                <h4 className="font-medium text-[var(--font-color)] mb-2">
                  Comissões
                </h4>
                <p className="text-sm text-[var(--font-color)] opacity-60">
                  Nenhuma comissão associada
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card className="bg-[var(--bg-simple)] border-[var(--border-color)]">
          <CardHeader>
            <CardTitle className="text-[var(--font-color)]">
              Segurança
            </CardTitle>
            <CardDescription className="text-[var(--font-color)] opacity-70">
              Configurações de segurança da conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-[var(--font-color)]">Senha</p>
                <p className="text-sm text-[var(--font-color)] opacity-60">
                  Última alteração: Não disponível
                </p>
              </div>
              <Link href="/application/settings?tab=security">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[var(--border-color)] hover:bg-[var(--hover-3-color)]"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Alterar
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
