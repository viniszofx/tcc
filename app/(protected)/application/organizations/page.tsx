"use client";

import LoadingScreen from "@/components/custom/loading";
import OrganizationCard from "@/components/manager-organizations/organization-card";
import OrganizationModal from "@/components/manager-organizations/organization-modal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useCreateOrganization,
  useDeleteOrganization,
  useUpdateOrganization,
} from "@/hooks/mutations/use-mutations";
import { useOrganizations } from "@/hooks/queries/use-organizations-query";
import { useUserPermissions } from "@/hooks/use-user-permissions";
import { Organization } from "@/interface";
import { Plus, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OrganizationsPage() {
  const {
    user,
    canManageOrganizations,
    loading: permissionsLoading,
  } = useUserPermissions();
  const router = useRouter();

  // Usar React Query para buscar organizações
  const {
    data: orgs = [],
    isLoading: orgsLoading,
    error: orgsError,
    refetch: refetchOrgs,
  } = useOrganizations();

  // Mutations para operações CRUD
  const createOrganizationMutation = useCreateOrganization();
  const updateOrganizationMutation = useUpdateOrganization();
  const deleteOrganizationMutation = useDeleteOrganization();

  const [organizationMembers, setOrganizationMembers] = useState<
    Record<string, any[]>
  >({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);

  // Verificar permissões
  useEffect(() => {
    if (!permissionsLoading && !canManageOrganizations) {
      router.push("/application");
    }
  }, [permissionsLoading, canManageOrganizations, router]);

  // Buscar membros das organizações quando necessário
  useEffect(() => {
    if (orgs.length > 0) {
      const fetchAllMembers = async () => {
        const membersPromises = orgs.map(async (org: Organization) => {
          try {
            const membersResponse = await fetch(
              `/api/organization-member?organizationId=${org.id}`
            );
            const membersData = await membersResponse.json();
            return { orgId: org.id, members: membersData };
          } catch (error) {
            console.error(
              `Erro ao buscar membros da organização ${org.id}:`,
              error
            );
            return { orgId: org.id, members: [] };
          }
        });

        const membersResults = await Promise.all(membersPromises);
        const membersMap: Record<string, any[]> = {};
        membersResults.forEach(({ orgId, members }) => {
          membersMap[orgId] = members;
        });
        setOrganizationMembers(membersMap);
      };

      fetchAllMembers();
    }
  }, [orgs]);

  if (permissionsLoading || orgsLoading) {
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

  if (orgsError) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">
            Erro ao carregar organizações: {orgsError.message}
          </p>
          <Button onClick={() => refetchOrgs()} className="mt-2">
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleOpenModal = (mode: "create" | "edit", org?: Organization) => {
    setModalMode(mode);
    setCurrentOrg(org || null);
    setIsModalOpen(true);
  };

  const handleSaveAll = async () => {
    try {
      // Implementar lógica de salvamento se necessário
      console.log("Salvar alterações");
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  const handleCreateOrganization = async (
    orgData: Omit<Organization, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      await createOrganizationMutation.mutateAsync(orgData);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erro ao criar organização:", error);
      alert("Erro ao criar organização");
    }
  };

  const handleEditOrganization = async (
    id: string,
    orgData: Partial<Organization>
  ) => {
    try {
      await updateOrganizationMutation.mutateAsync({ id, ...orgData });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erro ao editar organização:", error);
      alert("Erro ao editar organização");
    }
  };

  // Função para verificar se uma organização pode ser deletada
  const canDeleteOrganization = (organizationId: string) => {
    // Não pode deletar se for a única organização do sistema
    if (orgs.length <= 1) {
      return false;
    }

    // Verificar se é o último admin da organização
    const members = organizationMembers[organizationId] || [];
    const adminMembers = members.filter(
      (member: any) => member.role === "admin"
    );

    // Se há apenas um admin e é o usuário atual, não pode deletar
    if (adminMembers.length === 1 && adminMembers[0]?.userId === user?.id) {
      return false;
    }

    return true;
  };

  const handleDeleteOrganization = async (id: string) => {
    try {
      await deleteOrganizationMutation.mutateAsync(id);
    } catch (error) {
      console.error("Erro ao deletar organização:", error);
      alert("Erro ao deletar organização");
    }
  };

  if (orgsLoading) {
    return <LoadingScreen />;
  }

  return (
    <Card className="w-full bg-[var(--bg-simple)] shadow-lg transition-all duration-300">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6">
        <div>
          <CardTitle className="text-2xl font-bold text-[var(--font-color)] md:text-3xl">
            Gerenciar Organizações
          </CardTitle>
          <CardDescription className="text-[var(--font-color)] opacity-70">
            Gerencie as organizações cadastradas no sistema.
          </CardDescription>
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <Button
            className="flex items-center gap-2 bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white"
            onClick={handleSaveAll}
          >
            <Save size={18} />
            Salvar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex justify-end">
          <Button
            onClick={() => handleOpenModal("create")}
            className="bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white transition-all w-full sm:w-auto"
          >
            <Plus size={18} />
            Nova Organização
          </Button>
        </div>

        {orgs.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {orgs.map((org) => (
              <OrganizationCard
                key={org.id}
                organization={org}
                onEdit={() => handleOpenModal("edit", org)}
                onDelete={() => handleDeleteOrganization(org.id)}
                disableDelete={!canDeleteOrganization(org.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[var(--font-color)] opacity-70 text-lg">
              Nenhuma organização cadastrada ainda.
            </p>
          </div>
        )}
      </CardContent>

      <OrganizationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        organization={currentOrg}
        onSave={
          modalMode === "create"
            ? handleCreateOrganization
            : (data) =>
                currentOrg && handleEditOrganization(currentOrg.id, data)
        }
      />
    </Card>
  );
}
