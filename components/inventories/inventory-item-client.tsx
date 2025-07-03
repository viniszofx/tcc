"use client";

import LoadingScreen from "@/components/custom/loading";
import DeleteItemModal from "@/components/inventories/delete-item-modal";
import EditItemModal from "@/components/inventories/edit-item-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  useDeleteInventoryItem,
  useUpdateInventoryItem,
} from "@/hooks/mutations/use-mutations";
import { useCommissionPermissions } from "@/hooks/use-commission-permissions";
import { useHybridInventoryItem } from "@/hooks/use-hybrid-inventory-item";
import { useSmartNavigation } from "@/hooks/use-smart-navigation";
import type { InventoryItemWithRelations } from "@/interface";
import { formatDate } from "@/utils/data-utils";
import { Edit, Trash2, Wifi, WifiOff } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface InventoryItemClientProps {
  id: string;
  commissionId?: string;
  basePath: string;
  backButtonText?: string;
}

export default function InventoryItemClient({
  id,
  commissionId: propCommissionId,
  basePath,
  backButtonText = "Voltar para Inventário",
}: InventoryItemClientProps) {
  const router = useRouter();
  const { navigateTo } = useSmartNavigation();
  const params = useParams();
  const commissionId = propCommissionId || params?.commission_id;

  // Usar hook híbrido que funciona online e offline
  const {
    item,
    isLoading: itemLoading,
    error: itemError,
    isOfflineMode,
    hasLocalData,
    refetch: refetchItem,
  } = useHybridInventoryItem({
    itemId: id,
    commissionId: commissionId as string,
    campusId: "unknown", // Será inferido do contexto da comissão
    allowOfflineAccess: true,
  });

  // Mutations para operações no inventário
  const updateItemMutation = useUpdateInventoryItem();
  const deleteItemMutation = useDeleteInventoryItem();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Permission checking for commission access
  const {
    canAccessCommission,
    loading: permissionsLoading,
    error: permissionsError,
  } = useCommissionPermissions(commissionId as string);

  const getBackUrl = () => {
    if (commissionId) {
      return `${basePath}/${commissionId}/inventories`;
    }
    return `${basePath}/inventories`;
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!permissionsLoading && !canAccessCommission && commissionId) {
      navigateTo("/application");
    }
  }, [permissionsLoading, canAccessCommission, commissionId, navigateTo]);

  const handleSaveItem = async (updatedItem: InventoryItemWithRelations) => {
    try {
      await updateItemMutation.mutateAsync(updatedItem);
      setEditModalOpen(false);
    } catch (error) {
      console.error("Error saving item:", error);
      alert("Erro ao salvar item. Verifique o console para mais detalhes.");
    }
  };

  const handleDeleteItem = async () => {
    if (!item) return;

    try {
      await deleteItemMutation.mutateAsync(item.id);
      setDeleteModalOpen(false);
      navigateTo(getBackUrl());
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Erro ao excluir item");
    }
  };

  const truncateDescription = (description: string) => {
    const index = description.indexOf("[");
    return index >= 0 ? description.substring(0, index).trim() : description;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ATIVO":
      case "Ativo":
        return "bg-green-500";
      case "EM_USO":
      case "Em Manutenção":
        return "bg-amber-500";
      case "BAIXA_SOLICITADA":
      case "Inativo":
        return "bg-gray-500";
      case "BAIXADO":
      case "Baixado":
        return "bg-red-500";
      case "Transferido":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  if (itemLoading || permissionsLoading) {
    return <LoadingScreen />;
  }

  if (permissionsError || (!canAccessCommission && commissionId)) {
    return (
      <Card className="w-full bg-[var(--bg-simple)] shadow-md mx-auto">
        <CardContent className="p-4 sm:p-8 text-center">
          <h2 className="text-lg sm:text-xl font-bold text-[var(--font-color)]">
            Acesso negado
          </h2>
          <p className="text-[var(--font-color)]/70 mt-2 text-sm sm:text-base">
            Você não tem permissão para acessar este item.
          </p>
          <Button
            className="mt-4 bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white text-sm sm:text-base"
            onClick={() => navigateTo("/application")}
          >
            Voltar ao Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!item) {
    return (
      <Card className="w-full bg-[var(--bg-simple)] shadow-md mx-auto">
        <CardContent className="p-4 sm:p-8 text-center">
          <h2 className="text-lg sm:text-xl font-bold text-[var(--font-color)]">
            Item não encontrado
          </h2>
          <p className="text-[var(--font-color)]/70 mt-2 text-sm sm:text-base">
            O item que você está procurando não existe ou foi removido.
          </p>
          <Button
            className="mt-4 bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white text-sm sm:text-base"
            onClick={() => navigateTo(getBackUrl())}
          >
            {backButtonText}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-md lg:max-w-5xl xl:max-w-6xl mx-auto">
        <CardHeader className="pb-2 px-4 sm:px-6">
          {/* Indicador de Status Online/Offline */}
          {isOfflineMode && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 text-amber-800">
                <WifiOff className="h-4 w-4" />
                <span className="text-sm font-medium">Modo Offline</span>
              </div>
              <p className="text-xs text-amber-700 mt-1">
                Visualizando dados salvos localmente. Algumas funcionalidades
                podem estar limitadas.
                {hasLocalData && (
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto ml-2 text-amber-700 underline"
                    onClick={refetchItem}
                  >
                    Tentar reconectar
                  </Button>
                )}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 justify-end sm:justify-normal">
              <Button
                variant="outline"
                className="flex items-center gap-2 border-[var(--border-input)] bg-[var(--card-color)] text-[var(--font-color)] hover:bg-[var(--hover-color)] hover:text-white cursor-pointer p-2 h-8 sm:h-10"
                onClick={() => setEditModalOpen(true)}
                disabled={isOfflineMode} // Desabilitar edição em modo offline
              >
                <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Editar</span>
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2 border-[var(--border-input)] bg-[var(--card-color)] text-red-500 hover:bg-red-500 hover:text-white cursor-pointer p-2 h-8 sm:h-10"
                onClick={() => setDeleteModalOpen(true)}
                disabled={isOfflineMode} // Desabilitar exclusão em modo offline}
              >
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Excluir</span>
              </Button>
            </div>
          </div>
          <CardTitle className="mt-4 text-lg font-bold text-[var(--font-color)] sm:text-xl md:text-2xl lg:text-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span>{item.description}</span>

              {/* Status do item */}
              <Badge className="bg-green-500 text-white text-xs sm:text-sm">
                ATIVO
              </Badge>

              {/* Indicador de status de conexão */}
              {isOfflineMode ? (
                <Badge
                  variant="outline"
                  className="border-amber-500 text-amber-700 text-xs"
                >
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="border-green-500 text-green-700 text-xs"
                >
                  <Wifi className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 sm:gap-6 px-4 sm:px-6">
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
            <Card className="border-[var(--border-input)] bg-[var(--card-color)]">
              <CardHeader className="pb-2 px-4 sm:px-6 py-3">
                <CardTitle className="text-base sm:text-lg font-semibold text-[var(--font-color)]">
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-[var(--font-color)] px-4 sm:px-6 pb-4">
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="font-medium">Número:</span>
                  <span>{item.number}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="font-medium">Marca/Modelo:</span>
                  <span>{item.brandModel || "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="font-medium">Estado de Conservação:</span>
                  <span>{item.conservationState || "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="font-medium">Última Atualização:</span>
                  <span>{formatDate(item.updatedAt)}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="font-medium">Atualizado por:</span>
                  <span>N/A</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[var(--border-input)] bg-[var(--card-color)]">
              <CardHeader className="pb-2 px-4 sm:px-6 py-3">
                <CardTitle className="text-base sm:text-lg font-semibold text-[var(--font-color)]">
                  Localização e Responsabilidade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-[var(--font-color)] px-4 sm:px-6 pb-4">
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="font-medium">Campus:</span>
                  <span>{item.campus?.name || "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="font-medium">Sala:</span>
                  <span>{item.location || "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="font-medium">Responsável:</span>
                  <span>{item.currentResponsibility || "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="font-medium">Setor:</span>
                  <span>{item.sector || "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="font-medium">ED:</span>
                  <span>{item.ed || "N/A"}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-[var(--border-input)] bg-[var(--card-color)]">
            <CardHeader className="pb-2 px-4 sm:px-6 py-3">
              <CardTitle className="text-base sm:text-lg font-semibold text-[var(--font-color)]">
                Descrição e Detalhes
              </CardTitle>
            </CardHeader>
            <CardContent className="text-[var(--font-color)] px-4 sm:px-6 pb-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1 text-sm sm:text-base">
                    Descrição Principal
                  </h3>
                  <p className="text-sm sm:text-base">{item.description}</p>
                </div>
                <Separator className="bg-[var(--border-input)]" />
                <div>
                  <h3 className="font-medium mb-1 text-sm sm:text-base">
                    Rótulos
                  </h3>
                  <p className="text-sm sm:text-base">
                    {item.tags?.join(", ") || "Nenhum rótulo definido"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[var(--border-input)] bg-[var(--card-color)]">
            <CardHeader className="pb-2 px-4 sm:px-6 py-3">
              <CardTitle className="text-base sm:text-lg font-semibold text-[var(--font-color)]">
                Informações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-[var(--font-color)] px-4 sm:px-6 pb-4">
              <div className="flex justify-between text-sm sm:text-base">
                <span className="font-medium">ID do Bem:</span>
                <span>{item.id}</span>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {isMounted && (
        <>
          <EditItemModal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            onSave={handleSaveItem}
            item={item}
          />

          <DeleteItemModal
            isOpen={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            onConfirm={handleDeleteItem}
            itemName={item?.description}
          />
        </>
      )}
    </>
  );
}
