"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  FileText,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";

interface SyncStatus {
  commission: {
    id: string;
    name: string;
    hasSpreadsheet: boolean;
    spreadsheetUrl: string | null;
    lastUpdated: string;
  };
  inventory: {
    count: number;
    lastSync: string | null;
    lastAction: string | null;
  };
  status: {
    isConfigured: boolean;
    hasSyncedData: boolean;
    isReady: boolean;
  };
}

interface SyncStatusDisplayProps {
  commissionId: string;
  autoRefresh?: boolean;
  onRefresh?: () => void;
}

export default function SyncStatusDisplay({
  commissionId,
  autoRefresh = false,
  onRefresh,
}: SyncStatusDisplayProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSyncStatus = async () => {
    try {
      setError(null);
      const response = await fetch(
        `/api/commission/sync-status?commissionId=${commissionId}`
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar status de sincronização");
      }

      const data = await response.json();
      setSyncStatus(data);
    } catch (err) {
      console.error("Erro ao buscar status:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSyncStatus();

    if (autoRefresh) {
      const interval = setInterval(fetchSyncStatus, 30000); // Atualizar a cada 30 segundos
      return () => clearInterval(interval);
    }
  }, [commissionId, autoRefresh]);

  const handleRefresh = () => {
    setLoading(true);
    fetchSyncStatus();
    onRefresh?.();
  };

  const getStatusBadge = () => {
    if (!syncStatus) return null;

    if (syncStatus.status.isReady) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Configurado
        </Badge>
      );
    }

    if (syncStatus.status.isConfigured && !syncStatus.status.hasSyncedData) {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Aguardando Dados
        </Badge>
      );
    }

    return (
      <Badge variant="destructive" className="bg-red-100 text-red-800">
        <AlertCircle className="w-3 h-3 mr-1" />
        Não Configurado
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
            <span>Carregando status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!syncStatus) return null;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">
          Status de Sincronização
        </CardTitle>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <Button onClick={handleRefresh} variant="ghost" size="sm">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Informações da Comissão */}
        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-2">Comissão</h4>
          <div className="flex items-center justify-between">
            <span className="text-sm">{syncStatus.commission.name}</span>
            <span className="text-xs text-gray-500">
              {new Date(syncStatus.commission.lastUpdated).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Status da Planilha */}
        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-2">Planilha</h4>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-500" />
            {syncStatus.commission.hasSpreadsheet ? (
              <span className="text-sm text-green-600">
                ✓ Arquivo carregado
              </span>
            ) : (
              <span className="text-sm text-gray-500">Nenhum arquivo</span>
            )}
          </div>
        </div>

        {/* Status do Inventário */}
        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-2">Inventário</h4>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-gray-500" />
            <span className="text-sm">
              {syncStatus.inventory.count > 0
                ? `${syncStatus.inventory.count} itens sincronizados`
                : "Nenhum item sincronizado"}
            </span>
          </div>
          {syncStatus.inventory.lastSync && (
            <p className="text-xs text-gray-500 mt-1">
              Última sincronização:{" "}
              {new Date(syncStatus.inventory.lastSync).toLocaleString()}
            </p>
          )}
        </div>

        {/* Ações baseadas no status */}
        {!syncStatus.status.isConfigured && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              Para começar, faça o upload de uma planilha de inventário.
            </p>
          </div>
        )}

        {syncStatus.status.isConfigured && !syncStatus.status.hasSyncedData && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <Clock className="w-4 h-4 inline mr-1" />
              Planilha carregada. Aguardando processamento dos dados.
            </p>
          </div>
        )}

        {syncStatus.status.isReady && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              <CheckCircle className="w-4 h-4 inline mr-1" />
              Sistema configurado e funcionando corretamente.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
