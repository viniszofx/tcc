"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, ArrowLeft, Save } from "lucide-react";
import data from "@/data/db.json";
import OrganizationCard from "@/components/manager-organizations/organization-card";
import OrganizationModal from "@/components/manager-organizations/organization-modal";

interface Organization {
  id: string;
  name: string;
  shortName: string;
  active?: boolean;
}

export default function OrganizationsPage() {
  const router = useRouter();
  const initialOrgs: Organization[] = (data.organizations || []).map((org: any) => ({
    ...org,
  }));

  const [orgs, setOrgs] = useState<Organization[]>(initialOrgs);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);

  const handleOpenModal = (mode: "create" | "edit", org?: Organization) => {
    setModalMode(mode);
    setCurrentOrg(org || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentOrg(null);
  };

  const handleSave = (org: Organization) => {
    if (modalMode === "create") {
      setOrgs([
        ...orgs,
        {
          ...org,
          id: `${Date.now()}`,
          active: true,
        },
      ]);
    } else if (modalMode === "edit" && currentOrg) {
      setOrgs(
        orgs.map((o) => (o.id === currentOrg.id ? { ...org, id: currentOrg.id } : o))
      );
    }
    handleCloseModal();
  };

  const handleDelete = (orgId: string) => {
    setOrgs(orgs.filter((o) => o.id !== orgId));
  };

  const handleSaveAll = () => {
    alert("Salvo com sucesso!");
  };

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
              className="bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white transition-all"
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
