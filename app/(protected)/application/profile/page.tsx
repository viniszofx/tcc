"use client";

import LoadingScreen from "@/components/custom/loading";
import { PageTitle } from "@/components/custom/page-title";
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
import { useProfilePageData } from "@/hooks/queries/use-page-data";
import { useUserPermissions } from "@/hooks/use-user-permissions";
import type { UserProfile } from "@/interface";
import { Key, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MyProfilePage() {
  const { user, loading: permissionsLoading } = useUserPermissions();
  const router = useRouter();

  // Usar hook otimizado para dados do perfil
  const {
    data: userData,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useProfilePageData(user?.id);

  // Local state apenas para controle de UI
  const [localUserData, setLocalUserData] =
    useState<typeof userData>(undefined);

  // Estado para controlar avatar que foi recém atualizado
  const [pendingAvatar, setPendingAvatar] = useState<string | null>(null);
  const [avatarUpdateTime, setAvatarUpdateTime] = useState<number | null>(null);

  // Sincronizar dados locais com dados do cache
  useEffect(() => {
    if (userData) {
      // Se temos um avatar pendente e foi atualizado há menos de 10 segundos, manter o avatar local
      const now = Date.now();
      const shouldKeepPendingAvatar =
        pendingAvatar && avatarUpdateTime && now - avatarUpdateTime < 10000; // 10 segundos

      if (shouldKeepPendingAvatar) {
        setLocalUserData({ ...userData, avatar: pendingAvatar });
      } else {
        setLocalUserData(userData);
        // Limpar avatar pendente após sincronização
        if (pendingAvatar) {
          setPendingAvatar(null);
          setAvatarUpdateTime(null);
        }
      }
    }
  }, [userData, pendingAvatar, avatarUpdateTime]);

  useEffect(() => {
    if (!permissionsLoading && !user) {
      router.push("/auth/login");
    }
  }, [permissionsLoading, user, router]);

  const handleAvatarUpdate = (avatarUrl: string) => {
    // Adicionar timestamp para cache busting
    const avatarWithTimestamp = `${avatarUrl}?t=${Date.now()}`;

    // Marcar como avatar pendente
    setPendingAvatar(avatarWithTimestamp);
    setAvatarUpdateTime(Date.now());

    // Atualizar estado local imediatamente
    setLocalUserData((prev) =>
      prev ? { ...prev, avatar: avatarWithTimestamp } : prev
    );

    // Refetch após um delay para permitir sincronização do servidor
    setTimeout(() => {
      refetchProfile();
    }, 2000);
  };

  const handleAvatarDelete = () => {
    // Marcar como avatar removido
    setPendingAvatar(null);
    setAvatarUpdateTime(Date.now());

    // Atualizar estado local imediatamente
    setLocalUserData((prev) => (prev ? { ...prev, avatar: null } : prev));

    // Refetch após um delay
    setTimeout(() => {
      refetchProfile();
    }, 2000);
  };

  const handleProfileUpdate = (updatedData: Partial<UserProfile>) => {
    setLocalUserData((prev) => (prev ? { ...prev, ...updatedData } : prev));
    refetchProfile();
  };

  if (permissionsLoading || profileLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">Usuário não autenticado</p>
        </CardContent>
      </Card>
    );
  }

  if (profileError) {
    return (
      <>
        <PageTitle title="Erro - KDÊ" />
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">
              Erro ao carregar dados do perfil: {profileError.message}
            </p>
            <Button onClick={() => refetchProfile()} className="mt-2">
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </>
    );
  }

  if (!localUserData) {
    return (
      <>
        <PageTitle title="Dados não encontrado - KDÊ" />
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">Dados do perfil não encontrados</p>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageTitle title="Perfil - KDÊ" />
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
                currentAvatar={localUserData?.avatar}
                userName={localUserData?.name || user.email}
                onAvatarUpdate={handleAvatarUpdate}
                onAvatarDelete={handleAvatarDelete}
                isLoading={profileLoading}
              />
            </CardContent>
          </Card>

          {/* Informações do Perfil */}
          <ProfileEditForm
            user={localUserData!}
            onUpdate={handleProfileUpdate}
            isLoading={profileLoading}
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
              {localUserData?.campusMembers &&
                localUserData.campusMembers.length > 0 ? (
                <div>
                  <h4 className="font-medium text-[var(--font-color)] mb-2">
                    Campus
                  </h4>
                  {localUserData.campusMembers.map(
                    (member: any, index: number) => (
                      <div
                        key={index}
                        className="text-sm text-[var(--font-color)] opacity-80"
                      >
                        {member.campus?.name}
                      </div>
                    )
                  )}
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
              {localUserData?.commissionMembers &&
                localUserData.commissionMembers.length > 0 ? (
                <div>
                  <h4 className="font-medium text-[var(--font-color)] mb-2">
                    Comissões
                  </h4>
                  {localUserData.commissionMembers.map(
                    (member: any, index: number) => (
                      <div
                        key={index}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="text-[var(--font-color)] opacity-80">
                          {member.commission?.name}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs ${member.roleInCommission === "Presidente"
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
    </>
  );
}
