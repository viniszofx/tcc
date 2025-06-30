"use client";

import LoadingScreen from "@/components/custom/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { InventoryHistoryWithRelations } from "@/interface";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HistoryPage() {
  const params = useParams();
  const commissionId = params.commission_id as string;
  const [historico, setHistorico] = useState<InventoryHistoryWithRelations[]>(
    []
  );
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
          setHistorico(historyData);
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

  // Função para formatar as mudanças de forma mais legível
  const formatChanges = (changes: any) => {
    if (!changes) return null;

    const entries = Object.entries(changes);
    if (entries.length === 0) return null;

    const relevantChanges = entries.filter(([key, value]: [string, any]) => {
      // Filtrar apenas mudanças que realmente aconteceram
      return (
        value &&
        value.old !== value.new &&
        value.old !== undefined &&
        value.new !== undefined &&
        value.old !== null &&
        value.new !== null
      );
    });

    if (relevantChanges.length === 0) return null;

    return (
      <div className="mt-2 space-y-1">
        {relevantChanges.map(([key, value]: [string, any]) => {
          const fieldName = getFieldDisplayName(key);
          return (
            <div key={key} className="text-xs">
              <span className="font-medium text-blue-600">{fieldName}:</span>
              <span className="ml-1 px-1 py-0.5 bg-red-100 text-red-700 rounded text-xs">
                {value.old}
              </span>
              <span className="mx-1">→</span>
              <span className="px-1 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                {value.new}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Função para obter nome amigável dos campos
  const getFieldDisplayName = (fieldName: string): string => {
    const fieldMap: Record<string, string> = {
      description: "Descrição",
      number: "Número",
      model: "Modelo",
      brand: "Marca",
      color: "Cor",
      serialNumber: "Número de Série",
      location: "Localização",
      condition: "Condição",
      observations: "Observações",
      value: "Valor",
      status: "Status",
      commissionId: "Comissão",
    };
    return fieldMap[fieldName] || fieldName;
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Card className="w-full max-w-6xl min-h-[300px] bg-[var(--bg-simple)] shadow-xl transition-all duration-300 p-8">
      <CardContent className="p-6 flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold mb-2 text-[var(--font-color)]">
            Histórico de Inventário
          </h2>
          <p className="text-[var(--font-color)] opacity-70 mb-4">
            Histórico de alterações dos itens da comissão
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
                    className="border bg-[var(--card-color)] border-[var(--border-color)] rounded-lg p-4 space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              historyItem.action === "create"
                                ? "bg-green-100 text-green-700"
                                : historyItem.action === "update"
                                ? "bg-blue-100 text-blue-700"
                                : historyItem.action === "delete"
                                ? "bg-red-100 text-red-700"
                                : historyItem.action === "move"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {historyItem.action === "create"
                              ? "Criado"
                              : historyItem.action === "update"
                              ? "Atualizado"
                              : historyItem.action === "delete"
                              ? "Removido"
                              : historyItem.action === "move"
                              ? "Movido"
                              : historyItem.action}
                          </span>
                          {historyItem.inventoryItem && (
                            <span className="text-sm font-medium text-[var(--font-color)]">
                              {historyItem.inventoryItem.description} (#
                              {historyItem.inventoryItem.number})
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formattedDate}
                      </span>
                    </div>

                    {historyItem.user && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Por:</span>{" "}
                        {historyItem.user.name}
                      </div>
                    )}

                    {formatChanges(historyItem.changes)}
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
