"use client";

import LoadingScreen from "@/components/custom/loading";
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
import { ArrowLeft, Edit } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CampusDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campusId = params.id as string;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const campus = (data.campus || []).find(
    (c: any) => c.id === campusId
  );

  if (!campus) {
    return (
      <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-lg transition-all duration-300 lg:max-w-5xl xl:max-w-6xl mx-auto mt-12">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <h2 className="text-xl font-bold text-[var(--font-color)]">
            Campus não encontrado
          </h2>
          <p className="text-muted-foreground mt-2">
            ID: {campusId} não corresponde a nenhum campus
          </p>
          <p className="text-muted-foreground mt-1">
            IDs válidos: {(data.campus || []).map(c => c.id).join(", ")}
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/admin/campus")}
          >
            Voltar para lista de campus
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-lg transition-all duration-300 lg:max-w-5xl xl:max-w-6xl mx-auto mt-12">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold text-[var(--font-color)]">
              {campus.name}
            </CardTitle>
            <CardDescription className="text-[var(--font-color)]">
              Código: {campus.code}
            </CardDescription>
          </div>
          <div className="flex gap-2">
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
            <h3 className="font-medium text-[var(--font-color)]">ID do Campus</h3>
            <p className="text-sm text-[var(--font-color)]">
              {campus.id}
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="font-medium text-[var(--font-color)]">Status</h3>
            <p className="text-sm text-[var(--font-color)]">
              {campus.active ? "Ativo" : "Inativo"}
            </p>
          </div>
        </div>
      </CardContent>

      <CampusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={() => setIsModalOpen(false)}
        onDelete={() => router.push("/admin/campus")}
        campus={campus}
        mode="edit"
      />
    </Card>
  );
}