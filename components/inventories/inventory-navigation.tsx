"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react"

interface InventoryNavigationProps {
  currentPage: number
  totalPages: number
  showAll: boolean
  goToPrevPage: () => void
  goToNextPage: () => void
  toggleShowAll: () => void
  totalItems: number
}

export default function InventoryNavigation({
  currentPage,
  totalPages,
  showAll,
  goToPrevPage,
  goToNextPage,
  toggleShowAll,
  totalItems,
}: InventoryNavigationProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={goToPrevPage}
          disabled={currentPage === 0 || showAll}
          className="h-8 w-8 border-[var(--border-input)] bg-[var(--card-color)] text-[var(--font-color)] hover:bg-[var(--hover-3-color)] hover:text-white disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Página anterior</span>
        </Button>

        {!showAll && (
          <span className="text-sm text-[var(--font-color)]">
            Página {currentPage + 1} de {totalPages} ({totalItems} itens)
          </span>
        )}

        <Button
          variant="outline"
          size="icon"
          onClick={goToNextPage}
          disabled={currentPage >= totalPages - 1 || showAll}
          className="h-8 w-8 border-[var(--border-input)] bg-[var(--card-color)] text-[var(--font-color)] hover:bg-[var(--hover-3-color)] hover:text-white disabled:opacity-50"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Próxima página</span>
        </Button>
      </div>

      <Button
        variant="outline"
        onClick={toggleShowAll}
        className="flex items-center gap-2 border-[var(--border-input)] bg-[var(--card-color)] text-[var(--font-color)] hover:bg-[var(--hover-3-color)] hover:text-white"
      >
        <LayoutGrid className="h-4 w-4" />
        <span>{showAll ? "Mostrar Paginado" : "Mostrar Tudo"}</span>
      </Button>
    </div>
  )
}