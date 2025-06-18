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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0 || showAll}
          className="h-8 w-8 border-[var(--border-input)] bg-[var(--card-color)] text-[var(--font-color)] hover:bg-[var(--hover-3-color)] hover:text-white disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {!showAll && (
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
            <span className="text-xs sm:text-sm text-[var(--font-color)] whitespace-nowrap">
              Página {currentPage + 1} de {totalPages || 1}
            </span>
            {totalItems && itemsPerPage && (
              <span className="text-xs text-[var(--font-color)]/70 whitespace-nowrap">
                ({startItem}-{endItem} de {totalItems > 1000 ? `${Math.floor(totalItems/1000)}k` : totalItems})
              </span>
            )}
          </div>
        )}

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1 || showAll}
          className="h-8 w-8 border-[var(--border-input)] bg-[var(--card-color)] text-[var(--font-color)] hover:bg-[var(--hover-3-color)] hover:text-white disabled:opacity-50"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <Button
        variant="outline"
        onClick={onShowAllToggle}
        className="w-full sm:w-auto flex items-center gap-2 border-[var(--border-input)] bg-[var(--card-color)] text-[var(--font-color)] hover:bg-[var(--hover-3-color)] hover:text-white text-xs sm:text-sm"
      >
        <LayoutGrid className="h-4 w-4" />
        <span>{showAll ? "Paginado" : "Mostrar Tudo"}</span>
      </Button>
    </div>
  )
}