"use client"

import { Progress } from "@/components/ui/progress"
import { FileSpreadsheet, Zap } from "lucide-react"

interface ProcessingIndicatorProps {
  progress: number
  hardwareAcceleration: boolean
  fileName?: string
  message?: string
}

export default function ProcessingIndicator({
  progress,
  hardwareAcceleration,
  fileName,
  message,
}: ProcessingIndicatorProps) {
  return (
    <div className="rounded-lg border border-[var(--border-input)] bg-[var(--card-color)] p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
          <FileSpreadsheet className="h-5 w-5 text-blue-500" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="font-medium text-[var(--font-color)]">
              {message || `Processando ${fileName ? fileName : "arquivo"}`}
            </p>
            {hardwareAcceleration && (
              <div className="flex items-center gap-1 text-xs text-amber-500">
                <Zap className="h-3 w-3" />
                <span>Acelerado</span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between mt-1">
            <Progress value={progress} className="h-2 w-full" />
            <span className="ml-2 text-xs text-[var(--font-color)]/70">{progress}%</span>
          </div>
        </div>
      </div>
      <p className="text-xs text-[var(--font-color)]/70 pl-[52px]">
        {message
          ? "Armazenando dados no navegador..."
          : progress < 30
            ? "Lendo arquivo..."
            : progress < 60
              ? "Convertendo dados..."
              : progress < 90
                ? "Processando registros..."
                : "Finalizando..."}
      </p>
    </div>
  )
}