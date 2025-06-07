"use client";

import { AddComissionModal } from "@/components/manager-comissions/add-comission-modal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import data from "@/data/db.json";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface Comission {
  id: string;
  name: string;
  description: string;
  campus_id: string;
}

export default function CommissionsPage() {
  const campus_id = "campus-1";
  const commissions = data.comissions.filter(
    (commission: Comission) => commission.campus_id === campus_id
  );

  const campus = data.campuses.find((campus: any) => campus.id === campus_id);
  const campusName = campus ? campus.nome : "Câmpus";

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedComission, setSelectedComission] = useState<Comission | null>(
    null
  );
  const [comissions, setComissions] = useState<Comission[]>(commissions);

  const handleAddComission = (newComission: {
    name: string;
    description: string;
  }) => {
    const newComissionId = `${Date.now()}`;
    const comissionToAdd: Comission = {
      id: newComissionId,
      campus_id,
      name: newComission.name || "Nova Comissão",
      description: newComission.description || "",
    };
    setComissions([...comissions, comissionToAdd]);
  };

  const handleEditClick = (comission: Comission) => {
    setSelectedComission(comission);
    setIsEditModalOpen(true);
  };

  return (
    <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-lg transition-all duration-300 lg:max-w-5xl xl:max-w-6xl">
      <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <CardTitle className="text-xl font-bold text-[var(--font-color)] md:text-2xl lg:text-3xl">
            Comissões
          </CardTitle>
          <CardDescription className="text-[var(--font-color)] opacity-70">
            Lista de comissões do {campusName}
          </CardDescription>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white transition-all w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Comissão
        </Button>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <div className="grid gap-6 md:grid-cols-2">
          {comissions.map((commission) => (
            <Card
              key={commission.id}
              className="border border-[var(--border-color)] bg-[var(--bg-simple)]"
            >
              <CardHeader>
                <CardTitle className="text-[var(--font-color)]">
                  {commission.name}
                </CardTitle>
                <CardDescription className="text-[var(--font-color)]">
                  ID: {commission.id}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[var(--font-color)]">
                  {commission.description}
                </p>
              </CardContent>
              <CardFooter>
                <Link
                  href={`/admin/comissions/${commission.id}`}
                  className="w-full"
                >
                  <Button className="w-full text-[var(--font-color2)] bg-[var(--button-color)] transition-all hover:bg-[var(--hover-3-color)] hover:text-white">
                    Ver Comissão
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </CardContent>

      <AddComissionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddComission={handleAddComission}
      />
    </Card>
  );
}
