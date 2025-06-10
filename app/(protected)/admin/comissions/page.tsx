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
import type { Comissao } from "@/lib/interface";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CommissionsPage() {
  const [comissoes, setComissoes] = useState<Comissao[]>(data.comissoes);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const getDefaultCampusId = (): string => {
    const defaultCampus = data.campuses.find(c => c.campus_ativo);
    return defaultCampus?.campus_id || data.campuses[0]?.campus_id || "";
  };

  const handleAddComission = (newComission: {
    nome: string;
    descricao: string;
    tipo: string;
  }) => {
    const novaComissao: Comissao = {
      comissao_id: `${Date.now()}`,
      campus_id: getDefaultCampusId(),
      nome: newComission.nome,
      descricao: newComission.descricao,
      tipo: newComission.tipo,
      ativo: true,
      ano: new Date().getFullYear(),
      presidente_id: "",
      organizacao_id: data.organizations[0]?.organizacao_id || ""
    };

    setComissoes([...comissoes, novaComissao]);
    setIsAddModalOpen(false);
  };

  const getCampusName = (campusId: string): string => {
    const campus = data.campuses.find(c => c.campus_id === campusId);
    return campus?.nome || "Câmpus";
  };

  const router = useRouter();

  return (
    <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-lg transition-all duration-300 lg:max-w-5xl xl:max-w-6xl">
      <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <CardTitle className="text-xl font-bold text-[var(--font-color)] md:text-2xl lg:text-3xl">
            Comissões
          </CardTitle>
          <CardDescription className="text-[var(--font-color)] opacity-70">
            {comissoes.length > 0
              ? `Lista de comissões do ${getCampusName(comissoes[0].campus_id)}`
              : "Nenhuma comissão cadastrada"}
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
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white transition-all w-full sm:w-auto"
            disabled={data.campuses.length === 0}
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Comissão
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        {comissoes.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {comissoes.map((comissao) => (
              <Card
                key={comissao.comissao_id}
                className="border border-[var(--border-color)] bg-[var(--bg-simple)]"
              >
                <CardHeader>
                  <CardTitle className="text-[var(--font-color)]">
                    {comissao.nome}
                  </CardTitle>
                  <CardDescription className="text-[var(--font-color)]">
                    Tipo: {comissao.tipo} | Ano: {comissao.ano}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[var(--font-color)]">
                    {comissao.descricao || "Sem descrição"}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm text-[var(--font-color)]">
                      Status:
                    </span>
                    <span
                      className={`text-sm ${comissao.ativo
                        ? "text-green-500"
                        : "text-red-500"
                        }`}
                    >
                      {comissao.ativo ? "Ativa" : "Inativa"}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--font-color)] mt-2">
                    Campus: {getCampusName(comissao.campus_id)}
                  </p>
                </CardContent>
                <CardFooter>
                  <Link
                    href={`/admin/comissions/${comissao.comissao_id}`}
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
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-[var(--font-color)] mb-4">
              Nenhuma comissão cadastrada
            </p>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[var(--button-color)] text-[var(--font-color2)]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeira Comissão
            </Button>
          </div>
        )}
      </CardContent>

      <AddComissionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddComission={handleAddComission}
        campuses={data.campuses}
      />
    </Card>
  );
}