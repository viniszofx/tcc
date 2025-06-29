"use client";

import LoadingScreen from "@/components/custom/loading";
import { DeleteUserDialog } from "@/components/manager-users/delete-user-dialog";
import { EditUserModal } from "@/components/manager-users/edit-user-modal";
import { UserDetailsCard } from "@/components/manager-users/user-details-card";
import { UserProfileCard } from "@/components/manager-users/user-profile-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Campus, UserProfile } from "@/interface";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UserDetailsPage() {
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

            const userWithCampus = {
              ...userData,
              campusName: userCampus ? userCampus.name : "Sem campus associado",
            };
            setUserData(userWithCampus);
          } else {
            setUserData(null);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  const handleDeleteUser = () => {
    router.push("/admin/users");
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
        // Recarregar dados do usuário
        window.location.reload();
      } else {
        console.error("Erro ao atualizar usuário");
      }
    } catch (error) {
      console.error("Erro ao editar usuário:", error);
    }
    setIsEditModalOpen(false);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!userData) {
    return (
      <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-lg transition-all duration-300">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <div className="text-xl text-[var(--font-color)]">
            Usuário não encontrado
          </div>
          <Button
            className="mt-4 bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-lg transition-all duration-300">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <CardTitle className="text-xl font-bold text-[var(--font-color)] md:text-2xl">
            Detalhes do Usuário
          </CardTitle>
          <CardDescription className="text-[var(--font-color)] opacity-70">
            Visualize e gerencie as informações do usuário
          </CardDescription>
        </div>
        <Button
          variant="outline"
          className="border-[var(--border-color)] bg-[var(--bg-simple)] hover:bg-[var(--hover-color)] hover:text-white w-full sm:w-auto"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </CardHeader>

      <CardContent className="flex flex-col gap-6 p-6">
        <UserProfileCard
          usuario={{
            nome: userData.name,
            papel: "Usuário",
            active: userData.active,
            descricao: userData.description || "",
            perfil: {
              imagem_url: userData.avatar || "/logo.svg",
              descricao: userData.description || "",
            },
          }}
        />

        <UserDetailsCard
          usuario={{
            usuario_id: userData.id,
            email: userData.email,
            campus_id: "",
            papel: "Usuário",
            campusName: (userData as any).campusName || "Sem campus associado",
          }}
        />
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row sm:justify-between gap-2 p-6 pt-0">
        <Button
          variant="outline"
          className="border-[var(--border-color)] bg-[var(--bg-simple)] hover:bg-[var(--button-2-color)] hover:text-white w-full sm:w-auto"
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Excluir Usuário
        </Button>

        <Button
          className="bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white w-full sm:w-auto"
          onClick={() => setIsEditModalOpen(true)}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Editar Usuário
        </Button>
      </CardFooter>

      <DeleteUserDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteUser}
        userName={userData.name}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={userData}
        onEditUser={handleEditUser}
        campusList={campuses}
      />
    </Card>
  );
}
