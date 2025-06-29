"use client";

import LoadingScreen from "@/components/custom/loading";
import { AddUserModal } from "@/components/manager-users/add-user-modal";
import { EditUserModal } from "@/components/manager-users/edit-user-modal";
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
import type { Campus, CampusMember, UserProfile } from "@/interface";
import { ArrowLeft, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type UserWithCampus = UserProfile & {
  campusName?: string;
};

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserWithCampus[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [campusMembers, setCampusMembers] = useState<CampusMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar usuários
        const usersResponse = await fetch("/api/user");
        const usersData = await usersResponse.json();

        // Buscar campus
        const campusesResponse = await fetch("/api/campus");
        const campusesData = await campusesResponse.json();

        // Buscar membros de campus
        const campusMembersResponse = await fetch("/api/campus-member");
        const campusMembersData = await campusMembersResponse.json();

        if (
          usersResponse.ok &&
          campusesResponse.ok &&
          campusMembersResponse.ok
        ) {
          setCampuses(campusesData);
          setCampusMembers(campusMembersData);

          // Mapear usuários com seus campus
          const usersWithCampus = usersData.map((user: UserProfile) => {
            const userCampusMember = campusMembersData.find(
              (cm: CampusMember) => cm.userId === user.id
            );
            const userCampus = userCampusMember
              ? campusesData.find(
                  (c: Campus) => c.id === userCampusMember.campusId
                )
              : null;

            return {
              ...user,
              campusName: userCampus ? userCampus.name : "Sem campus associado",
            };
          });

          setUsers(usersWithCampus);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredUsers = users.filter((usuario: UserWithCampus) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      usuario.name.toLowerCase().includes(searchLower) ||
      usuario.email.toLowerCase().includes(searchLower) ||
      (usuario.campusName?.toLowerCase().includes(searchLower) ?? false) ||
      (usuario.active ? "ativo" : "inativo").includes(searchLower) ||
      usuario.id.includes(searchLower)
    );
  });

  const handleAddUser = async (
    newUser: Partial<UserProfile> & { campusId?: string }
  ) => {
    try {
      // Criar o usuário
      const userToAdd = {
        name: newUser.name || "",
        email: newUser.email || "",
        description: newUser.description || "",
        avatar: newUser.avatar || "/logo.svg",
        active: newUser.active !== undefined ? newUser.active : true,
      };

      const userResponse = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userToAdd),
      });

      if (userResponse.ok) {
        const createdUser = await userResponse.json();

        // Se foi especificado um campus, criar a associação
        if (newUser.campusId) {
          const campusMemberData = {
            userId: createdUser.id,
            campusId: newUser.campusId,
          };

          await fetch("/api/campus-member", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(campusMemberData),
          });
        }

        // Recarregar a lista de usuários
        window.location.reload();
      } else {
        console.error("Erro ao criar usuário");
      }
    } catch (error) {
      console.error("Erro ao adicionar usuário:", error);
    }
  };

  const handleEditUser = async (updatedUser: Partial<UserProfile>) => {
    try {
      const response = await fetch("/api/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUser),
      });

      if (response.ok) {
        // Recarregar a lista de usuários
        window.location.reload();
      } else {
        console.error("Erro ao atualizar usuário");
      }
    } catch (error) {
      console.error("Erro ao editar usuário:", error);
    }
  };

  const handleEditClick = (user: UserProfile) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-lg transition-all duration-300 lg:max-w-5xl xl:max-w-6xl">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <CardTitle className="text-xl font-bold text-[var(--font-color)] md:text-2xl lg:text-3xl">
            Gerenciamento de Usuários
          </CardTitle>
          <CardDescription className="text-[var(--font-color)] opacity-70">
            Gerencie os usuários do sistema
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin")}
            className="text-[var(--font-color)] transition-all"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white transition-all w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Usuário
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <UserSearchCard searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <UserListCard
          users={filteredUsers}
          onEditUser={handleEditClick}
          campus={campuses}
        />
      </CardContent>

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddUser={handleAddUser}
        campusList={campuses}
      />

      {selectedUser && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={selectedUser}
          onEditUser={handleEditUser}
          campusList={campuses}
        />
      )}
    </Card>
  );
}
