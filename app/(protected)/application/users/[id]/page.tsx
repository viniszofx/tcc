"use client";

import LoadingScreen from "@/components/custom/loading";
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
import { useUserPermissions } from "@/hooks/use-user-permissions";
import type { UserProfile } from "@/interface";
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
    if (!updatedUser.id) return;

    fetch(`/api/user/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedUser),
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

  if (error) {
    return (
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
    );
  }

  if (!userData) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">Usuário não encontrado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <Card className="bg-[var(--bg-simple)] shadow-lg border border-[var(--border-color)]">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold text-[var(--font-color)]">
                {userData.name || userData.email}
              </CardTitle>
              <CardDescription className="text-[var(--font-color)] opacity-70">
                Detalhes e configurações do usuário
              </CardDescription>
            </div>
            <div className="flex gap-2">
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
            papel: "Usuário",
            descricao: userData.description,
            active: userData.active,
            perfil: {
              imagem_url: userData.avatar || undefined,
              descricao: userData.description,
            },
          }}
        />
        <Card className="bg-[var(--bg-simple)] border border-[var(--border-color)]">
          <CardHeader>
            <CardTitle className="text-[var(--font-color)]">
              Detalhes do Usuário
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

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={userData}
        onEditUser={handleEditUser}
      />

      <DeleteUserDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        userName={userData.name || userData.email}
        onConfirm={handleDeleteUser}
      />
    </div>
  );
}
