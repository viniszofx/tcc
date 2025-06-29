"use client";

import LoadingScreen from "@/components/custom/loading";
import OrganizationModal from "@/components/manager-organizations/organization-modal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Organization } from "@/interface";
import { ArrowLeft, Edit } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OrganizationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [organization, setOrganization] = useState<Organization | null>(null);

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const response = await fetch(`/api/organization?id=${orgId}`);
        const data = await response.json();

        if (response.ok && data) {
          setOrganization(data);
        } else {
          setOrganization(null);
        }
      } catch (error) {
        console.error("Erro ao buscar organização:", error);
        setOrganization(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganization();
  }, [orgId]);

  const handleSave = async (updatedOrg: Organization) => {
    try {
      const response = await fetch("/api/organization", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedOrg),
      });

      if (response.ok) {
        const newOrgData = await response.json();
        setOrganization(newOrgData);
        setIsModalOpen(false);
      } else {
        console.error("Erro ao atualizar organização");
      }
    } catch (error) {
      console.error("Erro ao atualizar organização:", error);
    }
  };

  if (!organization) {
    return (
      <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-lg transition-all duration-300 lg:max-w-5xl xl:max-w-6xl mx-auto mt-12">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <h2 className="text-xl font-bold text-[var(--font-color)]">
            Organização não encontrada
          </h2>
          <p className="text-muted-foreground mt-2">
            Organização com ID: {orgId} não foi encontrada
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/admin/organizations")}
          >
            Voltar para lista de organizações
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-lg transition-all duration-300 lg:max-w-5xl xl:max-w-6xl mx-auto mt-12">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-[var(--font-color)]">
                {organization.name}
              </CardTitle>
              <CardDescription className="text-[var(--font-color)]">
                Sigla: {organization.shortName}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="text-[var(--font-color)] transition-all"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <Button
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white transition-all"
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="font-medium text-[var(--font-color)]">
                ID da Organização
              </h3>
              <p className="text-sm text-[var(--font-color)]">
                {organization.id}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-[var(--font-color)]">Status</h3>
              <p className="text-sm text-[var(--font-color)]">
                {organization.active ? "Ativa" : "Inativa"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <OrganizationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        organization={organization}
        mode="edit"
      />
    </>
  );
}
