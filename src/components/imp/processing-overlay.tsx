"use client"

import type React from "react"

import { LoadingSpinner } from "@/components/loading-spinner"
import { Progress } from "@/components/ui/progress"
import { Card } from "@/components/ui/card"

interface ProcessingOverlayProps {
  isVisible: boolean
  progress?: number
  processingText?: string
  hardwareAccelerated?: boolean
  children?: React.ReactNode
}

export function ProcessingOverlay({
  isVisible,
  progress,
  processingText = "Processando dados...",
  hardwareAccelerated = false,
  children,
}: ProcessingOverlayProps) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-md p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <LoadingSpinner size="lg" />

          <div className="space-y-2 w-full">
            <h3 className="text-lg font-semibold">{processingText}</h3>

            {hardwareAccelerated && (
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800 border-green-200">
                Aceleração de hardware ativada
              </div>
            )}

            {children}

            {progress !== undefined && !children && (
              <div className="space-y-1 w-full">
                <Progress value={progress} className="h-2 w-full" />
                <p className="text-xs text-muted-foreground">{Math.round(progress)}% concluído</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

