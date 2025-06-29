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
import { Organization } from "@/interface";
import { ArrowLeft, Plus, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OrganizationsPage() {
  const router = useRouter();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

    fetchOrganizations();
  }, []);

  const handleOpenModal = (mode: "create" | "edit", org?: Organization) => {
    setModalMode(mode);
    setCurrentOrg(org || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentOrg(null);
  };

  const handleSave = async (org: Organization) => {
    try {
      if (modalMode === "create") {
        const response = await fetch("/api/organization", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(org),
        });

        if (response.ok) {
          const newOrg = await response.json();
          setOrgs([...orgs, newOrg]);
        } else {
          console.error("Erro ao criar organização");
        }
      } else if (modalMode === "edit" && currentOrg) {
        const response = await fetch("/api/organization", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...org, id: currentOrg.id }),
        });

        if (response.ok) {
          const updatedOrg = await response.json();
          setOrgs(orgs.map((o) => (o.id === currentOrg.id ? updatedOrg : o)));
        } else {
          console.error("Erro ao atualizar organização");
        }
      }
    } catch (error) {
      console.error("Erro ao salvar organização:", error);
    }
    handleCloseModal();
  };

  const handleDelete = async (orgId: string) => {
    try {
      const response = await fetch(`/api/organization?id=${orgId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setOrgs(orgs.filter((o) => o.id !== orgId));
      } else {
        console.error("Erro ao deletar organização");
      }
    } catch (error) {
      console.error("Erro ao deletar organização:", error);
    }
  };

  const handleSaveAll = () => {
    alert("Salvo com sucesso!");
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-6 py-6">
      <Card className="w-full bg-[var(--bg-simple)] shadow-lg transition-all duration-300">
        <CardHeader className="pb-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-[var(--font-color)]">
              Organizações
            </CardTitle>
            <CardDescription className="text-[var(--font-color)] opacity-70">
              Gerencie as organizações cadastradas no sistema.
            </CardDescription>
          </div>
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => router.back()}
            >
              <ArrowLeft size={18} />
              Voltar
            </Button>
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
          <div className="grid gap-6 md:grid-cols-2">
            {orgs.map((org) => (
              <OrganizationCard
                key={org.id}
                organization={org}
                onEdit={() => handleOpenModal("edit", org)}
                onDelete={() => handleDelete(org.id)}
                disableDelete={orgs.length === 1}
              />
            ))}
          </div>
        </CardContent>
        <OrganizationModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSave}
          organization={currentOrg}
          mode={modalMode}
        />
      </Card>
    </div>
  );
}
