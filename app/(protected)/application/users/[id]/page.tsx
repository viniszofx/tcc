"use client";

import LoadingScreen from "@/components/custom/loading";
import { PageTitle } from "@/components/custom/page-title";
import { DeleteUserDialog } from "@/components/manager-users/delete-user-dialog";
import { EditUserModal } from "@/components/manager-users/edit-user-modal";
import { UserProfileCard } from "@/components/manager-users/user-profile-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUserDetailData } from "@/hooks/queries/use-page-data";
import { useUserPermissions } from "@/hooks/use-consolidated-user";
import type { UserProfile } from '@/types';
import { Pencil, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UserDetailsPage() {
  const {
    user,
    canManageUsers,
    loading: permissionsLoading,
  } = useUserPermissions();
  const params = useParams();
  const router = useRouter();

  const id =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";

  // Usar hook otimizado para buscar dados do usuário
  const {
    user: userData,
    campuses,
    userCampuses,
    organizations,
    userOrganizations,
    isLoading,
    error,
    refetch,
  } = useUserDetailData(id);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (!permissionsLoading && !canManageUsers) {
      router.push("/application");
    }
  }, [permissionsLoading, canManageUsers, router]);

  const handleEditUser = (updatedUser: Partial<UserProfile>) => {
    // Include the user ID in the request body
    const userDataWithId = {
      ...updatedUser,
      id: id, // Use the id from the URL params
    };

    fetch(`/api/user`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userDataWithId),
    })
      .then((response) => {
        if (response.ok) {
          // Invalidar cache para atualizar dados
          refetch();
          setIsEditModalOpen(false);
        } else {
          console.error("Erro ao atualizar usuário");
        }
      })
      .catch((error) => {
        console.error("Erro ao atualizar usuário:", error);
      });
  };

  const handleDeleteUser = async () => {
    try {
      const response = await fetch(`/api/user/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/application/users");
      } else {
        console.error("Erro ao deletar usuário");
      }
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
    }
  };

  if (permissionsLoading || isLoading) {
    return <LoadingScreen />;
  }

  if (!canManageUsers) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">Acesso negado</p>
        </CardContent>
      </Card>
    );
  }

  // Verificar se o usuário atual é administrador global
  const isCurrentUserGlobalAdmin = user?.organizationMembers?.some(
    (member: any) => member.role === "admin global"
  ) || false;

  // Verificar se o usuário sendo visualizado é administrador global
  const isTargetUserGlobalAdmin = userData?.organizationMembers?.some(
    (member: any) => member.role === "admin global"
  ) || false;

  // Regras de permissão:
  // 1. Apenas administradores globais podem atribuir o papel de "admin global"
  // 2. Usuários não podem se auto-promover a "admin global"
  // 3. Membros normais não podem se tornar admins sem um admin fazer isso
  const canEditGlobalAdminRole = isCurrentUserGlobalAdmin && userData?.id !== user?.id;
  const canEditUserRoles = isCurrentUserGlobalAdmin || canManageUsers;

  console.log("🔧 DEBUG UserDetailsPage:", {
    userId: userData?.id,
    currentUserId: user?.id,
    isCurrentUserGlobalAdmin,
    isTargetUserGlobalAdmin,
    canEditGlobalAdminRole,
    canEditUserRoles,
    currentUserOrgMembers: user?.organizationMembers,
    targetUserOrgMembers: userData?.organizationMembers,
  });

  if (error) {
    return (
      <>
        <PageTitle title="Erro - KDÊ" />
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">
              Erro ao carregar dados: {error.message}
            </p>
            <Button onClick={() => refetch()} className="mt-2">
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </>
    );
  }

  if (!userData) {
    return (
      <>
        <PageTitle title="Usuário não encontrado - KDÊ" />
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">Usuário não encontrado</p>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageTitle title="Detalhes dos usuários - KDÊ" />
      <div className="space-y-6">
        <Card className="bg-[var(--bg-simple)] shadow-lg border border-[var(--border-color)]">
          <CardHeader>
            <div className="flex flex-col-reverse gap-4 lg:flex-row lg:justify-between lg:items-start">
              <div>
                <CardTitle className="text-2xl font-bold text-[var(--font-color)] break-words">
                  {userData.name || userData.email}
                </CardTitle>
                <CardDescription className="text-[var(--font-color)] opacity-70">
                  Detalhes e configurações do usuário
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2 justify-start lg:justify-end">
                <Button
                  onClick={() => setIsEditModalOpen(true)}
                  className="bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] px-4 py-2 text-base sm:px-2 sm:py-1 sm:text-sm"
                >
                  <Pencil className="w-4 h-4 mr-0 sm:mr-2" />
                  <span className="hidden sm:inline">Editar</span>
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="px-4 py-2 text-base sm:px-2 sm:py-1 sm:text-sm"
                >
                  <Trash2 className="w-4 h-4 mr-0 sm:mr-2" />
                  <span className="hidden sm:inline">Excluir</span>
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Cards de informações */}
        <div className="grid gap-6 md:grid-cols-2">
          <UserProfileCard
            usuario={{
              nome: userData.name,
              papel: userData.role === "admin global" ? "Admin Global" : userData.role === "admin" ? "Admin" : "Membro",
              descricao: userData.description,
              active: userData.active,
              perfil: {
                imagem_url: userData.avatar || undefined,
                descricao: userData.description,
              },
            }}
          />

          {/* Informações Básicas */}
          <Card className="bg-[var(--bg-simple)] border border-[var(--border-color)]">
            <CardHeader>
              <CardTitle className="text-[var(--font-color)]">
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[var(--font-color)] opacity-70">
                  Nome
                </label>
                <p className="text-[var(--font-color)]">{userData.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--font-color)] opacity-70">
                  Email
                </label>
                <p className="text-[var(--font-color)]">{userData.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--font-color)] opacity-70">
                  Papel no Sistema
                </label>
                <p className="text-[var(--font-color)]">
                  {userData.role === "admin global" ? "Admin Global" : userData.role === "admin" ? "Admin" : "Membro"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--font-color)] opacity-70">
                  Descrição
                </label>
                <p className="text-[var(--font-color)]">
                  {userData.description || "Não informada"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--font-color)] opacity-70">
                  Status
                </label>
                <p
                  className={userData.active ? "text-green-600" : "text-red-600"}
                >
                  {userData.active ? "Ativo" : "Inativo"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Funções e Associações do Usuário */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Associações */}
          <Card className="bg-[var(--bg-simple)] border-[var(--border-color)]">
            <CardHeader>
              <CardTitle className="text-[var(--font-color)]">
                Associações
              </CardTitle>
              <CardDescription className="text-[var(--font-color)] opacity-70">
                Campus e organizações que o usuário faz parte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Campus */}
              {userData?.campusMembers && userData.campusMembers.length > 0 ? (
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

              {/* Organizações */}
              {userData?.organizationMembers &&
                userData.organizationMembers.length > 0 ? (
                <div>
                  <h4 className="font-medium text-[var(--font-color)] mb-2">
                    Organizações
                  </h4>
                  {userData.organizationMembers.map(
                    (member: any, index: number) => (
                      <div
                        key={index}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="text-[var(--font-color)] opacity-80">
                          {member.organization?.name}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs ${member.role === "admin"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                            }`}
                        >
                          {member.role === "admin" ? "Admin" : "Membro"}
                        </span>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div>
                  <h4 className="font-medium text-[var(--font-color)] mb-2">
                    Organizações
                  </h4>
                  <p className="text-sm text-[var(--font-color)] opacity-60">
                    Nenhuma organização associada
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comissões e Funções */}
          <Card className="bg-[var(--bg-simple)] border-[var(--border-color)]">
            <CardHeader>
              <CardTitle className="text-[var(--font-color)]">
                Funções em Comissões
              </CardTitle>
              <CardDescription className="text-[var(--font-color)] opacity-70">
                Comissões e roles do usuário
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {userData?.commissionMembers &&
                userData.commissionMembers.length > 0 ? (
                <div>
                  {userData.commissionMembers.map(
                    (member: any, index: number) => (
                      <div
                        key={index}
                        className="flex justify-between items-start text-sm border-b border-[var(--border-color)] pb-2 mb-2 last:border-b-0 last:pb-0 last:mb-0"
                      >
                        <div className="flex-1">
                          <div className="text-[var(--font-color)] font-medium">
                            {member.commission?.name}
                          </div>
                          <div className="text-[var(--font-color)] opacity-60 text-xs">
                            Campus: {member.commission?.campus?.name}
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs ml-2 ${member.roleInCommission === "Presidente"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
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
                  <p className="text-sm text-[var(--font-color)] opacity-60">
                    Nenhuma comissão associada
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={userData}
          onEditUser={handleEditUser}
          canEditGlobalAdminRole={canEditGlobalAdminRole}
          currentUserIsGlobalAdmin={isCurrentUserGlobalAdmin}
        />

        <DeleteUserDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          userName={userData.name || userData.email}
          onConfirm={handleDeleteUser}
        />
      </div>
    </>
  );
}
