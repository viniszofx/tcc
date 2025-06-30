"use client";

import LoadingScreen from "@/components/custom/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { InventoryHistoryWithRelations } from "@/interface";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
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

  const getActionLabel = (action: string) => {
    switch (action) {
      case "create":
        return "Item Criado";
      case "update":
        return "Item Atualizado";
      case "delete":
        return "Item Removido";
      default:
        return action;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "create":
        return "bg-green-100 text-green-800";
      case "update":
        return "bg-blue-100 text-blue-800";
      case "delete":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatChanges = (changes: any) => {
    if (!changes || typeof changes !== "object") return "";

    try {
      const changesObj =
        typeof changes === "string" ? JSON.parse(changes) : changes;

      if (changesObj.created) {
        const item = changesObj.created;
        return `Novo item adicionado ao inventário`;
      }

      if (changesObj.deleted) {
        const item = changesObj.deleted;
        return `Item removido do inventário`;
      }

      if (changesObj.before && changesObj.after) {
        const differences: string[] = [];
        const before = changesObj.before;
        const after = changesObj.after;

        // Campos importantes para mostrar mudanças
        const relevantFields = [
          { key: "number", label: "Número" },
          { key: "description", label: "Descrição" },
          { key: "brandModel", label: "Marca/Modelo" },
          { key: "currentResponsibility", label: "Responsável" },
          { key: "conservationState", label: "Estado de Conservação" },
          { key: "location", label: "Localização" },
          { key: "sector", label: "Setor" },
          { key: "ed", label: "ED" },
          { key: "campusId", label: "Campus" },
        ];

        relevantFields.forEach(({ key, label }) => {
          if (before[key] !== after[key]) {
            const oldValue = before[key] || "Não informado";
            const newValue = after[key] || "Não informado";

            // Evitar mostrar mudanças irrelevantes
            if (
              oldValue === newValue ||
              (oldValue === null && newValue === null) ||
              (oldValue === "" && newValue === null) ||
              (oldValue === null && newValue === "")
            ) {
              return;
            }

            differences.push(`${label}: "${oldValue}" → "${newValue}"`);
          }
        });

        if (differences.length > 0) {
          return differences.length > 2
            ? differences.slice(0, 2).join("; ") +
                `... (+${differences.length - 2} campos)`
            : differences.join("; ");
        }

        return "Item atualizado (alterações menores)";
      }

      return "Alteração registrada";
    } catch (error) {
      console.error("Erro ao processar mudanças:", error);
      return "Erro ao processar mudanças";
    }
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
            Registro de todas as operações realizadas nos itens de inventário
            desta comissão
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
                    className="border text-sm bg-[var(--card-color)] border-[var(--border-color)] rounded-md min-h-[60px] flex flex-col justify-center px-4 py-3 text-[var(--font-color)]"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-xs px-2 py-1 rounded font-medium ${getActionColor(
                              historyItem.action
                            )}`}
                          >
                            {getActionLabel(historyItem.action)}
                          </span>
                          {historyItem.inventoryItem && (
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              #{historyItem.inventoryItem.number}
                            </span>
                          )}
                        </div>
                        {historyItem.inventoryItem && (
                          <div className="text-sm font-medium text-[var(--font-color)] mb-1">
                            {historyItem.inventoryItem.description}
                          </div>
                        )}
                        {historyItem.changes && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatChanges(historyItem.changes)}
                          </div>
                        )}
                        {historyItem.observation &&
                          historyItem.observation !== "Item criado" &&
                          historyItem.observation !== "Item atualizado" &&
                          historyItem.observation !== "Item removido" && (
                            <div className="text-xs text-muted-foreground mt-1 italic">
                              <strong>Observação:</strong>{" "}
                              {historyItem.observation}
                            </div>
                          )}
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground">
                          {formattedDate}
                        </span>
                        {historyItem.user && (
                          <div className="text-xs text-muted-foreground">
                            por:{" "}
                            {historyItem.user.name || historyItem.user.email}
                          </div>
                        )}
                      </div>
                    </div>
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
