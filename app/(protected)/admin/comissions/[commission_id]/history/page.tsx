"use client";

import LoadingScreen from "@/components/custom/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { InventoryHistory } from "@/interface";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  const params = useParams();
  const commissionId = params.commission_id as string;
  const [historico, setHistorico] = useState<InventoryHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchHistorico = async () => {
      try {
        // Buscar histórico de inventário filtrado pela comissão
        const response = await fetch(
          `/api/inventory-history?commissionId=${commissionId}`
        );
        const historyData = await response.json();

        if (response.ok) {
          // Ordenar por timestamp mais recente
          const sortedHistory = historyData.sort(
            (a: any, b: any) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );

          setHistorico(sortedHistory);
        } else {
          console.error("Erro ao buscar histórico");
          setHistorico([]);
        }
      } catch (error) {
        console.error("Erro ao buscar histórico:", error);
        setHistorico([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistorico();
  }, [commissionId]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Card className="w-full max-w-6xl min-h-[300px] bg-[var(--bg-simple)] shadow-xl transition-all duration-300 p-8">
      <CardContent className="p-6 flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold mb-2 text-[var(--font-color)]">
            Tabela do histórico
          </h2>
          <p className="text-[var(--font-color)] opacity-70 mb-4">
            Histórico do sistema
          </p>
          <div className="flex flex-col gap-2">
            {historico.length === 0 ? (
              <div className="text-center text-[var(--font-color)] opacity-60 py-8">
                Nenhum evento registrado.
              </div>
            ) : (
              historico.map((historyItem) => {
                const formattedDate = new Date(
                  historyItem.timestamp
                ).toLocaleString("pt-BR");

                return (
                  <div
                    key={historyItem.id}
                    className="border text-sm bg-[var(--card-color)] border-[var(--border-color)] rounded-md min-h-[50px] flex flex-col justify-center px-4 py-3 text-[var(--font-color)]"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <span className="font-medium">
                          {historyItem.action}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formattedDate}
                      </span>
                    </div>
                    {historyItem.changes &&
                      Object.keys(historyItem.changes).length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Alterações:{" "}
                          {Object.entries(historyItem.changes)
                            .map(
                              ([key, value]: [string, any]) =>
                                `${key}: ${value.old} → ${value.new}`
                            )
                            .join(", ")}
                        </div>
                      )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="w-full flex justify-end">
          <Button
            type="button"
            onClick={() => router.back()}
            className="bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white transition-all w-full sm:w-auto cursor-pointer"
          >
            Voltar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
