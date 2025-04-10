import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatDateTime } from "@/utils/data-utils"
import { Database, FileSpreadsheet, Zap } from "lucide-react"

interface InventoryMetadataProps {
  metadata: {
    fileName: string
    timestamp: string
    recordCount: number
    usedAcceleration: boolean
  } | null
}

export default function InventoryMetadata({ metadata }: InventoryMetadataProps) {
  if (!metadata) return null

  return (
    <Card className="border-[var(--border-input)] bg-[var(--card-color)]">
      <CardContent className="p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-[var(--font-color)]" />
            <span className="font-medium text-[var(--font-color)]">{metadata.fileName}</span>
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
  )
}