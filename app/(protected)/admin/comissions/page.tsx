"use client";

import LoadingScreen from "@/components/custom/loading";
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
import type {
  Campus,
  Commission,
  CommissionMember,
  UserProfile,
} from "@/interface";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CommissionsPage() {
  const [comissoes, setComissoes] = useState<Commission[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [commissionMembers, setCommissionMembers] = useState<
    CommissionMember[]
  >([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar comissões
        const commissionsResponse = await fetch("/api/commission");
        const commissionsData = await commissionsResponse.json();

        // Buscar campuses
        const campusesResponse = await fetch("/api/campus");
        const campusesData = await campusesResponse.json();

        // Buscar membros das comissões
        const commissionMembersResponse = await fetch("/api/commission-member");
        const commissionMembersData = await commissionMembersResponse.json();

        // Buscar usuários
        const usersResponse = await fetch("/api/user");
        const usersData = await usersResponse.json();

        setComissoes(commissionsData);
        setCampuses(campusesData);
        setCommissionMembers(commissionMembersData);
        setUsers(usersData);

        console.log("Dados carregados:");
        console.log("Comissões:", commissionsData);
        console.log("Campuses:", campusesData);
        console.log("Membros das comissões:", commissionMembersData);
        console.log("Usuários:", usersData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getDefaultCampusId = (): string => {
    const defaultCampus = campuses.find((c) => c.active);
    return defaultCampus?.id || campuses[0]?.id || "";
  };

  const handleAddComission = async (newComission: {
    nome: string;
    descricao: string;
    tipo: string;
  }) => {
    try {
      const response = await fetch("/api/commission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campusId: getDefaultCampusId(),
          name: newComission.nome,
          description: newComission.descricao,
          type: newComission.tipo,
          active: true,
          year: new Date().getFullYear(),
          spreadsheet_url: "",
        }),
      });

      if (response.ok) {
        const novaComissao = await response.json();
        setComissoes([...comissoes, novaComissao]);
        setIsAddModalOpen(false);
      } else {
        console.error("Erro ao criar comissão");
      }
    } catch (error) {
      console.error("Erro ao criar comissão:", error);
    }
  };

  const getCampusName = (campusId: string): string => {
    const campus = campuses.find((c) => c.id === campusId);
    return campus?.name || "Câmpus";
  };

  const getPresidentName = (commissionId: string): string => {
    console.log("Buscando presidente para comissão:", commissionId);
    console.log("Membros da comissão:", commissionMembers);
    console.log("Usuários:", users);

    const president = commissionMembers.find(
      (member) =>
        member.commissionId === commissionId &&
        member.roleInCommission === "Presidente"
    );

    console.log("Presidente encontrado:", president);

    if (president) {
      const user = users.find((u) => u.id === president.userId);
      console.log("Usuário presidente:", user);
      return user?.name || "Presidente não encontrado";
    }

    return "Sem presidente definido";
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-lg transition-all duration-300 lg:max-w-5xl xl:max-w-6xl">
      <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <CardTitle className="text-xl font-bold text-[var(--font-color)] md:text-2xl lg:text-3xl">
            Comissões
          </CardTitle>
          <CardDescription className="text-[var(--font-color)] opacity-70">
            {comissoes.length > 0
              ? `Lista de comissões do ${getCampusName(comissoes[0].campusId)}`
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
            disabled={campuses.length === 0}
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
                key={comissao.id}
                className="border border-[var(--border-color)] bg-[var(--bg-simple)]"
              >
                <CardHeader>
                  <CardTitle className="text-[var(--font-color)]">
                    {comissao.name}
                  </CardTitle>
                  <CardDescription className="text-[var(--font-color)]">
                    Tipo: {comissao.type} | Ano: {comissao.year}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[var(--font-color)]">
                    {comissao.description || "Sem descrição"}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm text-[var(--font-color)]">
                      Status:
                    </span>
                    <span
                      className={`text-sm ${
                        comissao.active ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {comissao.active ? "Ativa" : "Inativa"}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--font-color)] mt-2">
                    Campus: {getCampusName(comissao.campusId)}
                  </p>
                  <p className="text-sm text-[var(--font-color)] mt-2">
                    Responsável: {getPresidentName(comissao.id)}
                  </p>
                </CardContent>
                <CardFooter>
                  <Link
                    href={`/admin/comissions/${comissao.id}`}
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
        campuses={campuses}
      />
    </Card>
  );
}
