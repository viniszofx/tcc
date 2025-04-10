"use client"

import { Button } from "@/components/ui/button"
import { FileJson, FilePlus, FileSpreadsheet, FileText } from "lucide-react"

interface InventoryActionsProps {
  onExport: (format: "csv" | "json" | "pdf") => void
  onNewItem: () => void
  hasData: boolean
}

export default function InventoryActions({ onExport, onNewItem, hasData }: InventoryActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={() => onExport("csv")}
        variant="outline"
        disabled={!hasData}
        className="flex items-center gap-2 border-[var(--border-input)] bg-[var(--card-color)] text-[var(--font-color)] hover:bg-[var(--hover-3-color)] hover:text-white disabled:opacity-50"
      >
        <FileSpreadsheet className="h-4 w-4" />
        <span className="hidden sm:inline">Exportar</span> CSV
      </Button>
      <Button
        onClick={() => onExport("json")}
        variant="outline"
        disabled={!hasData}
        className="flex items-center gap-2 border-[var(--border-input)] bg-[var(--card-color)] text-[var(--font-color)] hover:bg-[var(--hover-3-color)] hover:text-white disabled:opacity-50"
      >
        <FileJson className="h-4 w-4" />
        <span className="hidden sm:inline">Exportar</span> JSON
      </Button>
      <Button
        onClick={() => onExport("pdf")}
        variant="outline"
        disabled={!hasData}
        className="flex items-center gap-2 border-[var(--border-input)] bg-[var(--card-color)] text-[var(--font-color)] hover:bg-[var(--hover-3-color)] hover:text-white disabled:opacity-50"
      >
        <FileText className="h-4 w-4" />
        <span className="hidden sm:inline">Exportar</span> PDF
      </Button>
      <Button
        onClick={onNewItem}
        className="flex items-center gap-2 bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white"
      >
        <FilePlus className="h-4 w-4" />
        <span>Novo Item</span>
      </Button>
    </div>
  )
}