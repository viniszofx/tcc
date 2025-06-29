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
import type { Campus } from "@/interface";
import { ArrowLeft, Plus, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CampusPage() {
  const router = useRouter();
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCampus, setCurrentCampus] = useState<Campus | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "delete">(
    "create"
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCampuses = async () => {
      try {
        const response = await fetch("/api/campus");
        const data = await response.json();

        if (response.ok) {
          setCampuses(data);
        } else {
          console.error("Erro ao buscar campus:", data);
        }
      } catch (error) {
        console.error("Erro ao buscar campus:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampuses();
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

  const handleSaveCampus = async (campus: Campus) => {
    try {
      if (modalMode === "create") {
        const response = await fetch("/api/campus", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(campus),
        });

        if (response.ok) {
          const newCampus = await response.json();
          setCampuses([...campuses, newCampus]);
        } else {
          console.error("Erro ao criar campus");
        }
      } else if (modalMode === "edit") {
        const response = await fetch("/api/campus", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(campus),
        });

        if (response.ok) {
          const updatedCampus = await response.json();
          setCampuses(
            campuses.map((c) => (c.id === campus.id ? updatedCampus : c))
          );
        } else {
          console.error("Erro ao atualizar campus");
        }
      }
    } catch (error) {
      console.error("Erro ao salvar campus:", error);
    }
    handleCloseModal();
  };

  const handleDeleteCampus = async (campusId: string) => {
    try {
      const response = await fetch(`/api/campus?id=${campusId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCampuses(campuses.filter((c) => c.id !== campusId));
      } else {
        console.error("Erro ao deletar campus");
      }
    } catch (error) {
      console.error("Erro ao deletar campus:", error);
    }
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
