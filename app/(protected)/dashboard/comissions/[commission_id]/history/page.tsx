"use client";

import LoadingScreen from "@/components/custom/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { InventoryHistory, InventoryItem, UserProfile } from "@/interface";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HistoryPage() {
  const params = useParams();
  const commissionId = params.commission_id as string;
  const [historico, setHistorico] = useState<InventoryHistory[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar itens do inventário da comissão
        const itemsResponse = await fetch(
          `/api/inventory?commissionId=${commissionId}`
        );
        const itemsData = await itemsResponse.json();

        if (itemsResponse.ok) {
          setInventoryItems(itemsData);

          // Buscar histórico para os itens desta comissão
          const historyResponse = await fetch(
            `/api/inventory-history?commissionId=${commissionId}`
          );
          const historyData = await historyResponse.json();

          if (historyResponse.ok) {
            // Ordenar histórico por timestamp decrescente
            const sortedHistory = historyData.sort(
              (a: InventoryHistory, b: InventoryHistory) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
            );

            setHistorico(sortedHistory);

            // Buscar usuários únicos do histórico
            const userIds = [
              ...new Set(
                sortedHistory.map((item: InventoryHistory) => item.userId)
              ),
            ];
            const usersPromises = userIds.map(async (userId) => {
              const userResponse = await fetch(`/api/user?id=${userId}`);
              if (userResponse.ok) {
                return await userResponse.json();
              }
              return null;
            });

            const usersData = await Promise.all(usersPromises);
            setUsers(usersData.filter((user) => user !== null));
          }
        }
      } catch (error) {
        console.error("Erro ao buscar histórico:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [commissionId]);

  const getUserById = (userId: string) => {
    return users.find((user) => user.id === userId);
  };

  const getInventoryItemById = (itemId: string) => {
    return inventoryItems.find((item) => item.id === itemId);
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
                const user = getUserById(historyItem.userId);
                const inventoryItem = getInventoryItemById(
                  historyItem.inventoryItemId
                );
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
                        {inventoryItem && (
                          <span className="text-xs text-muted-foreground ml-2">
                            - {inventoryItem.description} (#
                            {inventoryItem.number})
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formattedDate}
                      </span>
                    </div>
                    {user && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Por: {user.name}
                      </div>
                    )}
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
