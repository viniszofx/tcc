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
import { useUserPermissions } from "@/hooks/use-user-permissions";
import type { Campus } from "@/interface";
import { Plus, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CampusPage() {
  const { canManageCampuses, loading, error } = useUserPermissions();
  const router = useRouter();
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCampus, setCurrentCampus] = useState<Campus | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "delete">(
    "create"
  );
  const [isLoading, setIsLoading] = useState(true);

  // Verificar permissões
  useEffect(() => {
    if (!loading && !canManageCampuses) {
      router.push("/application");
    }
  }, [loading, canManageCampuses, router]);

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

    if (canManageCampuses) {
      fetchCampuses();
    }
  }, [canManageCampuses]);

  if (loading || !canManageCampuses) {
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

  const handleOpenModal = (
    mode: "create" | "edit" | "delete",
    campus?: Campus
  ) => {
    setModalMode(mode);
    setCurrentCampus(campus || null);
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

  const handleSaveCampus = async (campusData: any) => {
    try {
      let response;
      if (modalMode === "create") {
        response = await fetch("/api/campus", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(campusData),
        });
      } else if (modalMode === "edit" && currentCampus) {
        response = await fetch("/api/campus", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: currentCampus.id, ...campusData }),
        });
      } else if (modalMode === "delete" && currentCampus) {
        response = await fetch("/api/campus", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: currentCampus.id }),
        });
      }

      if (response?.ok) {
        // Recarregar dados
        const campusesResponse = await fetch("/api/campus");
        const campusesData = await campusesResponse.json();
        setCampuses(campusesData);
        setIsModalOpen(false);
        setCurrentCampus(null);
      } else {
        console.error("Erro ao salvar campus");
      }
    } catch (error) {
      console.error("Erro ao salvar campus:", error);
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
            Gerenciamento de Campus
          </CardTitle>
          <CardDescription className="text-[var(--font-color)] opacity-70">
            Gerencie os campus do sistema
          </CardDescription>
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-end">
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
            Adicionar Campus
          </Button>
        </div>

        {campuses.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {campuses.map((campus) => (
              <CampusCard
                key={campus.id}
                campus={campus}
                onEdit={() => handleOpenModal("edit", campus)}
                onDelete={() => handleOpenModal("delete", campus)}
                onClick={() => router.push(`/application/campus/${campus.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[var(--font-color)] opacity-70 text-lg">
              Nenhum campus cadastrado ainda.
            </p>
          </div>
        )}
      </CardContent>

      <CampusModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCurrentCampus(null);
        }}
        campus={currentCampus}
        mode={modalMode}
        onSave={handleSaveCampus}
        onDelete={(campusId: string) => {
          handleSaveCampus({ id: campusId });
        }}
      />
    </Card>
  );
}
