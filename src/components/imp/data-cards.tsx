"use client"

import type React from "react"
import { useState, useEffect, useCallback, useMemo } from "react"
import { Search, Settings2, ChevronRight, Group } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { GroupDetailsModal } from "@/components/group-details-modal"
import { useColumnsState } from "@/lib/hooks/use-columns-state"
import { useAuth } from "@/lib/hooks/use-auth"

interface DataCardsProps {
  data: any[]
}

interface GroupedData {
  [key: string]: any[]
}

export function DataCards({ data }: DataCardsProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [groupByColumn, setGroupByColumn] = useState<string | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<{ key: string; items: any[] } | null>(null)
  const [isGroupDetailsModalOpen, setIsGroupDetailsModalOpen] = useState(false)
  const [isLoadingAll, setIsLoadingAll] = useState(false)
  // Adicionar estado para colunas selecionadas no filtro
  const [selectedFilterColumns, setSelectedFilterColumns] = useState<string[]>([])

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

  // Memoize grouped data
  const groupedData = useMemo(() => {
    if (!groupByColumn) return null

    return sortedData.reduce((groups: GroupedData, item) => {
      const groupValue = item[groupByColumn]?.toString() || "Sem valor"
      if (!groups[groupValue]) {
        groups[groupValue] = []
      }
      groups[groupValue].push(item)
      return groups
    }, {})
  }, [sortedData, groupByColumn])

  const {
    data: paginatedData,
    pagination,
    totalItems,
  } = usePaginatedData(sortedData, {
    pageSize: 12,
  })

  // Função para mostrar todas as colunas
  const showAllColumns = useCallback(() => {
    columnsState.showAllColumns()
  }, [columnsState])

  // Função para ocultar todas as colunas
  const hideAllColumns = useCallback(() => {
    columnsState.hideAllColumns()
  }, [columnsState])

  // Adicionar função para alternar coluna no filtro
  const handleToggleFilterColumn = useCallback((columnKey: string) => {
    setSelectedFilterColumns((prev) =>
      prev.includes(columnKey) ? prev.filter((key) => key !== columnKey) : [...prev, columnKey],
    )
  }, [])

  // Memoize column selector
  const ColumnSelectorMemo = useMemo(
    () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 border-dashed">
            <Settings2 className="mr-2 h-4 w-4" />
            Colunas
            {selectedFilterColumns.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedFilterColumns.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Colunas visíveis</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="p-2 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 flex-1 text-xs"
              onClick={() => setSelectedFilterColumns(allColumns.map((col) => col.key))}
            >
              Mostrar todas
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 flex-1 text-xs"
              onClick={() => setSelectedFilterColumns([])}
            >
              Ocultar todas
            </Button>
          </div>
          <DropdownMenuSeparator />
          <ScrollArea className="h-[300px]">
            {allColumns.map((column, index) => (
              <DropdownMenuCheckboxItem
                key={column.key}
                checked={
                  selectedFilterColumns.length > 0 ? selectedFilterColumns.includes(column.key) : column.isVisible
                }
                onCheckedChange={() => handleToggleFilterColumn(column.key)}
                className="capitalize"
              >
                {index < 5 && <span className="mr-2 text-xs text-muted-foreground">(Padrão)</span>}
                {column.label}
              </DropdownMenuCheckboxItem>
            ))}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    [allColumns, selectedFilterColumns, handleToggleFilterColumn],
  )

  const handleGroupClick = useCallback((groupKey: string, items: any[]) => {
    setSelectedGroup({ key: groupKey, items })
    setIsGroupDetailsModalOpen(true)
  }, [])

  const handleCloseGroupDetailsModal = useCallback(() => {
    setIsGroupDetailsModalOpen(false)
    setSelectedGroup(null)
  }, [])

  const handleToggleShowAll = useCallback(async () => {
    setIsLoadingAll(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 100))
      pagination.toggleShowAll()
    } finally {
      setIsLoadingAll(false)
    }
  }, [pagination])

  // Função para renderizar um card
  const renderCard = useCallback(
    (row: any, index: number) => (
      <Card key={index} className="overflow-hidden h-full">
        <CardHeader className="p-4">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Registro #{index + 1}</span>
            {row.STATUS && (
              <Badge variant={row.STATUS.toLowerCase() === "ativo" ? "default" : "secondary"}>{row.STATUS}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <dl className="grid gap-2">
            {(selectedFilterColumns.length > 0
              ? allColumns.filter((col) => selectedFilterColumns.includes(col.key))
              : visibleColumns
            ).map((column) => (
              <div key={column.key} className="grid grid-cols-[1fr,2fr] gap-2 items-baseline">
                <dt className="text-xs font-medium text-muted-foreground truncate">{column.label}:</dt>
                <dd className="text-sm truncate">{row[column.key]?.toString() || "-"}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    ),
    [visibleColumns, allColumns, selectedFilterColumns],
  )

  // Função para renderizar um grupo
  const renderGroup = useCallback(
    (groupKey: string, items: any[]) => (
      <Card key={groupKey} className="overflow-hidden">
        <Button
          variant="ghost"
          className="w-full justify-between p-4 font-normal hover:no-underline"
          onClick={() => handleGroupClick(groupKey, items)}
        >
          <div className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4" />
            <div className="flex flex-col items-start">
              <span className="font-medium">{groupKey}</span>
              <span className="text-xs text-muted-foreground">
                {items.length} {items.length === 1 ? "item" : "itens"}
              </span>
            </div>
          </div>
          <Badge variant="secondary">{items.length}</Badge>
        </Button>
      </Card>
    ),
    [handleGroupClick],
  )

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="rounded-lg border-2 border-dashed p-8 max-w-md">
          <h3 className="text-lg font-semibold mb-2">Nenhum dado disponível</h3>
          <p className="text-sm text-muted-foreground">
            Faça o upload de um arquivo CSV ou Excel para visualizar os dados em cards.
          </p>
        </div>
      </div>
    )
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
          <div className="flex items-center gap-2">
            <Select
              value={groupByColumn || "none"}
              onValueChange={(value) => setGroupByColumn(value === "none" ? null : value)}
            >
              <SelectTrigger className="w-[180px] h-9">
                <Group className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Agrupar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem agrupamento</SelectItem>
                {allColumns.map((column) => (
                  <SelectItem key={column.key} value={column.key}>
                    {column.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={sortColumn || "none"}
              onValueChange={(value) => setSortColumn(value === "none" ? null : value)}
            >
              <SelectTrigger className="w-[130px] h-9">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {allColumns.map((column) => (
                  <SelectItem key={column.key} value={column.key}>
                    {column.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {sortColumn && (
              <Select value={sortDirection} onValueChange={(value) => setSortDirection(value as "asc" | "desc")}>
                <SelectTrigger className="w-[100px] h-9">
                  <SelectValue placeholder="Direção" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Crescente</SelectItem>
                  <SelectItem value="desc">Decrescente</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groupByColumn && groupedData
          ? Object.entries(groupedData).map(([groupKey, items]) => renderGroup(groupKey, items))
          : (pagination.showAll ? sortedData : paginatedData).map((row, index) => renderCard(row, index))}
      </div>

      {selectedGroup && (
        <GroupDetailsModal
          isOpen={isGroupDetailsModalOpen}
          onClose={handleCloseGroupDetailsModal}
          groupKey={selectedGroup.key}
          items={selectedGroup.items}
          columns={
            selectedFilterColumns.length > 0
              ? allColumns.filter((col) => selectedFilterColumns.includes(col.key))
              : allColumns
          }
        />
      )}

      {!groupByColumn && (
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
      )}
    </div>
  )
}

