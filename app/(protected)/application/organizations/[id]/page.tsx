"use client";

import LoadingScreen from "@/components/custom/loading";
import { PageTitle } from "@/components/custom/page-title";
import OrganizationModal from "@/components/manager-organizations/organization-modal";
import AddOrganizationMemberModal from "@/components/members/add-organization-member-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useOrganizationDetailData } from "@/hooks/queries/use-page-data";
import { useUserPermissions } from "@/hooks/use-consolidated-user";
import { useOrganizationPermissions } from "@/lib/permissions/hooks";
import type { Organization } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, Edit, MapPin, Users, UserPlus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function OrganizationDetailPage() {
  const {
    user,
    loading: permissionsLoading,
  } = useUserPermissions();
  const { canManageOrganizations } = useOrganizationPermissions();
  const params = useParams();
  const router = useRouter();
  const organizationId = params.id as string;

  // Usar hook otimizado para buscar dados da organização
  const {
    organization,
    campuses,
    members,
    isLoading,
    isLoadingCampuses,
    isLoadingMembers,
    error,
    refetch,
  } = useOrganizationDetailData(organizationId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  useEffect(() => {
    if (!permissionsLoading && !canManageOrganizations) {
      router.push("/application");
    }
  }, [permissionsLoading, canManageOrganizations, router]);

  const handleEditOrganization = async (editedOrganization: Organization) => {
    try {
      const response = await fetch(`/api/organization/${organizationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedOrganization),
      });

      if (response.ok) {
        // Invalidar cache para recarregar dados
        refetch();
        setIsModalOpen(false);
      } else {
        console.error("Erro ao atualizar organização");
      }
    } catch (error) {
      console.error("Erro ao atualizar organização:", error);
    }
  };

  const handleAddMember = async (userId: string, role: string) => {
    try {
      const response = await fetch("/api/organization-member", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          organizationId,
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

  if (!organization) {
    return (
      <>
        <PageTitle title="Organização não encontrada - KDÊ" />
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">Organização não encontrada</p>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageTitle title="Detalhes da Organização - KDÊ" />
      <div className="space-y-6">
        {/* Header com ações */}
        <Card className="bg-[var(--bg-simple)] shadow-lg border border-[var(--border-color)]">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold text-[var(--font-color)]">
                  {organization.name}
                </CardTitle>
                <CardDescription className="text-[var(--font-color)] opacity-70">
                  {organization.shortName}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {/* Botão para adicionar membros - apenas para admins */}
                {(user?.role === "admin global" || 
                  user?.role === "admin" || 
                  members.some((member: any) => member.userId === user?.id && member.role === "admin")) && (
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
                  <span className="hidden sm:inline">Editar Organização</span>
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Informações da Organização */}
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
                  Nome Completo
                </label>
                <p className="text-[var(--font-color)]">{organization.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--font-color)] opacity-70">
                  Nome Abreviado
                </label>
                <p className="text-[var(--font-color)]">
                  {organization.shortName}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--font-color)] opacity-70">
                  Status
                </label>
                <div className="flex items-center gap-2">
                  <Badge variant={organization.active ? "default" : "secondary"}>
                    {organization.active ? "Ativa" : "Inativa"}
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
                  Total de Campus
                </span>
                <span className="font-semibold text-[var(--font-color)]">
                  {campuses.length}
                </span>
              </div>
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
                  ID da Organização
                </span>
                <span className="font-mono text-sm text-[var(--font-color)] opacity-70">
                  {organization.id}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campus da Organização */}
        {campuses.length > 0 && (
          <Card className="bg-[var(--bg-simple)] border border-[var(--border-color)]">
            <CardHeader>
              <CardTitle className="text-[var(--font-color)] flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Campus ({campuses.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {campuses.map((campus) => (
                  <div
                    key={campus.id}
                    className="flex items-center justify-between p-4 bg-[var(--bg-simple)] rounded-lg border border-[var(--border-color)] hover:bg-[var(--hover-3-color)] transition-colors"
                  >
                    <div>
                      <h3 className="font-semibold text-[var(--font-color)]">
                        {campus.name}
                      </h3>
                      <p className="text-sm text-[var(--font-color)] opacity-70">
                        {campus.code}
                      </p>
                    </div>
                    <Badge variant={campus.active ? "default" : "secondary"}>
                      {campus.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Membros da Organização */}
        {members.length > 0 && (
          <Card className="bg-[var(--bg-simple)] border border-[var(--border-color)]">
            <CardHeader>
              <CardTitle className="text-[var(--font-color)] flex items-center gap-2">
                <Users className="w-5 h-5" />
                Membros da Organização ({members.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {members.slice(0, 6).map((member: any, index: number) => (
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
                          "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--font-color)] truncate">
                        {member.user?.name || member.user?.email || "Usuário"}
                      </p>
                      <p className="text-xs text-[var(--font-color)] opacity-70 truncate">
                        {member.role === "admin" ? "Administrador" : "Membro"}
                      </p>
                    </div>
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

        {/* Modal de Edição */}
        <OrganizationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleEditOrganization}
          organization={organization}
          mode="edit"
        />

        {/* Modal de Adicionar Membro */}
        <AddOrganizationMemberModal
          isOpen={isAddMemberModalOpen}
          onClose={() => setIsAddMemberModalOpen(false)}
          onSave={handleAddMember}
          organizationId={organizationId}
          currentMembers={members.map((member: any) => member.userId)}
        />
      </div>
    </>
  );
}
