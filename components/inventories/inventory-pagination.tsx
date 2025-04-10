"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react"

interface InventoryPaginationProps {
  currentPage: number
  totalPages: number
  showAll: boolean
  onPageChange: (page: number) => void
  onShowAllToggle: () => void
  totalItems?: number
  itemsPerPage?: number
}

export default function InventoryPagination({
  currentPage,
  totalPages,
  showAll,
  onPageChange,
  onShowAllToggle,
  totalItems,
  itemsPerPage,
}: InventoryPaginationProps) {
  const startItem = currentPage * (itemsPerPage || 0) + 1
  const endItem = Math.min((currentPage + 1) * (itemsPerPage || 0), totalItems || 0)

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0 || showAll}
          className="h-8 w-8 border-[var(--border-input)] bg-[var(--card-color)] text-[var(--font-color)] hover:bg-[var(--hover-3-color)] hover:text-white disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Página anterior</span>
        </Button>

        {!showAll && (
          <span className="text-sm text-[var(--font-color)]">
            Página {currentPage + 1} de {totalPages || 1}
            {totalItems && itemsPerPage && (
              <span className="ml-2 text-xs text-[var(--font-color)]/70">
                ({startItem}-{endItem} de {totalItems.toLocaleString()} registros)
              </span>
            )}
          </span>
        )}

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1 || showAll}
          className="h-8 w-8 border-[var(--border-input)] bg-[var(--card-color)] text-[var(--font-color)] hover:bg-[var(--hover-3-color)] hover:text-white disabled:opacity-50"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Próxima página</span>
        </Button>
      </div>

      <Button
        variant="outline"
        onClick={onShowAllToggle}
        className="flex items-center gap-2 border-[var(--border-input)] bg-[var(--card-color)] text-[var(--font-color)] hover:bg-[var(--hover-3-color)] hover:text-white"
      >
        <LayoutGrid className="h-4 w-4" />
        <span>{showAll ? "Mostrar Paginado" : "Mostrar Tudo"}</span>
      </Button>
    </div>
  )
}