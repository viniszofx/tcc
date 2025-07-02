"use client";

import LoadingScreen from "@/components/custom/loading";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUserPermissions } from "@/hooks/use-user-permissions";
import type {
  CommissionWithRelations,
  InventoryHistoryWithRelations,
} from "@/interface";
import {
  Calendar,
  Edit,
  Eye,
  FileText,
  History,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CommissionHistoryPage() {
  const { user, canAccessCommission, loading } = useUserPermissions();
  const router = useRouter();
  const params = useParams();
  const commissionId = params.commission_id as string;

  const [commission, setCommission] = useState<CommissionWithRelations | null>(
    null
  );
  const [history, setHistory] = useState<InventoryHistoryWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !canAccessCommission) {
      router.push("/application");
    }
  }, [loading, canAccessCommission, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar dados da comissão
        const commissionResponse = await fetch(
          `/api/commission/${commissionId}`
        );
        if (!commissionResponse.ok) {
          throw new Error("Comissão não encontrada");
        }
        const commissionData = await commissionResponse.json();
        setCommission(commissionData);

        // Buscar histórico da comissão
        const historyResponse = await fetch(
          `/api/inventory-history?commissionId=${commissionId}`
        );
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          setHistory(historyData);
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setError("Erro ao carregar dados");
      } finally {
        setIsLoading(false);
      }
    };

    if (commissionId && canAccessCommission) {
      fetchData();
    }
  }, [commissionId, canAccessCommission]);

  if (loading || isLoading) {
    return <LoadingScreen />;
  }

  if (error || !commission) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">{error || "Comissão não encontrada"}</p>
        </CardContent>
      </Card>
    );
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "CREATE":
      case "CREATED":
        return Plus;
      case "UPDATE":
      case "UPDATED":
        return Edit;
      case "DELETE":
      case "DELETED":
        return Trash2;
      case "VIEW":
      case "VIEWED":
        return Eye;
      default:
        return FileText;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATE":
      case "CREATED":
        return "bg-green-100 text-green-800 border-green-200";
      case "UPDATE":
      case "UPDATED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "DELETE":
      case "DELETED":
        return "bg-red-100 text-red-800 border-red-200";
      case "VIEW":
      case "VIEWED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-purple-100 text-purple-800 border-purple-200";
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case "CREATE":
      case "CREATED":
        return "Criado";
      case "UPDATE":
      case "UPDATED":
        return "Atualizado";
      case "DELETE":
      case "DELETED":
        return "Removido";
      case "VIEW":
      case "VIEWED":
        return "Visualizado";
      default:
        return action;
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-[var(--bg-simple)] shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-[var(--font-color)]">
            Histórico - {commission.name}
          </CardTitle>
          <CardDescription className="text-[var(--font-color)] opacity-70">
            {history.length}{" "}
            {history.length === 1 ? "evento registrado" : "eventos registrados"}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Timeline do Histórico */}
      {sortedHistory.length > 0 ? (
        <div className="space-y-4">
          {sortedHistory.map((event, index) => {
            const ActionIcon = getActionIcon(event.action);
            const isLast = index === sortedHistory.length - 1;

            return (
              <div key={event.id} className="relative">
                {/* Linha conectora */}
                {!isLast && (
                  <div className="absolute left-6 top-12 w-0.5 h-16 bg-[var(--border-color)]" />
                )}

                <Card className="bg-[var(--card-color)] border-[var(--border-color)] ml-12 relative">
                  {/* Ícone da ação */}
                  <div className="absolute -left-12 top-4 w-8 h-8 bg-[var(--bg-simple)] border-2 border-[var(--border-color)] rounded-full flex items-center justify-center">
                    <ActionIcon className="w-4 h-4 text-[var(--font-color)]" />
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            className={`${getActionColor(
                              event.action
                            )} border text-xs`}
                          >
                            {getActionText(event.action)}
                          </Badge>
                          <span className="text-xs text-[var(--font-color)] opacity-70">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {formatDate(event.timestamp)}
                          </span>
                        </div>

                        <h3 className="font-medium text-[var(--font-color)] mb-1">
                          {event.inventoryItem?.description ||
                            "Item de inventário"}
                        </h3>

                        {event.observation && (
                          <p className="text-sm text-[var(--font-color)] opacity-70 mb-2">
                            {event.observation}
                          </p>
                        )}

                        {event.changes && (
                          <div className="text-xs text-[var(--font-color)] opacity-70 bg-[var(--bg-simple)] p-2 rounded border border-[var(--border-color)]">
                            <strong>Alterações:</strong> {event.changes}
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs text-[var(--font-color)] opacity-70">
                          <User className="w-3 h-3" />
                          {event.user?.name ||
                            event.user?.email ||
                            "Usuário desconhecido"}
                        </div>
                      </div>
                    </div>

                    {/* Imagens (se houver) */}
                    {event.image_url && event.image_url.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-[var(--border-color)]">
                        <p className="text-xs text-[var(--font-color)] opacity-70 mb-2">
                          Imagens anexadas:
                        </p>
                        <div className="flex gap-2">
                          {event.image_url.slice(0, 3).map((url, idx) => (
                            <div
                              key={idx}
                              className="w-12 h-12 bg-[var(--secondary-color)] rounded border border-[var(--border-color)] flex items-center justify-center"
                            >
                              <span className="text-xs text-[var(--font-color)] opacity-70">
                                IMG
                              </span>
                            </div>
                          ))}
                          {event.image_url.length > 3 && (
                            <div className="w-12 h-12 bg-[var(--secondary-color)] rounded border border-[var(--border-color)] flex items-center justify-center">
                              <span className="text-xs text-[var(--font-color)] opacity-70">
                                +{event.image_url.length - 3}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      ) : (
        <Card className="bg-[var(--card-color)]">
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-[var(--secondary-color)] rounded-full flex items-center justify-center mx-auto">
                <History className="w-8 h-8 text-[var(--font-color)] opacity-50" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--font-color)] mb-2">
                  Nenhum histórico encontrado
                </h3>
                <p className="text-[var(--font-color)] opacity-70">
                  Esta comissão ainda não possui atividades registradas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
