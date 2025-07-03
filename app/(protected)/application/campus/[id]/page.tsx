"use client";

import LoadingScreen from "@/components/custom/loading";
import CampusModal from "@/components/manager-campuses/campus-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUserPermissions } from "@/hooks/use-user-permissions";
import type { Campus, Organization } from "@/interface";
import { Building2, Edit, Users } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CampusDetailPage() {
  const {
    user,
    canManageOrganizations,
    loading: permissionsLoading,
  } = useUserPermissions();
  const params = useParams();
  const router = useRouter();
  const campusId = params.id as string;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [campus, setCampus] = useState<Campus | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    if (!permissionsLoading && !canManageOrganizations) {
      router.push("/application");
    }
  }, [permissionsLoading, canManageOrganizations, router]);

  useEffect(() => {
    const fetchCampusData = async () => {
      try {
        // Buscar dados do campus
        const campusResponse = await fetch(`/api/campus?id=${campusId}`);
        const campusData = await campusResponse.json();

        if (campusResponse.ok && campusData) {
          setCampus(campusData);

          // Buscar dados da organização
          const orgResponse = await fetch(
            `/api/organization?id=${campusData.organizationId}`
          );
          const orgData = await orgResponse.json();

          if (orgResponse.ok) {
            setOrganization(orgData);
          }

          // Buscar membros do campus
          const membersResponse = await fetch(
            `/api/campus-member?campusId=${campusId}`
          );
          if (membersResponse.ok) {
            const membersData = await membersResponse.json();
            setMembers(membersData);
          }
        } else {
          setCampus(null);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do campus:", error);
        setCampus(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (campusId && canManageOrganizations) {
      fetchCampusData();
    }
  }, [campusId, canManageOrganizations]);

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
        setCampus(editedCampus);
        setIsModalOpen(false);
      } else {
        console.error("Erro ao atualizar campus");
      }
    } catch (error) {
      console.error("Erro ao atualizar campus:", error);
    }
  };

  if (permissionsLoading || isLoading) {
    return <LoadingScreen />;
  }

  if (!canManageOrganizations) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">Acesso negado</p>
        </CardContent>
      </Card>
    );
  }

  if (!campus) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">Campus não encontrado</p>
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
                {campus.name}
              </CardTitle>
              <CardDescription className="text-[var(--font-color)] opacity-70">
                {organization?.name || "Organização não encontrada"}
              </CardDescription>
            </div>
            <div className="flex gap-2">
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
              {members.slice(0, 6).map((member, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-[var(--bg-simple)] rounded-lg border border-[var(--border-color)]"
                >
                  <div className="w-8 h-8 bg-[var(--secondary-color)] rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-[var(--font-color)]">
                      {member.user?.name?.charAt(0) ||
                        member.user?.email?.charAt(0) ||
                        "?"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--font-color)] truncate">
                      {member.user?.name || member.user?.email || "Usuário"}
                    </p>
                    <p className="text-xs text-[var(--font-color)] opacity-70 truncate">
                      {member.role || "Membro"}
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

      <CampusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleEditCampus}
        onDelete={() => {}}
        campus={campus}
        mode="edit"
      />
    </div>
  );
}
