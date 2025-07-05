"use client";

import LoadingScreen from "@/components/custom/loading";
import { PageTitle } from "@/components/custom/page-title";
import CampusModal from "@/components/manager-campuses/campus-modal";
import AddCampusMemberModal from "@/components/members/add-campus-member-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCampusDetailData } from "@/hooks/queries/use-page-data";
import { useUserPermissions } from "@/hooks/use-consolidated-user";
import type { Campus } from "@/types";
import { Building2, Edit, Trash2, UserPlus, Users } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CampusDetailPage() {
  const {
    user,
    canManageOrganizations,
    loading: permissionsLoading,
  } = useUserPermissions();
  const params = useParams();
  const router = useRouter();
  const campusId = params.id as string;

  // Usar hook otimizado para buscar dados do campus
  const { campus, organization, members, isLoading, error, refetch } =
    useCampusDetailData(campusId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  useEffect(() => {
    if (!permissionsLoading && !canManageOrganizations) {
      router.push("/application");
    }
  }, [permissionsLoading, canManageOrganizations, router]);

  const handleEditCampus = async (editedCampus: Campus) => {
    try {
      const response = await fetch(`/api/campus/${campusId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedCampus),
      });

      if (response.ok) {
        // Invalidar cache para recarregar dados
        refetch();
        setIsModalOpen(false);
      } else {
        console.error("Erro ao atualizar campus");
      }
    } catch (error) {
      console.error("Erro ao atualizar campus:", error);
    }
  };

  const handleAddMember = async (userId: string, role: string) => {
    try {
      const response = await fetch("/api/campus-member", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          campusId,
          role,
        }),
      });

      if (response.ok) {
        toast.success("Membro adicionado com sucesso!");
        refetch();
        setIsAddMemberModalOpen(false);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Erro ao adicionar membro");
      }
    } catch (error) {
      console.error("Erro ao adicionar membro:", error);
      toast.error("Erro ao adicionar membro");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      const response = await fetch(
        `/api/campus-member?userId=${userId}&campusId=${campusId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao remover membro");
      }

      toast.success("Membro removido com sucesso!");
      refetch(); // Atualiza os dados
    } catch (error) {
      console.error("Erro ao remover membro:", error);
      toast.error("Erro ao remover membro");
    }
  };

  if (permissionsLoading || isLoading) {
    return <LoadingScreen />;
  }

  if (!canManageOrganizations) {
    return (
      <>
        <PageTitle title="Acesso negado - KDÊ" />
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">Acesso negado</p>
          </CardContent>
        </Card>
      </>
    );
  }

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

  if (!campus) {
    return (
      <>
        <PageTitle title="Campus nao encontrado - KDÊ" />
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">Campus não encontrado</p>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageTitle title="Deatlhes do Campus - KDÊ" />
      <div className="space-y-6">
        {/* Header com ações */}
        <Card className="bg-[var(--bg-simple)] shadow-lg border border-[var(--border-color)]">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold text-[var(--font-color)]">
                  {campus.name}
                </CardTitle>
                <CardDescription className="text-[var(--font-color)] opacity-70">
                  {organization?.name || "Organização não encontrada"}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {/* Botão para adicionar membros - apenas para admins */}
                {(user?.role === "admin global" ||
                  user?.role === "admin" ||
                  members.some(
                    (member: any) =>
                      member.userId === user?.id && member.role === "admin"
                  )) && (
                  <Button
                    onClick={() => setIsAddMemberModalOpen(true)}
                    variant="outline"
                    className="border-[var(--border-color)] text-[var(--font-color)] hover:bg-[var(--hover-3-color)] px-4 py-2 text-base sm:px-2 sm:py-1 sm:text-sm"
                  >
                    <UserPlus className="w-4 h-4 mr-0 sm:mr-2" />
                    <span className="hidden sm:inline">Adicionar Membro</span>
                  </Button>
                )}
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] px-4 py-2 text-base sm:px-2 sm:py-1 sm:text-sm"
                >
                  <Edit className="w-4 h-4 mr-0 sm:mr-2" />
                  <span className="hidden sm:inline">Editar Campus</span>
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Informações do Campus */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-[var(--bg-simple)] border border-[var(--border-color)]">
            <CardHeader>
              <CardTitle className="text-[var(--font-color)] flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[var(--font-color)] opacity-70">
                  Nome
                </label>
                <p className="text-[var(--font-color)]">{campus.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--font-color)] opacity-70">
                  Status
                </label>
                <div className="flex items-center gap-2">
                  <Badge variant={campus.active ? "default" : "secondary"}>
                    {campus.active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[var(--bg-simple)] border border-[var(--border-color)]">
            <CardHeader>
              <CardTitle className="text-[var(--font-color)] flex items-center gap-2">
                <Users className="w-5 h-5" />
                Estatísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-[var(--font-color)] opacity-70">
                  Total de Membros
                </span>
                <span className="font-semibold text-[var(--font-color)]">
                  {members.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--font-color)] opacity-70">
                  Organização
                </span>
                <span className="font-semibold text-[var(--font-color)]">
                  {organization?.shortName || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--font-color)] opacity-70">
                  ID do Campus
                </span>
                <span className="font-mono text-sm text-[var(--font-color)] opacity-70">
                  {campus.id}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Organização Associada */}
        {organization && (
          <Card className="bg-[var(--bg-simple)] border border-[var(--border-color)]">
            <CardHeader>
              <CardTitle className="text-[var(--font-color)] flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Organização Associada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-[var(--bg-simple)] rounded-lg border border-[var(--border-color)]">
                <div>
                  <h3 className="font-semibold text-[var(--font-color)]">
                    {organization.name}
                  </h3>
                  <p className="text-sm text-[var(--font-color)] opacity-70">
                    {organization.shortName}
                  </p>
                </div>
                <Badge variant={organization.active ? "default" : "secondary"}>
                  {organization.active ? "Ativa" : "Inativa"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Membros do Campus */}
        {members.length > 0 && (
          <Card className="bg-[var(--bg-simple)] border border-[var(--border-color)]">
            <CardHeader>
              <CardTitle className="text-[var(--font-color)] flex items-center gap-2">
                <Users className="w-5 h-5" />
                Membros do Campus ({members.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {members.slice(0, 6).map((member: any, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-[var(--bg-simple)] rounded-lg border border-[var(--border-color)]"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={member.user?.avatar || "/placeholder.svg"}
                        alt={member.user?.name || "Usuário"}
                      />
                      <AvatarFallback>
                        {member.user?.name?.charAt(0) ||
                          member.user?.email?.charAt(0) ||
                          member.name?.charAt(0) ||
                          member.email?.charAt(0) ||
                          "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--font-color)] truncate">
                        {member.user?.name ||
                          member.user?.email ||
                          member.name ||
                          member.email ||
                          "Usuário"}
                      </p>
                      <p className="text-xs text-[var(--font-color)] opacity-70 truncate">
                        {member.role === "admin" ? "Administrador" : "Membro"}
                      </p>
                    </div>
                    {/* Botão para remover membro - apenas para admins */}
                    {(user?.role === "admin global" ||
                      user?.role === "admin" ||
                      members.some(
                        (m: any) => m.userId === user?.id && m.role === "admin"
                      )) && (
                      <Button
                        onClick={() => handleRemoveMember(member.userId)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-8 w-8"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {members.length > 6 && (
                  <div className="flex items-center justify-center p-3 bg-[var(--bg-simple)] rounded-lg border border-dashed border-[var(--border-color)]">
                    <span className="text-sm text-[var(--font-color)] opacity-70">
                      +{members.length - 6} mais
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <CampusModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleEditCampus}
          onDelete={() => {}}
          campus={campus}
          mode="edit"
        />

        {/* Modal de Adicionar Membro */}
        <AddCampusMemberModal
          isOpen={isAddMemberModalOpen}
          onClose={() => setIsAddMemberModalOpen(false)}
          onSave={handleAddMember}
          campusId={campusId}
          currentMembers={members.map((member: any) => member.userId)}
        />
      </div>
    </>
  );
}
