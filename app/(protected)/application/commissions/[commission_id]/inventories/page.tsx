"use client";

import LoadingScreen from "@/components/custom/loading";
import { PageTitle } from "@/components/custom/page-title";
import InventoryPageBase from "@/components/inventories/inventory-page-base";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDeleteCommissionInventory } from "@/hooks/mutations/use-mutations";
import { useCommission } from "@/hooks/queries/use-commissions-query";
import { useCommissionPermissions } from "@/hooks/use-commission-permissions";
import { useUserPermissions } from "@/hooks/use-consolidated-user";
import { useInventoryWithSync } from "@/hooks/use-inventory-query";
import { clearLocalStorage } from "@/utils/storage/local-storage";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Download, Trash2, Wifi, WifiOff } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CommissionInventoriesPage() {
  const router = useRouter();
  const params = useParams();
  const commissionId = params.commission_id as string;
  const queryClient = useQueryClient();

  // Hooks de autenticação e permissões
  const { user, loading } = useUserPermissions();
  const {
    canAccessCommission,
    canManageCommission,
    loading: permissionsLoading,
  } = useCommissionPermissions(commissionId);

  // Hook para apagar inventário
  const deleteInventoryMutation = useDeleteCommissionInventory();
  const [isDeleting, setIsDeleting] = useState(false);

  // Hook principal de dados com sincronização inteligente
  const {
    data: syncedInventoryItems,
    isLoading: syncedLoading,
    isOnline: syncIsOnline,
    pendingItemsCount,
    localData: syncLocalData,
    serverData: syncServerData,
    metadata: syncMetadata,
  } = useInventoryWithSync(commissionId);

  // Hook de dados da comissão
  const {
    data: commission,
    isLoading: commissionLoading,
    error: commissionError,
  } = useCommission(commissionId);

  // Estado de conectividade
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  // Configurar listeners de conectividade
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Redirecionamento para usuários sem acesso
  useEffect(() => {
    if (!loading && !permissionsLoading && !canAccessCommission) {
      router.push("/application");
    }
  }, [loading, permissionsLoading, canAccessCommission, router]);

  // Dados processados
  const combinedInventoryItems = syncedInventoryItems || [];
  const totalItems = combinedInventoryItems.length;
  const localDataValid =
    !syncMetadata?.commissionId || syncMetadata.commissionId === commissionId;

  // Determinar fonte de dados
  const dataSource = (() => {
    if (syncIsOnline && syncServerData?.length > 0) return "api";
    if (syncLocalData?.length > 0 && localDataValid) return "local";
    return "none";
  })();

  // Verificar se o usuário pode apagar inventário (admin global, admin do sistema ou presidente da comissão)
  const canDeleteInventory =
    user &&
    (user.role === "admin global" ||
      user.role === "admin" ||
      canManageCommission);

  // Função para apagar todo o inventário
  const handleDeleteInventory = async () => {
    if (!commission || !canDeleteInventory) return;

    const confirmDelete = confirm(
      `Tem certeza que deseja apagar TODO o inventário da comissão "${commission.name}"?\n\n` +
      "Esta ação irá:\n" +
      "- Excluir permanentemente todos os itens de inventário\n" +
      "- Remover a planilha associada\n" +
      "- Limpar todos os dados de inventário desta comissão\n\n" +
      "Esta ação NÃO PODE ser desfeita!"
    );

    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      await deleteInventoryMutation.mutateAsync(commissionId);

      // Limpar dados locais do cache
      queryClient.invalidateQueries({ queryKey: ["inventory", commissionId] });
      queryClient.removeQueries({ queryKey: ["inventory", commissionId] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });

      // Limpar dados do localStorage
      clearLocalStorage();

      toast.success("Inventário apagado com sucesso!");
    } catch (error) {
      console.error("Erro ao apagar inventário:", error);
      toast.error("Erro ao apagar inventário. Tente novamente.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Estados de carregamento
  const isLoading = loading || permissionsLoading || commissionLoading;

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!canAccessCommission) {
    return (
      <>
        <PageTitle title="Acesso negado - KDÊ" />
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">Acesso negado a esta comissão</p>
          </CardContent>
        </Card>
      </>
    );
  }

  if (commissionError) {
    return (
      <>
        <PageTitle title="Erro - KDÊ" />
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">
              Erro ao carregar comissão: {(commissionError as Error)?.message}
            </p>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageTitle title="Inventário - KDÊ" />
      <div className="space-y-6">
        {/* Cabeçalho da comissão */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {commission && (
              <div>
                <h1 className="text-2xl font-bold">{commission.name}</h1>
                <p className="text-muted-foreground">
                  Inventário • {totalItems} itens
                </p>
              </div>
            )}
          </div>

          {/* Indicadores de status */}
          <div className="flex items-center gap-2">
            {isOnline ? (
              <div className="flex items-center gap-1 text-green-600">
                <Wifi className="w-4 h-4" />
                <span className="text-sm">Online</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600">
                <WifiOff className="w-4 h-4" />
                <span className="text-sm">Offline</span>
              </div>
            )}

            {pendingItemsCount > 0 && (
              <div className="flex items-center gap-1 text-orange-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">
                  {pendingItemsCount} pendente{pendingItemsCount > 1 ? "s" : ""}
                </span>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              {dataSource === "api" && "Dados da API"}
              {dataSource === "local" && "Dados Locais"}
              {dataSource === "none" && "Sem dados"}
            </div>
          </div>
        </div>

        {/* Botão de download da planilha */}
        {commission?.spreadsheet_url && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Planilha de Inventário Disponível
                  </p>
                  <p className="text-xs text-blue-700">
                    Baixe a planilha original enviada para esta comissão
                  </p>
                </div>
                <Button
                  variant="default"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() =>
                    window.open(commission.spreadsheet_url, "_blank")
                  }
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download da Planilha
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botão de apagar inventário - visível apenas para admins e presidentes */}
        {canDeleteInventory && totalItems > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Apagar Todo o Inventário
                  </p>
                  <p className="text-xs text-red-700">
                    Remove permanentemente todos os {totalItems} itens desta
                    comissão
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={handleDeleteInventory}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline ml-2">
                    {isDeleting ? "Apagando..." : "Apagar Inventário"}
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alerta se dados locais não pertencem à comissão atual */}
        {syncLocalData?.length > 0 && !localDataValid && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Dados locais de comissão diferente detectados
                  </p>
                  <p className="text-xs text-red-700">
                    Os dados armazenados localmente pertencem a outra comissão (
                    {syncMetadata?.commissionId}). Para evitar conflitos, eles
                    foram ocultados.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alerta se usando dados locais */}
        {dataSource === "local" && localDataValid && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-orange-800">
                    Exibindo dados locais
                  </p>
                  <p className="text-xs text-orange-700">
                    Os dados foram carregados do armazenamento local.{" "}
                    {isOnline
                      ? "Sincronização em andamento..."
                      : "Conecte-se à internet para sincronizar."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alerta se não há dados */}
        {dataSource === "none" && totalItems === 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Nenhum item de inventário encontrado
                  </p>
                  <p className="text-xs text-blue-700">
                    Adicione itens individuais ou faça upload de uma planilha
                    para começar.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status de sincronização */}
        {pendingItemsCount > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    {pendingItemsCount} item{pendingItemsCount > 1 ? "s" : ""}{" "}
                    aguardando sincronização
                  </p>
                  <p className="text-xs text-yellow-700">
                    {syncIsOnline
                      ? "Sincronização em andamento..."
                      : "Conecte-se à internet para sincronizar."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Componente base com todas as funcionalidades */}
        <InventoryPageBase
          backRoute={`/application/commissions/${commissionId}`}
          errorRoute="/application"
          commissionId={commissionId}
        />
      </div>
    </>
  );
}
