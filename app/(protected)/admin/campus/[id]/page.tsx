"use client";

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
import type { Campus } from "@/lib/interface";
import { ArrowLeft, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

export default function CampusDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [campus, setCampus] = useState<Campus | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const unwrappedParams = use(params);
  const campusId = unwrappedParams.id;

  useEffect(() => {
    const fetchCampus = async () => {
      try {
        const response = await fetch("/api/v1/campuses");
        const data = await response.json();
        const foundCampus = data.find((c: Campus) => c.campus_id === campusId);
        
        if (foundCampus) {
          setCampus(foundCampus);
        } else {
          router.push("/admin/campus");
        }
      } catch (error) {
        console.error("Error fetching campus:", error);
        router.push("/admin/campus");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampus();
  }, [campusId, router]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveCampus = (updatedCampus: Campus) => {
    setCampus(updatedCampus);
    setIsModalOpen(false);
  };

  const handleDeleteCampus = () => {
    router.push("/admin/campus");
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-lg transition-all duration-300 lg:max-w-5xl xl:max-w-6xl">
        <CardContent className="flex h-40 items-center justify-center">
          <p className="text-[var(--font-color)]">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  if (!campus) {
    return (
      <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-lg transition-all duration-300 lg:max-w-5xl xl:max-w-6xl">
        <CardContent className="flex h-40 items-center justify-center">
          <p className="text-[var(--font-color)]">Campus não encontrado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-lg transition-all duration-300 lg:max-w-5xl xl:max-w-6xl">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <CardTitle className="text-xl font-bold text-[var(--font-color)] md:text-2xl lg:text-3xl">
            Detalhes do Campus
          </CardTitle>
          <CardDescription className="text-[var(--font-color)] opacity-70">
            Informações detalhadas do campus
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/campus")}
            className="text-[var(--font-color)] transition-all"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <Button
            size="sm"
            onClick={handleOpenModal}
            className="bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white transition-all"
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-2xl font-bold text-[var(--font-color)]">
            {campus.nome}
          </h2>
          <Badge
            variant={campus.campus_ativo ? "default" : "outline"}
            className={
              campus.campus_ativo
                ? "bg-green-500 text-white hover:bg-green-600"
                : "text-gray-500"
            }
          >
            {campus.campus_ativo ? "Ativo" : "Inativo"}
          </Badge>
        </div>

        <div className="rounded-lg border border-[var(--border-color)] p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium text-[var(--font-color)] opacity-70">
                Código do Campus
              </p>
              <p className="text-lg font-semibold text-[var(--font-color)] break-words">
                {campus.campus_codigo}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-[var(--font-color)] opacity-70">
                ID do Campus
              </p>
              <p className="text-lg font-semibold text-[var(--font-color)] break-words">
                {campus.campus_id}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-[var(--font-color)] opacity-70">
                Status
              </p>
              <p className="text-lg font-semibold text-[var(--font-color)]">
                {campus.campus_ativo ? "Ativo" : "Inativo"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CampusModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveCampus}
        onDelete={handleDeleteCampus}
        campus={campus}
        mode="edit"
      />
    </Card>
  );
}