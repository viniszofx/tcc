"use client";

import DeleteItemModal from "@/components/inventories/delete-item-modal";
import EditItemModal from "@/components/inventories/edit-item-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { BemCopia } from "@/lib/interface";
import { getProcessedData, saveProcessedData } from "@/utils/data-storage";
import { formatDate } from "@/utils/data-utils";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface InventoryItemClientProps {
  id: string;
  commissionId?: string;
}

export default function InventoryItemClient({
  id,
  commissionId: propCommissionId,
}: InventoryItemClientProps) {
  const router = useRouter();
  const params = useParams();
  const [item, setItem] = useState<BemCopia | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [inventoryData, setInventoryData] = useState<BemCopia[]>([]);
  const commissionId = propCommissionId || params?.commission_id;
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    async function loadItem() {
      setLoading(true);
      try {
        const { data } = await getProcessedData();
        setInventoryData(data);
        const foundItem = data.find(
          (item) => item.bem_id === id || item.NUMERO === id
        );

        if (foundItem) {
          setItem(foundItem);
        } else {
          router.push(`/admin/comissions/${commissionId}/inventories`);
        }
      } catch (error) {
        console.error("Error loading item:", error);
        router.push(`/admin/comissions/${commissionId}/inventories`);
      } finally {
        setLoading(false);
      }
    }

    loadItem();
  }, [id, router, commissionId]);

  const handleSaveItem = async (updatedItem: BemCopia) => {
    try {
      const updatedData = inventoryData.map(item =>
        item.bem_id === updatedItem.bem_id ? updatedItem : item
      );

      await saveProcessedData(updatedData, {
        recordCount: updatedData.length,
        timestamp: new Date().toISOString(),
        fileName: "inventory_update.json",
        usedAcceleration: false
      });

      setItem(updatedItem);
      setInventoryData(updatedData);
      setEditModalOpen(false);
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  const handleDeleteItem = async () => {
    if (!item) return;

    try {
      const updatedData = inventoryData.filter(i => i.bem_id !== item.bem_id);

      await saveProcessedData(updatedData, {
        recordCount: updatedData.length,
        timestamp: new Date().toISOString(),
        fileName: "inventory_update.json",
        usedAcceleration: false
      });

      setDeleteModalOpen(false);
      router.push(`/admin/comissions/${commissionId}/inventories`);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
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

  if (loading) {
    return (
      <Card className="w-full bg-[var(--bg-simple)] shadow-md mx-auto">
        <CardContent className="p-4 sm:p-8 flex justify-center items-center">
          <div className="animate-pulse flex flex-col gap-4 w-full">
            <div className="h-8 bg-[var(--card-color)] rounded w-1/3"></div>
            <div className="h-6 bg-[var(--card-color)] rounded w-full"></div>
            <div className="h-40 bg-[var(--card-color)] rounded w-full"></div>
            <div className="h-40 bg-[var(--card-color)] rounded w-full"></div>
          </div>
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
            onClick={() => router.push(`/admin/comissions/${commissionId}/inventories`)}
          >
            Voltar para Inventário
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-md lg:max-w-5xl xl:max-w-6xl mx-auto">
        <CardHeader className="pb-2 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-[var(--font-color)] hover:bg-[var(--hover-2-color)] hover:text-white cursor-pointer p-0 sm:p-2"
              onClick={() => router.push(`/admin/comissions/${commissionId}/inventories`)}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm sm:text-base">Voltar para Inventário</span>
            </Button>
            <div className="flex items-center gap-2 justify-end sm:justify-normal">
              <Button
                variant="outline"
                className="flex items-center gap-2 border-[var(--border-input)] bg-[var(--card-color)] text-[var(--font-color)] hover:bg-[var(--hover-color)] hover:text-white cursor-pointer p-2 h-8 sm:h-10"
                onClick={() => setEditModalOpen(true)}
              >
                <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Editar</span>
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2 border-[var(--border-input)] bg-[var(--card-color)] text-red-500 hover:bg-red-500 hover:text-white cursor-pointer p-2 h-8 sm:h-10"
                onClick={() => setDeleteModalOpen(true)}
              >
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Excluir</span>
              </Button>
            </div>
          </div>
          <CardTitle className="mt-4 text-lg font-bold text-[var(--font-color)] sm:text-xl md:text-2xl lg:text-3xl">
            {item.DESCRICAO}
            <Badge className={`ml-2 sm:ml-4 ${getStatusColor(item.STATUS)} text-white text-xs sm:text-sm`}>
              {item.STATUS}
            </Badge>
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
                  <span>{item.NUMERO}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="font-medium">Marca/Modelo:</span>
                  <span>{item.MARCA_MODELO}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="font-medium">Estado de Conservação:</span>
                  <span>{item.ESTADO_DE_CONSERVACAO}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="font-medium">Última Atualização:</span>
                  <span>{formatDate(item.data_ultima_atualizacao)}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="font-medium">Atualizado por:</span>
                  <span>{item.ultimo_atualizado_por || "N/A"}</span>
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
                  <span>{item.CAMPUS_DA_LOTACAO_DO_BEM || "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="font-medium">Sala:</span>
                  <span>{item.SALA || "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="font-medium">Responsável:</span>
                  <span>{item.RESPONSABILIDADE_ATUAL || "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="font-medium">Setor:</span>
                  <span>{item.SETOR_DO_RESPONSAVEL || "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="font-medium">ED:</span>
                  <span>{item.ED || "N/A"}</span>
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
                  <h3 className="font-medium mb-1 text-sm sm:text-base">Descrição Principal</h3>
                  <p className="text-sm sm:text-base">{item.DESCRICAO_PRINCIPAL || item.DESCRICAO}</p>
                </div>
                <Separator className="bg-[var(--border-input)]" />
                <div>
                  <h3 className="font-medium mb-1 text-sm sm:text-base">Rótulos</h3>
                  <p className="text-sm sm:text-base">{item.ROTULOS || "Nenhum rótulo definido"}</p>
                </div>
                {item.observacoes && (
                  <>
                    <Separator className="bg-[var(--border-input)]" />
                    <div>
                      <h3 className="font-medium mb-1 text-sm sm:text-base">Observações</h3>
                      <p className="text-sm sm:text-base">{item.observacoes}</p>
                    </div>
                  </>
                )}
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
                <span>{item.bem_id}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base">
                <span className="font-medium">ID do Inventário:</span>
                <span>{item.inventario_id}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base">
                <span className="font-medium">ID do Grupo:</span>
                <span>{item.grupo_id}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base">
                <span className="font-medium">ID do Campus:</span>
                <span>{item.campus_id}</span>
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
            inventoryData={inventoryData}
          />

          <DeleteItemModal
            isOpen={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            onConfirm={handleDeleteItem}
            itemName={item?.DESCRICAO}
          />
        </>
      )}
    </>
  );
}