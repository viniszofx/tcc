"use client"

import { AlertCircle, AlertTriangle } from "lucide-react"

interface ErrorDisplayProps {
  type: "error" | "warning"
  title: string
  message: string
  suggestion?: string
}

export default function ErrorDisplay({ type, title, message, suggestion }: ErrorDisplayProps) {
  return (
    <div
      className={`rounded-lg p-4 ${
        type === "error" ? "bg-red-500/10 border border-red-500/20" : "bg-amber-500/10 border border-amber-500/20"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full ${
            type === "error" ? "bg-red-500/20 text-red-500" : "bg-amber-500/20 text-amber-500"
          }`}
        >
          {type === "error" ? <AlertCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
        </div>
        <div>
          <h3 className={`font-medium ${type === "error" ? "text-red-500" : "text-amber-500"}`}>{title}</h3>
          <p className="mt-1 text-sm text-[var(--font-color)]/90">{message}</p>
          {suggestion && <p className="mt-2 text-xs text-[var(--font-color)]/70">{suggestion}</p>}
        </div>
      </div>
    </div>
  )
}