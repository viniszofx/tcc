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
import { useUserPermissions } from "@/hooks/use-user-permissions";
import type { Campus, UserProfile } from "@/interface";
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

  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!permissionsLoading && !canManageUsers) {
      router.push("/application");
    }
  }, [permissionsLoading, canManageUsers, router]);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Buscar usuário específico
        const userResponse = await fetch(`/api/user?id=${id}`);
        const userData = await userResponse.json();

        // Buscar campus
        const campusesResponse = await fetch("/api/campus");
        const campusesData = await campusesResponse.json();

        // Buscar membros de campus
        const campusMembersResponse = await fetch("/api/campus-member");
        const campusMembersData = await campusMembersResponse.json();

        // Buscar organizações
        const organizationsResponse = await fetch("/api/organization");
        const organizationsData = await organizationsResponse.json();

        // Buscar membros de organizações
        const organizationMembersResponse = await fetch(
          "/api/organization-member"
        );
        const organizationMembersData =
          await organizationMembersResponse.json();

        // Mapear campus associados ao usuário
        const userCampuses = campusMembersData
          .filter((member: any) => member.userId === id)
          .map((member: any) =>
            campusesData.find((campus: Campus) => campus.id === member.campusId)
          )
          .filter(Boolean);

        // Mapear organizações associadas ao usuário
        const userOrganizations = organizationMembersData
          .filter((member: any) => member.userId === id)
          .map((member: any) =>
            organizationsData.find(
              (org: any) => org.id === member.organizationId
            )
          )
          .filter(Boolean);

        setUserData({
          ...userData,
          campuses: userCampuses,
          organizations: userOrganizations,
        });
        setCampuses(campusesData);
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id && canManageUsers) {
      fetchUserData();
    }
  }, [id, canManageUsers]);

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
          setUserData((prev) => (prev ? { ...prev, ...updatedUser } : null));
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

  if (permissionsLoading || loading) {
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
        campusList={campuses}
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
