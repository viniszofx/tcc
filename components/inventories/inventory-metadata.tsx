import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/utils/data-utils";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  FileSpreadsheet,
  Zap,
} from "lucide-react";

interface InventoryMetadataProps {
  metadata: {
    fileName: string;
    timestamp: string;
    recordCount: number;
    usedAcceleration: boolean;
    syncStatus?: "synced" | "pending" | "error" | "unknown" | "syncing";
    syncedAt?: string;
    lastSyncError?: string;
    lastSyncUpdate?: string;
    commissionId?: string;
  } | null;
}

export default function InventoryMetadata({
  metadata,
}: InventoryMetadataProps) {
  if (!metadata) return null;

  const getSyncStatusBadge = () => {
    const status = metadata.syncStatus || "pending";

    switch (status) {
      case "synced":
        return (
          <Badge
            variant="outline"
            className="flex items-center gap-1 border-green-500/20 bg-green-500/10 text-green-600"
          >
            <CheckCircle className="h-3 w-3" />
            <span>Sincronizado</span>
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="flex items-center gap-1 border-yellow-500/20 bg-yellow-500/10 text-yellow-600"
          >
            <Clock className="h-3 w-3" />
            <span>Pendente</span>
          </Badge>
        );
      case "syncing":
        return (
          <Badge
            variant="outline"
            className="flex items-center gap-1 border-blue-500/20 bg-blue-500/10 text-blue-600"
          >
            <Clock className="h-3 w-3 animate-spin" />
            <span>Sincronizando</span>
          </Badge>
        );
      case "error":
        return (
          <Badge
            variant="outline"
            className="flex items-center gap-1 border-red-500/20 bg-red-500/10 text-red-600"
          >
            <AlertCircle className="h-3 w-3" />
            <span>Erro</span>
          </Badge>
        );
      case "unknown":
      default:
        return (
          <Badge
            variant="outline"
            className="flex items-center gap-1 border-gray-500/20 bg-gray-500/10 text-gray-600"
          >
            <AlertCircle className="h-3 w-3" />
            <span>Desconhecido</span>
          </Badge>
        );
    }
  };

  return (
    <Card className="border-[var(--border-input)] bg-[var(--card-color)]">
      <CardContent className="p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-[var(--font-color)]" />
            <span className="font-medium text-[var(--font-color)]">
              {metadata.fileName}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="flex items-center gap-1 border-[var(--border-input)] text-[var(--font-color)]"
            >
              <Database className="h-3 w-3" />
              <span>{metadata.recordCount.toLocaleString()} registros</span>
            </Badge>

            {metadata.usedAcceleration && (
              <Badge
                variant="outline"
                className="flex items-center gap-1 border-[var(--border-input)] bg-amber-500/10 text-amber-500"
              >
                <Zap className="h-3 w-3" />
                <span>Aceleração de Hardware</span>
              </Badge>
            )}

            {getSyncStatusBadge()}

            <Badge
              variant="outline"
              className="flex items-center gap-1 border-[var(--border-input)] text-[var(--font-color)]"
            >
              <span>Processado em: {formatDateTime(metadata.timestamp)}</span>
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
