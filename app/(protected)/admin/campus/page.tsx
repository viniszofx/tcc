"use client";

import LoadingScreen from "@/components/custom/loading";
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
import data from "@/data/new-db.json";
import type { Campus } from "@/lib/new-interface";
import { ArrowLeft, Plus, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";


export default function CampusPage() {
  const router = useRouter();
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCampus, setCurrentCampus] = useState<Campus | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "delete">("create");
  const [isLoading, setIsLoading] = useState(true);

  const initialCampuses: Campus[] = (data.campus || []).map((campus: any) => ({
    ...campus,
  }));

  useState(() => {
    setCampuses(initialCampuses);
  });

  useEffect(() => {
    setIsLoading(false);
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
        id: uuidv4(),
      };
      setCampuses([...campuses, newCampus]);
    } else if (modalMode === "edit") {
      setCampuses(
        campuses.map((c) => (c.id === campus.id ? campus : c))
      );
    }
    handleCloseModal();
  };

  const handleDeleteCampus = (campusId: string) => {
    setCampuses(campuses.filter((c) => c.id !== campusId));
    handleCloseModal();
  };

  const handleSaveAll = () => {
    console.log("Saving all changes:", campuses);
    alert("Alterações salvas com sucesso!");
  };

  const handleCardClick = (campusId: string) => {
    router.push(`/admin/campus/${campusId}`);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

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
        <div className="flex gap-2 w-full sm:w-auto justify-end">
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

        <div className="grid gap-6 md:grid-cols-2">
          {campuses.map((campus) => (
            <CampusCard
              key={campus.id}
              campus={campus}
              onEdit={() => handleOpenModal("edit", campus)}
              onDelete={() => handleOpenModal("delete", campus)}
              onClick={() => handleCardClick(campus.id)}
              disableDelete={campuses.length === 1}
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