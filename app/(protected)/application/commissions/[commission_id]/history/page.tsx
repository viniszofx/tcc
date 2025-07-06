"use client";

import LoadingScreen from "@/components/custom/loading";
import { PageTitle } from "@/components/custom/page-title";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCommissionHistoryData } from "@/hooks/queries/use-page-data";
import { useUserPermissions } from "@/hooks/use-consolidated-user";
import {
  Calendar,
  Edit,
  Eye,
  FileText,
  Plus,
  Trash2,
  User
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CommissionHistoryPage() {
  const { user, canAccessCommission, loading } = useUserPermissions();
  const router = useRouter();
  const params = useParams();
  const commissionId = params.commission_id as string;

  const { commission, history, isLoading, error } =
    useCommissionHistoryData(commissionId);

  useEffect(() => {
    if (!loading && !canAccessCommission) {
      router.push("/application");
    }
  }, [loading, canAccessCommission, router]);

  if (loading || isLoading) {
    return <LoadingScreen />;
  }

  if (error || !commission) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">
            {error?.message || "Comissão não encontrada"}
          </p>
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

  const parseChanges = (changesString: string) => {
    try {
      return JSON.parse(changesString);
    } catch {
      return null;
    }
  };

  const formatFieldValue = (value: any) => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "boolean") return value ? "Sim" : "Não";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const getRelevantFields = () => [
    { key: "number", label: "Número" },
    { key: "description", label: "Descrição" },
    { key: "brandModel", label: "Marca/Modelo" },
    { key: "currentResponsibility", label: "Responsável Atual" },
    { key: "conservationState", label: "Estado de Conservação" },
    { key: "location", label: "Localização" },
    { key: "sector", label: "Setor" },
  ];

  const renderBeforeAfter = (changes: any) => {
    if (!changes || (!changes.before && !changes.after)) return null;

    const { before, after } = changes;
    const relevantFields = getRelevantFields();

    // Se for criação ou exclusão, mostrar apenas o estado relevante
    if (!before && after) {
      return (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
          <h4 className="text-sm font-medium text-green-800 mb-2">
            Item Criado:
          </h4>
          <div className="space-y-1">
            {relevantFields.map(({ key, label }) => (
              <div key={key} className="text-xs">
                <span className="font-medium text-green-700">{label}:</span>{" "}
                <span className="text-green-800">
                  {formatFieldValue(after[key])}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (before && !after) {
      return (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
          <h4 className="text-sm font-medium text-red-800 mb-2">
            Item Removido:
          </h4>
          <div className="space-y-1">
            {relevantFields.map(({ key, label }) => (
              <div key={key} className="text-xs">
                <span className="font-medium text-red-700">{label}:</span>{" "}
                <span className="text-red-800">
                  {formatFieldValue(before[key])}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Para atualizações, mostrar apenas campos que mudaram
    if (before && after) {
      const changedFields = relevantFields.filter(
        ({ key }) => before[key] !== after[key]
      );

      if (changedFields.length === 0) return null;

      return (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            Alterações:
          </h4>
          <div className="space-y-2">
            {changedFields.map(({ key, label }) => (
              <div key={key} className="text-xs">
                <span className="font-medium text-blue-700">{label}:</span>
                <div className="ml-2 grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-red-600 font-medium">Antes:</span>{" "}
                    <span className="text-red-700">
                      {formatFieldValue(before[key])}
                    </span>
                  </div>
                  <div>
                    <span className="text-green-600 font-medium">Depois:</span>{" "}
                    <span className="text-green-700">
                      {formatFieldValue(after[key])}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <>
      <PageTitle title="Histórico - KDÊ" />
      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-[var(--bg-simple)] shadow-lg border border-[var(--border-color)]">
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
        {sortedHistory.map((event, index) => {
          const ActionIcon = getActionIcon(event.action);
          const isLast = index === sortedHistory.length - 1;

          return (
            <div key={event.id} className="relative">
              {/* Linha conectora */}
              {!isLast && (
                <div className="absolute left-6 top-12 w-0.5 h-16 bg-[var(--border-color)]" />
              )}

              <Card className="bg-[var(--bg-simple)] border-[var(--border-color)] pl-12 relative w-full">
                {/* Ícone da ação */}
                <div className="absolute -left-12 top-4 w-8 h-8 bg-[var(--bg-simple)] border-2 border-[var(--border-color)] rounded-full flex items-center justify-center">
                  <ActionIcon className="w-4 h-4 text-[var(--font-color)]" />
                </div>

                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge
                          className={`${getActionColor(event.action)} border text-xs`}
                        >
                          {getActionText(event.action)}
                        </Badge>
                        <span className="text-xs text-[var(--font-color)] opacity-70 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(event.timestamp)}
                        </span>
                      </div>

                      <h3 className="font-medium text-[var(--font-color)] mb-1 break-words whitespace-pre-line text-sm sm:text-base">
                        {event.inventoryItem?.description || "Item de inventário"}
                      </h3>

                      {event.observation && (
                        <p className="text-sm text-[var(--font-color)] opacity-70 mb-2">
                          {event.observation}
                        </p>
                      )}

                      {/* Exibir alterações estruturadas */}
                      {event.changes && renderBeforeAfter(parseChanges(event.changes))}
                    </div>

                    <div className="text-left sm:text-right mt-2 sm:mt-0">
                      <div className="flex items-center gap-1 text-xs text-[var(--font-color)] opacity-70">
                        <User className="w-3 h-3" />
                        {event.user?.name || event.user?.email || "Usuário desconhecido"}
                      </div>
                    </div>
                  </div>

                  {/* Imagens (se houver) */}
                  {event.image_url && event.image_url.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[var(--border-color)]">
                      <p className="text-xs text-[var(--font-color)] opacity-70 mb-2">
                        Imagens anexadas:
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {event.image_url.slice(0, 3).map((url: string, idx: number) => (
                          <div
                            key={idx}
                            className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--secondary-color)] rounded border border-[var(--border-color)] flex items-center justify-center"
                          >
                            <span className="text-xs text-[var(--font-color)] opacity-70">
                              IMG
                            </span>
                          </div>
                        ))}
                        {event.image_url.length > 3 && (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--secondary-color)] rounded border border-[var(--border-color)] flex items-center justify-center">
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
    </>
  );
}