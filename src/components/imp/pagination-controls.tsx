import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  showAll: boolean
  onPreviousPage: () => void
  onNextPage: () => void
  onToggleShowAll: () => void
  isLoadingAll?: boolean
  loadedItems?: number
  totalItems?: number
}

export function PaginationControls({
  currentPage,
  totalPages,
  showAll,
  onPreviousPage,
  onNextPage,
  onToggleShowAll,
  isLoadingAll = false,
  loadedItems,
  totalItems,
}: PaginationControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={onPreviousPage}
        disabled={currentPage === 1 || showAll}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Página anterior</span>
      </Button>
      {!showAll && (
        <div className="text-sm font-medium">
          {currentPage}/{totalPages}
        </div>
      )}
      <Button
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={onNextPage}
        disabled={currentPage === totalPages || showAll}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Próxima página</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="hidden sm:flex h-8 min-w-[140px] items-center justify-center"
        onClick={onToggleShowAll}
        disabled={isLoadingAll}
      >
        {isLoadingAll ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Carregando...
          </>
        ) : showAll ? (
          <>
            Mostrar paginado
            {loadedItems && totalItems && (
              <span className="ml-2 text-xs text-muted-foreground">
                ({loadedItems}/{totalItems})
              </span>
            )}
          </>
        ) : (
          "Mostrar tudo"
        )}
      </Button>
    </div>
  )
}

