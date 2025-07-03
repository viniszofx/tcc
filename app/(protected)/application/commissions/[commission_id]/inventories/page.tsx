"use client";

import LoadingScreen from "@/components/custom/loading";
import InventoryPageBase from "@/components/inventories/inventory-page-base";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { useCommission } from "@/hooks/queries/use-commissions-query";
import { useInventoryItems } from "@/hooks/queries/use-inventory-query";
import { useCommissionPermissions } from "@/hooks/use-commission-permissions";
import { useInventoryWithSync } from "@/hooks/use-inventory-query";
import { useInventorySync } from "@/hooks/use-inventory-sync";
import { useUserPermissions } from "@/hooks/use-user-permissions";
import { AlertCircle, Upload, Wifi, WifiOff } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CommissionInventoriesPage() {
  const { user, loading } = useUserPermissions();
  const router = useRouter();
  const params = useParams();
  const commissionId = params.commission_id as string;
  const {
    canAccessCommission,
    canUploadToCommission,
    loading: permissionsLoading,
  } = useCommissionPermissions(commissionId);

  // Estado de conectividade
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

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

  // Hooks de dados - React Query para API e hook customizado para local
  const {
    data: commission,
    isLoading: commissionLoading,
    error: commissionError,
  } = useCommission(commissionId);

  const {
    data: apiInventoryItems = [],
    isLoading: apiInventoryLoading,
    error: apiInventoryError,
  } = useInventoryItems(commissionId);

  // Hook para dados locais (IndexedDB)
  const {
    localData: localInventoryItems,
    metadata: localMetadata,
    isLoading: localLoading,
    syncStatus,
  } = useInventorySync(commissionId);

  // Novo hook com sincronização inteligente
  const {
    data: syncedInventoryItems,
    isLoading: syncedLoading,
    isOnline: syncIsOnline,
    pendingItemsCount,
    localData: syncLocalData,
    serverData: syncServerData,
    metadata: syncMetadata,
  } = useInventoryWithSync(commissionId);

  // Combinar dados usando o hook de sincronização inteligente
  const combinedInventoryItems = syncedInventoryItems || [];
  const totalItems = combinedInventoryItems.length;

  // Determinar fonte de dados para display
  const dataSource = (() => {
    if (syncIsOnline && syncServerData?.length > 0) return "api";
    if (syncLocalData?.length > 0) return "local";
    return "none";
  })();

  useEffect(() => {
    if (!loading && !permissionsLoading && !canAccessCommission) {
      router.push("/application");
    }
  }, [loading, permissionsLoading, canAccessCommission, router]);

  // Loading states
  const isLoading =
    loading ||
    permissionsLoading ||
    commissionLoading ||
    (localLoading && apiInventoryLoading);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!canAccessCommission) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">Acesso negado a esta comissão</p>
        </CardContent>
      </Card>
    );
  }

  if (commissionError) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">
            Erro ao carregar comissão: {(commissionError as Error)?.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status de conectividade e sincronização */}
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

          {syncStatus === "pending" && (
            <div className="flex items-center gap-1 text-orange-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Sync Pendente</span>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            {dataSource === "api" && "Dados da API"}
            {dataSource === "local" && "Dados Locais"}
            {dataSource === "none" && "Sem dados"}
          </div>
        </div>
      </div>

      {/* Alerta se usando dados locais */}
      {dataSource === "local" && (
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
                  Adicione itens individuais ou faça upload de uma planilha para
                  começar.
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

      {/* Barra de ações */}
      <div className="flex items-center gap-2 justify-end">
        {canUploadToCommission && (
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/application/commissions/${commissionId}/upload`)
            }
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload de Planilha
          </Button>
        )}
      </div>

      {/* Componente base com todas as funcionalidades */}
      <InventoryPageBase
        backRoute={`/application/commissions/${commissionId}`}
        errorRoute="/application"
        commissionId={commissionId}
      />
    </div>
  );
}
