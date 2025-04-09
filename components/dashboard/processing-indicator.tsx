"use client"

import { useEffect, useState } from "react"

interface ProcessingIndicatorProps {
  progress: number
  hardwareAcceleration: boolean
  fileName?: string
}

export default function ProcessingIndicator({ progress, hardwareAcceleration, fileName }: ProcessingIndicatorProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress)
    }, 100)
    return () => clearTimeout(timer)
  }, [progress])

  return (
    <div className="mt-4 overflow-hidden rounded-xl bg-[var(--card-color)] p-6 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-medium text-[var(--font-color)]">Processando {fileName ? fileName : "arquivo"}</h3>
        <span className="rounded-full bg-[var(--button-color)]/10 px-3 py-1 text-sm font-medium text-[var(--button-color)]">
          {progress}%
        </span>
      </div>

      <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-[var(--bg-simple)]">
        <div
          className="h-full bg-[var(--button-color)] transition-all duration-700 ease-out"
          style={{ width: `${animatedProgress}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-[var(--font-color)]/60">
        <span>Modo: {hardwareAcceleration ? "Acelerado ⚡" : "Normal"}</span>
        <span>Tempo estimado: {hardwareAcceleration ? "~30 segundos" : "~1 minuto"}</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 w-1.5 rounded-full ${
              i < Math.ceil(progress / 20) ? "bg-[var(--button-color)]" : "bg-[var(--bg-simple)]"
            }`}
          />
        ))}
      </div>
    </div>
  )
}