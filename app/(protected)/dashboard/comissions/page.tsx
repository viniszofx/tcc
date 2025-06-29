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
import type { Campus, Commission } from "@/interface";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ComissionsPage({ params }: any) {
  const campus_id = params.campus_id || "99dcee11-52de-4f4b-b5d5-6e46e4d30191";
  const [comissoes, setComissoes] = useState<Commission[]>([]);
  const [campus, setCampus] = useState<Campus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar comissões filtradas por campus
        const commissionsResponse = await fetch(
          `/api/commission?campusId=${campus_id}`
        );
        const commissionsData = await commissionsResponse.json();

        // Buscar dados do campus específico
        const campusResponse = await fetch(`/api/campus?id=${campus_id}`);
        const campusData = await campusResponse.json();

        if (commissionsResponse.ok) {
          setComissoes(commissionsData);
        }

        if (campusResponse.ok) {
          setCampus(campusData);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [campus_id]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (comissoes.length === 0) {
    return (
      <Card className="w-full max-w-3xl bg-[var(--bg-simple)]">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <h2 className="text-xl font-bold text-[var(--font-color)]">
            Nenhuma comissão encontrada
          </h2>
          <p className="text-muted-foreground mt-2">
            Não há comissões cadastradas para este campus
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
          Lista de comissões do {campus?.name || "Câmpus"}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <div className="grid gap-6 md:grid-cols-2">
          {comissoes.map((comissao) => (
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
