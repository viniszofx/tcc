"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";
import data from "@/data/db.json";
import OrganizationModal from "@/components/manager-organizations/orgs-modal";

interface Organization {
  id: string;
  name: string;
  shortName: string;
  active?: boolean;
}

export default function OrganizationsPage() {
  // Carrega do db.json
  const initialOrgs: Organization[] = (data.organizations || []).map((org: any) => ({
    ...org,
  }));

  const [orgs, setOrgs] = useState<Organization[]>(initialOrgs);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAdd = (org: { name: string; shortName: string }) => {
    setOrgs([
      ...orgs,
      {
        id: `${Date.now()}`,
        name: org.name,
        shortName: org.shortName,
        active: true,
      },
    ]);
    setIsModalOpen(false);
  };

  return (
    <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-lg transition-all duration-300 lg:max-w-5xl xl:max-w-6xl">
      <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <CardTitle className="text-xl font-bold text-[var(--font-color)] md:text-2xl lg:text-3xl">
            Organizações
          </CardTitle>
          <CardDescription className="text-[var(--font-color)] opacity-70">
            Gerencie as organizações cadastradas no sistema.
          </CardDescription>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white transition-all w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Organização
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid gap-6 md:grid-cols-2">
          {orgs.map((org) => (
            <Card key={org.id} className="border border-[var(--border-color)] bg-[var(--bg-simple)]">
              <CardHeader>
                <CardTitle className="text-[var(--font-color)]">{org.name}</CardTitle>
                <CardDescription className="text-[var(--font-color)]">Sigla: {org.shortName}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Link
                  href={`/admin/organizations/${org.id}`}
                  className="w-full"
                >
                  <Button className="w-full text-[var(--font-color2)] bg-[var(--button-color)] transition-all hover:bg-[var(--hover-3-color)] hover:text-white">
                    Ver Organização
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </CardContent>
      <OrganizationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAdd}
        organization={null}
        mode="create"
      />
    </Card>
  );
}
