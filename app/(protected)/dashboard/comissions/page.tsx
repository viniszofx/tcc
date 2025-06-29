"use client";

import LoadingScreen from "@/components/custom/loading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUser } from "@/contexts/UserContext";
import type { Campus, Commission } from "@/interface";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ComissionsPage({ params }: any) {
  const { user } = useUser();
  const [comissoes, setComissoes] = useState<Commission[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [selectedCampusId, setSelectedCampusId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [userCommissions, setUserCommissions] = useState<Commission[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        console.log("Buscando comissões para o usuário:", user.id);

        // Buscar membros da comissão onde o usuário está envolvido
        const commissionMembersResponse = await fetch(
          `/api/commission-member?userId=${user.id}`
        );
        const commissionMembersData = await commissionMembersResponse.json();

        console.log("Membros de comissão do usuário:", commissionMembersData);

        if (commissionMembersResponse.ok && commissionMembersData.length > 0) {
          // Buscar as comissões onde o usuário é membro
          const commissionIds = commissionMembersData.map(
            (member: any) => member.commissionId
          );

          const commissionsPromises = commissionIds.map((id: string) =>
            fetch(`/api/commission?id=${id}`).then((res) => res.json())
          );

          const commissionsResults = await Promise.all(commissionsPromises);
          const userCommissionsData = commissionsResults.filter(
            (commission) => commission && commission.id
          );

          setUserCommissions(userCommissionsData);
          setComissoes(userCommissionsData);

          // Buscar campus das comissões do usuário
          const campusIds = [
            ...new Set(
              userCommissionsData.map((commission: any) => commission.campusId)
            ),
          ];

          const campusPromises = campusIds.map((id: string) =>
            fetch(`/api/campus?id=${id}`).then((res) => res.json())
          );

          const campusResults = await Promise.all(campusPromises);
          const campusData = campusResults.filter(
            (campus) => campus && campus.id
          );

          setCampuses(campusData);
          if (campusData.length > 0) {
            setSelectedCampusId(campusData[0].id);
          }
        } else {
          console.log("Usuário não é membro de nenhuma comissão");
          setComissoes([]);
          setUserCommissions([]);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Filtrar comissões pelo campus selecionado (das comissões do usuário)
  const filteredComissoes = selectedCampusId
    ? userCommissions.filter(
        (comissao) => comissao.campusId === selectedCampusId
      )
    : userCommissions;

  const selectedCampus = campuses.find((c) => c.id === selectedCampusId);

  if (filteredComissoes.length === 0) {
    return (
      <Card className="w-full max-w-3xl bg-[var(--bg-simple)]">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <h2 className="text-xl font-bold text-[var(--font-color)]">
            Nenhuma comissão encontrada
          </h2>
          <p className="text-muted-foreground mt-2">
            Você não é membro de nenhuma comissão neste campus
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-lg transition-all duration-300 lg:max-w-5xl xl:max-w-6xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold text-[var(--font-color)] md:text-2xl lg:text-3xl">
          Comissões
        </CardTitle>
        <CardDescription className="text-[var(--font-color)]">
          Suas comissões no {selectedCampus?.name || "Câmpus"}
        </CardDescription>

        {/* Seletor de Campus */}
        {campuses.length > 1 && (
          <div className="mt-4">
            <label
              htmlFor="campus-select"
              className="block text-sm font-medium text-[var(--font-color)] mb-2"
            >
              Selecionar Campus:
            </label>
            <select
              id="campus-select"
              value={selectedCampusId}
              onChange={(e) => setSelectedCampusId(e.target.value)}
              className="w-full p-2 border border-[var(--border-color)] rounded-md bg-[var(--bg-color)] text-[var(--font-color)]"
            >
              <option value="">Todos os campus</option>
              {campuses.map((campus) => (
                <option key={campus.id} value={campus.id}>
                  {campus.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <div className="grid gap-6 md:grid-cols-2">
          {filteredComissoes.map((comissao) => (
            <Card
              key={comissao.id}
              className="border-[var(--border-color)] bg-[var(--bg-simple)]"
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
                <p className="text-sm text-[var(--font-color)] mt-2">
                  Status: {comissao.active ? "Ativa" : "Inativa"}
                </p>
              </CardContent>
              <CardFooter>
                <Link
                  href={`/dashboard/comissions/${comissao.id}`}
                  className="w-full"
                >
                  <Button className="w-full text-[var(--font-color2)] bg-[var(--button-color)] hover:bg-[var(--hover-3-color)]">
                    Ver Comissão
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
