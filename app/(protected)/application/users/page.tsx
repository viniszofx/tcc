"use client";

import LoadingScreen from "@/components/custom/loading";
import { PageTitle } from "@/components/custom/page-title";
import { AddUserModal } from "@/components/manager-users/add-user-modal";
import { EditUserModal } from "@/components/manager-users/edit-user-modal";
import { UserCreatedModal } from "@/components/manager-users/user-created-modal";
import { UserListCard } from "@/components/manager-users/user-list-card";
import { UserSearchCard } from "@/components/manager-users/user-search-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useCampuses,
  useCampusMembers,
} from "@/hooks/queries/use-campus-query";
import {
  useCreateUser,
  useDeleteUser,
  useUpdateUser,
  useUsers,
} from "@/hooks/queries/use-users-query";
import { useUserPermissions } from "@/hooks/use-user-permissions-rq";
import type { UserProfile } from "@/interface";
import { useCan } from "@/lib/permissions/hooks";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type UserWithCampus = UserProfile & {
  campusName?: string;
};

export default function UsersPage() {
  const { user, loading: userLoading, error: userError } = useUserPermissions();
  const router = useRouter();

  // Verificar permissões usando CASL
  const canReadUsers = useCan("read", "User");
  const canCreateUsers = useCan("create", "User");
  const canUpdateUsers = useCan("update", "User");
  const canDeleteUsers = useCan("delete", "User");

  // React Query hooks
  const {
    data: users = [],
    isLoading: usersLoading,
    error: usersError,
  } = useUsers();
  const { data: campuses = [], isLoading: campusesLoading } = useCampuses();
  const { data: campusMembers = [], isLoading: campusMembersLoading } =
    useCampusMembers();

  // Mutations
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUserCreatedModalOpen, setIsUserCreatedModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [createdUserData, setCreatedUserData] = useState<{
    email: string;
    tempPassword: string;
    name: string;
  } | null>(null);

  // Verificar permissões
  useEffect(() => {
    if (!userLoading && !canReadUsers) {
      router.push("/application");
    }
  }, [userLoading, canReadUsers, router]);

  // Processar usuários com informações de campus
  const usersWithCampus: UserWithCampus[] = useMemo(() => {
    return users.map((user: any) => {
      let campusName = "Sem campus";

      // Verificar se o usuário tem campusMembers diretos
      if (user.campusMembers && user.campusMembers.length > 0) {
        campusName = user.campusMembers[0].campus.name;
      }
      // Se não, verificar através das comissões
      else if (user.commissionMembers && user.commissionMembers.length > 0) {
        const firstCommission = user.commissionMembers[0];
        if (firstCommission.commission?.campus) {
          campusName = firstCommission.commission.campus.name;
        }
      }

      return {
        ...user,
        campusName,
      };
    });
  }, [users]);

  // Filtrar usuários
  const filteredUsers = useMemo(() => {
    return usersWithCampus.filter((user) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.description &&
          user.description.toLowerCase().includes(searchLower))
      );
    });
  }, [usersWithCampus, searchTerm]);

  // Verificar se o usuário atual é administrador global
  const isCurrentUserGlobalAdmin = useMemo(() => {
    const isGlobalAdmin =
      user?.organizationMembers?.some(
        (member: any) => member.role === "admin global"
      ) || false;

    return isGlobalAdmin;
  }, [user?.organizationMembers]);

  const handleAddUser = useCallback(
    async (
      userData: Partial<UserProfile> & {
        organizationId?: string;
        campusId?: string;
        organizationRole?: string;
      }
    ) => {
      try {
        const result = await createUserMutation.mutateAsync(userData);

        // Salvar dados do usuário criado para o modal
        setCreatedUserData({
          email: userData.email || "",
          tempPassword: result.tempPassword || "",
          name: userData.name || "",
        });

        // Fechar modal de adicionar e abrir modal de sucesso
        setIsAddModalOpen(false);
        setIsUserCreatedModalOpen(true);
      } catch (error) {
        console.error("Erro ao adicionar usuário:", error);
        alert("Erro inesperado ao criar usuário");
      }
    },
    [createUserMutation]
  );

  const handleEditClick = useCallback((user: UserProfile) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  }, []);

  const handleEditUser = useCallback(
    async (userData: Partial<UserProfile>) => {
      if (!selectedUser?.id) return;

      try {
        await updateUserMutation.mutateAsync({
          id: selectedUser.id,
          ...userData,
        });

        setIsEditModalOpen(false);
        setSelectedUser(null);
      } catch (error) {
        console.error("Erro ao editar usuário:", error);
        alert("Erro ao editar usuário");
      }
    },
    [selectedUser?.id, updateUserMutation]
  );

  const handleDeleteUser = useCallback(
    async (user: UserProfile) => {
      try {
        await deleteUserMutation.mutateAsync(user.id);

        // Mostrar mensagem de sucesso
        alert(
          `Usuário "${user.name}" e todas suas relações foram excluídos com sucesso.`
        );
      } catch (error) {
        console.error("Erro ao excluir usuário:", error);
        alert("Erro ao excluir usuário. Tente novamente.");
      }
    },
    [deleteUserMutation]
  );

  const handleRemoveFromCommission = useCallback(
    async (user: UserProfile, commissionId: string) => {
      try {
        const response = await fetch(
          `/api/commission-member/remove?userId=${user.id}&commissionId=${commissionId}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          const result = await response.json();
          alert(result.message);
          // Recarregar dados dos usuários
          // Note: react-query já fará isso automaticamente
        } else {
          const errorData = await response.json();
          alert(`Erro ao remover usuário da comissão: ${errorData.error}`);
        }
      } catch (error) {
        console.error("Erro ao remover usuário da comissão:", error);
        alert("Erro inesperado ao remover usuário da comissão");
      }
    },
    []
  );

  // Loading states
  const isLoading =
    userLoading || usersLoading || campusesLoading || campusMembersLoading;

  // Renderizações condicionais APÓS todos os hooks
  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!canReadUsers) {
    return <LoadingScreen />;
  }

  if (userError || usersError) {
    return (
      <>
        <PageTitle title="Erro - KDÊ" />
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">
              Erro: {userError || (usersError as Error)?.message}
            </p>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageTitle title="Gerenciar Usuários - KDÊ" />
      <Card className="w-full bg-[var(--bg-simple)] shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6">
          <div>
            <CardTitle className="text-2xl font-bold text-[var(--font-color)] md:text-3xl">
              Gerenciar Usuários
            </CardTitle>
            <CardDescription className="text-[var(--font-color)] opacity-70">
              Gerencie os usuários do sistema e suas permissões
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {canCreateUsers && (
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white transition-all w-full sm:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Usuário
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          <UserSearchCard searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <UserListCard
            users={filteredUsers}
            onEditUser={handleEditClick}
            onDeleteUser={canDeleteUsers ? handleDeleteUser : undefined}
          />
        </CardContent>

        <AddUserModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddUser={handleAddUser}
          canCreateGlobalAdmin={isCurrentUserGlobalAdmin}
        />

        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onEditUser={handleEditUser}
          canEditGlobalAdminRole={isCurrentUserGlobalAdmin}
          currentUserIsGlobalAdmin={isCurrentUserGlobalAdmin}
        />

        {createdUserData && (
          <UserCreatedModal
            isOpen={isUserCreatedModalOpen}
            onClose={() => {
              setIsUserCreatedModalOpen(false);
              setCreatedUserData(null);
            }}
            userEmail={createdUserData.email}
            tempPassword={createdUserData.tempPassword}
            userName={createdUserData.name}
          />
        )}
      </Card>
    </>
  );
}
