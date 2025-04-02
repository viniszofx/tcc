"use client"

import type React from "react"

import { useState, useEffect, useCallback, useMemo } from "react"
import { ChevronDown, ChevronUp, ChevronsUpDown, Search, Settings2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PaginationControls } from "@/components/pagination-controls"
import { usePaginatedData } from "@/lib/hooks/use-paginated-data"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useColumnsState } from "@/lib/hooks/use-columns-state"
import { useDrag, useDrop } from "react-dnd"
import { exportToPDF } from "@/lib/pdf-export"
import { useAuth } from "@/lib/hooks/use-auth"
import { useInView } from "react-intersection-observer"
import { useVirtualizer } from "@tanstack/react-virtual"

interface DataTableProps {
  data: any[]
}

const VISIBLE_COLUMNS_KEY = "saturn:visible-columns"

export function DataTable({ data }: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [groupByColumn, setGroupByColumn] = useState<string | null>(null)
  const [groupValue, setGroupValue] = useState<string | null>(null)
  const [isLoadingAll, setIsLoadingAll] = useState(false)

  // Use apenas o columnsState para gerenciar as colunas visíveis
  const columnsState = useColumnsState()
  const { user } = useAuth()

  // Inicializa as colunas no mount
  useEffect(() => {
    if (data && data.length > 0) {
      columnsState.setColumns(Object.keys(data[0]))
    }
  }, [data, columnsState])

  // Obter todas as colunas e colunas visíveis
  const allColumns = useMemo(() => columnsState.getAllColumns(), [columnsState])
  const visibleColumns = useMemo(() => allColumns.filter((col) => col.isVisible), [allColumns])

  // Memoize filtered data - agora usando todas as colunas para busca
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      if (!searchTerm) return true
      return allColumns.some(
        (col) => row[col.key] && row[col.key].toString().toLowerCase().includes(searchTerm.toLowerCase()),
      )
    })
  }, [data, allColumns, searchTerm])

  // Memoize sorted data
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      if (!sortColumn) return 0

      const aValue = a[sortColumn]
      const bValue = b[sortColumn]

      if (aValue === bValue) return 0

      const aNum = Number(aValue)
      const bNum = Number(bValue)

      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortDirection === "asc" ? aNum - bNum : bNum - aNum
      }

      const aStr = aValue?.toString() || ""
      const bStr = bValue?.toString() || ""

      return sortDirection === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
    })
  }, [filteredData, sortColumn, sortDirection])

  const {
    data: paginatedData,
    pagination,
    totalItems,
  } = usePaginatedData(sortedData, {
    pageSize: 10,
  })

  const handleSort = useCallback((column: string) => {
    setSortColumn((prev) => {
      if (prev === column) {
        setSortDirection((dir) => (dir === "asc" ? "desc" : "asc"))
        return column
      }
      setSortDirection("asc")
      return column
    })
  }, [])

  // Componente para o cabeçalho da coluna com drag and drop
  const DraggableHeader = ({ column }: { column: string }) => {
    const [{ isDragging }, drag] = useDrag({
      type: "COLUMN",
      item: { type: "COLUMN", column },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    })

    const [{ isOver }, drop] = useDrop({
      accept: "COLUMN",
      drop: (item: { column: string }) => {
        columnsState.reorderColumns(item.column, column)
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    })

    return (
      <TableHead
        ref={(node) => drag(drop(node))}
        className={`${isDragging ? "opacity-50" : ""} ${isOver ? "bg-primary/10" : ""} cursor-move whitespace-nowrap`}
      >
        <Button variant="ghost" size="sm" className="h-8 font-medium -ml-3" onClick={() => handleSort(column)}>
          {column}
          {sortColumn === column ? (
            sortDirection === "asc" ? (
              <ChevronUp className="ml-1 h-4 w-4" />
            ) : (
              <ChevronDown className="ml-1 h-4 w-4" />
            )
          ) : (
            <ChevronsUpDown className="ml-1 h-4 w-4 opacity-50" />
          )}
        </Button>
      </TableHead>
    )
  }

  // Memoize table header
  const TableHeaderMemo = useMemo(
    () => (
      <TableHeader className="sticky top-0 bg-background">
        <TableRow>
          {visibleColumns.map((header) => (
            <TableHead key={header} className="whitespace-nowrap">
              <Button variant="ghost" size="sm" className="h-8 font-medium -ml-3" onClick={() => handleSort(header)}>
                {header}
                {sortColumn === header ? (
                  sortDirection === "asc" ? (
                    <ChevronUp className="ml-1 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-1 h-4 w-4" />
                  )
                ) : (
                  <ChevronsUpDown className="ml-1 h-4 w-4 opacity-50" />
                )}
              </Button>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
    ),
    [visibleColumns, sortColumn, sortDirection, handleSort],
  )

  // Função para mostrar todas as colunas
  const showAllColumns = useCallback(() => {
    columnsState.showAllColumns()
  }, [columnsState])

  // Função para ocultar todas as colunas
  const hideAllColumns = useCallback(() => {
    columnsState.hideAllColumns()
  }, [columnsState])

  // Memoize column selector com os novos botões
  const ColumnSelectorMemo = useMemo(
    () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 border-dashed">
            <Settings2 className="mr-2 h-4 w-4" />
            Colunas
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Colunas visíveis</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="p-2 flex gap-2">
            <Button size="sm" variant="outline" className="h-8 flex-1 text-xs" onClick={showAllColumns}>
              Mostrar todas
            </Button>
            <Button size="sm" variant="outline" className="h-8 flex-1 text-xs" onClick={hideAllColumns}>
              Ocultar todas
            </Button>
          </div>
          <DropdownMenuSeparator />
          <div className="max-h-[300px] overflow-y-auto">
            {allColumns.map((column, index) => (
              <DropdownMenuCheckboxItem
                key={column.key}
                checked={column.isVisible}
                onCheckedChange={() => columnsState.toggleVisibility(column.key)}
                className="capitalize"
              >
                {index < 5 && <span className="mr-2 text-xs text-muted-foreground">(Padrão)</span>}
                {column.label}
              </DropdownMenuCheckboxItem>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    [allColumns, columnsState, showAllColumns, hideAllColumns],
  )

  // Função de exportação PDF
  const handleExportPDF = () => {
    if (!data || !user) return

    exportToPDF({
      title: "Relatório de Patrimônio",
      fileName: "relatorio-patrimonio.pdf",
      data,
      columns: columnsState.getVisibleColumns(),
      user,
      groupInfo: groupByColumn
        ? {
            groupBy: groupByColumn,
            groupValue: groupValue,
          }
        : undefined,
    })
  }

  // Modifique a função de toggleShowAll para incluir o loading
  const handleToggleShowAll = useCallback(async () => {
    setIsLoadingAll(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 100))
      pagination.toggleShowAll()
    } finally {
      setIsLoadingAll(false)
    }
  }, [pagination])

  // Referência para detecção de scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
  })

  // Efeito para carregar mais dados quando chegar ao final
  useEffect(() => {
    if (inView && pagination.showAll) {
      //virtualization.loadMoreVirtualData()
    }
  }, [inView, pagination.showAll])

  // Configuração do virtualizador
  const rowVirtualizer = useVirtualizer({
    count: pagination.showAll ? sortedData.length : paginatedData.length,
    getScrollElement: () => document.querySelector(".table-container"),
    estimateSize: () => 48, // Altura estimada de cada linha
    overscan: 10, // Aumentado para suavizar a rolagem
  })

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  if (!data || data.length === 0) {
    return <div className="text-center py-8">Nenhum dado disponível</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-xs">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar..."
              className="pl-8 h-9"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {ColumnSelectorMemo}
          <div className="text-xs sm:text-sm text-muted-foreground">
            {pagination.showAll
              ? `${totalItems} registros`
              : `${(pagination.currentPage - 1) * pagination.pageSize + 1}-${Math.min(
                  pagination.currentPage * pagination.pageSize,
                  totalItems,
                )} de ${totalItems}`}
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <div className="table-container relative max-h-[calc(100vh-16rem)] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-background">
              <TableRow>
                {visibleColumns.map((column) => (
                  <TableHead key={column.key} className="whitespace-nowrap" style={{ width: column.width }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 font-medium -ml-3"
                      onClick={() => handleSort(column.key)}
                    >
                      {column.label}
                      {sortColumn === column.key ? (
                        sortDirection === "asc" ? (
                          <ChevronUp className="ml-1 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-1 h-4 w-4" />
                        )
                      ) : (
                        <ChevronsUpDown className="ml-1 h-4 w-4 opacity-50" />
                      )}
                    </Button>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {(pagination.showAll ? sortedData : paginatedData).map((row, index) => (
                <TableRow key={index} className="hover:bg-muted/50">
                  {visibleColumns.map((column) => (
                    <TableCell key={`${index}-${column.key}`} className="p-2 md:p-4" style={{ width: column.width }}>
                      <div className="max-w-[150px] sm:max-w-[200px] md:max-w-[300px] truncate">
                        {row[column.key]?.toString() || "-"}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1 text-sm text-muted-foreground">
          {pagination.showAll
            ? `Exibindo todos os ${totalItems} registros`
            : `${paginatedData.length} de ${totalItems} registros`}
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <PaginationControls
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            showAll={pagination.showAll}
            onPreviousPage={pagination.previousPage}
            onNextPage={pagination.nextPage}
            onToggleShowAll={handleToggleShowAll}
            isLoadingAll={isLoadingAll}
            loadedItems={pagination.showAll ? sortedData.length : paginatedData.length}
            totalItems={totalItems}
          />
        </div>
      </div>
    </div>
  )
}

