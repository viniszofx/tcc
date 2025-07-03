"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSmartInventorySync } from "@/hooks/use-smart-inventory-sync";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Cloud,
  CloudOff,
  Database,
  RefreshCw,
  Upload,
} from "lucide-react";

interface SmartInventoryManagerProps {
  commissionId: string;
}

export function SmartInventoryManager({
  commissionId,
}: SmartInventoryManagerProps) {
  const {
    // Dados
    allData,
    syncInfo,

    // Estados
    isLoading,
    isSyncing,
    error,
    lastSync,

    // Ações
    smartSync,
    syncPendingItems,
    forceSync,

    // Informações
    hasPendingItems,
    totalItems,
    syncedItems,
    pendingCount,
  } = useSmartInventorySync(commissionId);

  const getSyncStatusIcon = () => {
    if (isSyncing) return <RefreshCw className="w-4 h-4 animate-spin" />;
    if (hasPendingItems) return <Clock className="w-4 h-4 text-yellow-600" />;
    if (syncInfo?.needsSync)
      return <AlertCircle className="w-4 h-4 text-orange-600" />;
    return <CheckCircle className="w-4 h-4 text-green-600" />;
  };

  const getSyncStatusText = () => {
    if (isSyncing) return "Sincronizando...";
    if (hasPendingItems) return `${pendingCount} itens pendentes`;
    if (syncInfo?.needsSync) return "Precisa sincronizar";
    return "Sincronizado";
  };

  const getSyncStatusColor = () => {
    if (isSyncing) return "bg-blue-100 text-blue-800";
    if (hasPendingItems) return "bg-yellow-100 text-yellow-800";
    if (syncInfo?.needsSync) return "bg-orange-100 text-orange-800";
    return "bg-green-100 text-green-800";
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            Carregando inventário...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status de Sincronização */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Sincronização Inteligente
            </span>
            <Badge className={getSyncStatusColor()}>
              {getSyncStatusIcon()}
              {getSyncStatusText()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Informações de contagem */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {syncedItems}
              </div>
              <div className="text-sm text-gray-600">Sincronizados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {pendingCount}
              </div>
              <div className="text-sm text-gray-600">Pendentes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {totalItems}
              </div>
              <div className="text-sm text-gray-600">Total Local</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {syncInfo?.serverCount || 0}
              </div>
              <div className="text-sm text-gray-600">No Servidor</div>
            </div>
          </div>

          {/* Informações detalhadas */}
          {syncInfo && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Detalhes da Sincronização:</h4>
              <div className="text-sm space-y-1">
                <div>Razão da verificação: {syncInfo.syncReason || "N/A"}</div>
                <div>
                  Última atualização servidor:{" "}
                  {syncInfo.lastServerUpdate?.toLocaleString() || "N/A"}
                </div>
                <div>
                  Última atualização local:{" "}
                  {syncInfo.lastLocalUpdate?.toLocaleString() || "N/A"}
                </div>
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => smartSync()}
              disabled={isSyncing}
              variant="outline"
            >
              <Cloud className="w-4 h-4 mr-2" />
              Verificar Servidor
            </Button>

            <Button onClick={forceSync} disabled={isSyncing} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Forçar Sincronização
            </Button>

            {hasPendingItems && (
              <Button
                onClick={syncPendingItems}
                disabled={isSyncing}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Enviar Pendentes ({pendingCount})
              </Button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Erro:</span>
              </div>
              <div className="text-red-700 mt-1">{error}</div>
            </div>
          )}

          {lastSync && (
            <div className="text-sm text-gray-600">
              Última sincronização: {lastSync.toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Itens */}
      <Card>
        <CardHeader>
          <CardTitle>Itens do Inventário ({totalItems})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {allData.map((item, index) => (
              <div
                key={item.id || index}
                className={`p-3 rounded-lg border ${
                  item.isPending
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {item.NUMERO} - {item.DESCRICAO}
                    </div>
                    <div className="text-sm text-gray-600">
                      {item.MARCA_MODELO} | {item.RESPONSABILIDADE_ATUAL}
                    </div>
                  </div>
                  {item.isPending && (
                    <Badge
                      variant="outline"
                      className="text-yellow-700 border-yellow-300"
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      Pendente
                    </Badge>
                  )}
                </div>
              </div>
            ))}

            {totalItems === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CloudOff className="w-12 h-12 mx-auto mb-2 opacity-50" />
                Nenhum item encontrado
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
