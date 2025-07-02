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
import { useUserPermissions } from "@/hooks/use-user-permissions";
import { Organization } from "@/interface";
import { Plus, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OrganizationsPage() {
  const { canManageOrganizations, loading, error } = useUserPermissions();
  const router = useRouter();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar permissões
  useEffect(() => {
    if (!loading && !canManageOrganizations) {
      router.push("/application");
    }
  }, [loading, canManageOrganizations, router]);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch("/api/organization");
        const data = await response.json();

        if (response.ok) {
          setOrgs(data);
        } else {
          console.error("Erro ao buscar organizações:", data);
        }
      } catch (error) {
        console.error("Erro ao buscar organizações:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (canManageOrganizations) {
      fetchOrganizations();
    }
  }, [canManageOrganizations]);

  if (loading || !canManageOrganizations) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">Erro: {error}</p>
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
      const response = await fetch("/api/organization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orgData),
      });

      if (response.ok) {
        const newOrg = await response.json();
        setOrgs([...orgs, newOrg]);
        setIsModalOpen(false);
      } else {
        console.error("Erro ao criar organização");
      }
    } catch (error) {
      console.error("Erro ao criar organização:", error);
    }
  };

  const handleEditOrganization = async (
    id: string,
    orgData: Partial<Organization>
  ) => {
    try {
      const response = await fetch("/api/organization", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, ...orgData }),
      });

      if (response.ok) {
        const updatedOrg = await response.json();
        setOrgs(orgs.map((org) => (org.id === id ? updatedOrg : org)));
        setIsModalOpen(false);
      } else {
        console.error("Erro ao editar organização");
      }
    } catch (error) {
      console.error("Erro ao editar organização:", error);
    }
  };

  const handleDeleteOrganization = async (id: string) => {
    try {
      const response = await fetch("/api/organization", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setOrgs(orgs.filter((org) => org.id !== id));
      } else {
        console.error("Erro ao deletar organização");
      }
    } catch (error) {
      console.error("Erro ao deletar organização:", error);
    }
  };

  if (isLoading) {
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
