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
import data from "@/data/new-db.json";
import { getCampusByUser, getCampuses } from "@/lib/data-service";
import type { Campus, CampusMember, UserProfile } from "@/lib/new-interface";
import { ArrowLeft, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [campusMembers, setCampusMembers] = useState<CampusMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadedCampuses = getCampuses();
    setCampuses(loadedCampuses);

    const loadedUsers = data.user_profiles.map((user) => {
      const userCampus = getCampusByUser(user.id);
      return {
        ...user,
        campusName: userCampus ? userCampus.name : "Sem campus associado",
        profile: user.profile || { description: "", image: "/logo.svg" },
      };
    });

    setUsers(loadedUsers);
    setCampusMembers(data.campus_members || []);
    setIsLoading(false);
  }, []);

  const filteredUsers = users.filter((usuario: UserProfile) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      usuario.name.toLowerCase().includes(searchLower) ||
      usuario.email.toLowerCase().includes(searchLower) ||
      (usuario.campusName?.toLowerCase().includes(searchLower) ?? false) ||
      (usuario.active ? "ativo" : "inativo").includes(searchLower) ||
      usuario.id.includes(searchLower)
    );
  });

  const handleAddUser = (
    newUser: Partial<UserProfile> & { campusId?: string }
  ) => {
    const userId = uuidv4();
    const userToAdd: UserProfile = {
      id: userId,
      name: newUser.name || "",
      email: newUser.email || "",
      active: newUser.active !== undefined ? newUser.active : true,
      profile: {
        description: newUser.profile?.description || "",
        image: newUser.profile?.image || "/logo.svg",
      },
    };

    let campusName = "Sem campus associado";
    if (newUser.campusId) {
      const selectedCampus = campuses.find((c) => c.id === newUser.campusId);
      campusName = selectedCampus
        ? selectedCampus.name
        : "Sem campus associado";
    }

    const userWithCampus = {
      ...userToAdd,
      campusName,
    };

    setUsers([...users, userWithCampus]);
  };

  const handleEditUser = (updatedUser: Partial<UserProfile>) => {
    setUsers(
      users.map((user) =>
        user.id === updatedUser.id ? { ...user, ...updatedUser } : user
      )
    );
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
