"use client";

import CampusCard from "@/components/manager-campuses/campus-card";
import CampusModal from "@/components/manager-campuses/campus-modal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Campus } from "@/lib/interface";
import { ArrowLeft, Plus, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CampusPage() {
  const router = useRouter();
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCampus, setCurrentCampus] = useState<Campus | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "delete">("create");

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch("/api/v1/campuses");
        const data = await res.json();
        setCampuses(data);
      } catch (error) {
        console.error("Erro ao buscar os campuses:", error);
      }
    };
    loadData();
  }, []);

  const handleOpenModal = (
    mode: "create" | "edit" | "delete",
    campus?: Campus
  ) => {
    setModalMode(mode);
    setCurrentCampus(campus || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentCampus(null);
  };

  const handleSaveCampus = (campus: Campus) => {
    if (modalMode === "create") {
      const newCampus: Campus = {
        ...campus,
        campus_id: `${Date.now()}`,
      };
      setCampuses([...campuses, newCampus]);
    } else if (modalMode === "edit") {
      setCampuses(
        campuses.map((c) => (c.campus_id === campus.campus_id ? campus : c))
      );
    }
    handleCloseModal();
  };

  const handleDeleteCampus = (campusId: string) => {
    setCampuses(campuses.filter((c) => c.campus_id !== campusId));
    handleCloseModal();
  };

  const handleSaveAll = () => {
    console.log("Saving all changes:", campuses);
    alert("Alterações salvas com sucesso!");
  };

  const handleCardClick = (campusId: string) => {
    router.push(`/admin/campus/${campusId}`);
  };

  return (
    <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-lg transition-all duration-300 lg:max-w-5xl xl:max-w-6xl">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <CardTitle className="text-xl font-bold text-[var(--font-color)] md:text-2xl lg:text-3xl">
            Gerenciamento de Campus
          </CardTitle>
          <CardDescription className="text-[var(--font-color)] opacity-70">
            Gerencie os campus do sistema
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin")}
            className="text-[var(--font-color)] transition-all"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <Button
            size="sm"
            onClick={handleSaveAll}
            className="bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white transition-all"
          >
            <Save className="mr-2 h-4 w-4" />
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
            <Plus className="mr-2 h-4 w-4" />
            Novo Campus
          </Button>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {campuses.map((campus) => (
            <CampusCard
              key={campus.campus_id}
              campus={campus}
              onEdit={() => handleOpenModal("edit", campus)}
              onDelete={() => handleOpenModal("delete", campus)}
              onClick={() => handleCardClick(campus.campus_id)}
            />
          ))}
        </div>
      </CardContent>

      <CampusModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveCampus}
        onDelete={handleDeleteCampus}
        campus={currentCampus}
        mode={modalMode}
      />
    </Card>
  );
}