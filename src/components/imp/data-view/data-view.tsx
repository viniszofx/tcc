"use client"

import { useState, useCallback } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Filter, Group, Save, Settings2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { DataViewHeader } from "./data-view-header"
import { DataViewFilters } from "./data-view-filters"
import { DataViewGroup } from "./data-view-group"
import { useDataViewState } from "./use-data-view-state"
import type { DataViewFilter } from "./types"

interface DataViewProps {
  data: any[]
}

export function DataView({ data }: DataViewProps) {
  const {
    columns,
    setColumns,
    filters,
    setFilters,
    groupBy,
    setGroupBy,
    savedViews,
    saveCurrentView,
    loadView,
    filteredData,
    groupedData,
  } = useDataViewState(data)

  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [newViewName, setNewViewName] = useState("")
  const [selectedFilterColumns, setSelectedFilterColumns] = useState<string[]>([])

  // Função para adicionar novo filtro
  const handleAddFilter = useCallback(() => {
    setFilters((prev) => [...prev, { id: Date.now(), column: Object.keys(data[0])[0], operator: "equals", value: "" }])
  }, [setFilters, data])

  // Função para atualizar filtro
  const handleUpdateFilter = useCallback(
    (filterId: number, updates: Partial<DataViewFilter>) => {
      setFilters((prev) => prev.map((filter) => (filter.id === filterId ? { ...filter, ...updates } : filter)))
    },
    [setFilters],
  )

  // Função para remover filtro
  const handleRemoveFilter = useCallback(
    (filterId: number) => {
      setFilters((prev) => prev.filter((filter) => filter.id !== filterId))
    },
    [setFilters],
  )

  // Função para alternar coluna no resultado do filtro
  const handleToggleFilterColumn = useCallback((columnKey: string) => {
    setSelectedFilterColumns((prev) =>
      prev.includes(columnKey) ? prev.filter((key) => key !== columnKey) : [...prev, columnKey],
    )
  }, [])

  // Função para salvar visualização atual
  const handleSaveView = useCallback(() => {
    if (newViewName.trim()) {
      saveCurrentView(newViewName)
      setNewViewName("")
    }
  }, [newViewName, saveCurrentView])

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8" onClick={() => setIsFiltersOpen(!isFiltersOpen)}>
              <Filter className="mr-2 h-4 w-4" />
              Filtros
              {filters.length > 0 && (
                <span className="ml-1 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                  {filters.length}
                </span>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <Group className="mr-2 h-4 w-4" />
                  Agrupar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>Agrupar por</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setGroupBy(null)}>
                  <span className={!groupBy ? "font-medium" : ""}>Nenhum</span>
                </DropdownMenuItem>
                {columns.map((column) => (
                  <DropdownMenuItem key={column.key} onClick={() => setGroupBy(column.key)}>
                    <span className={groupBy === column.key ? "font-medium" : ""}>{column.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <Settings2 className="mr-2 h-4 w-4" />
                  Visualizações
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-72">
                <DropdownMenuLabel>Visualizações salvas</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Nome da visualização"
                      value={newViewName}
                      onChange={(e) => setNewViewName(e.target.value)}
                      className="h-8"
                    />
                    <Button size="sm" className="h-8" onClick={handleSaveView}>
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[200px]">
                  {savedViews.map((view) => (
                    <DropdownMenuItem key={view.id} onClick={() => loadView(view.id)}>
                      {view.name}
                    </DropdownMenuItem>
                  ))}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="text-sm text-muted-foreground">
            {filteredData.length} de {data.length} registros
          </div>
        </div>

        {isFiltersOpen && (
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-base">Filtros</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <DataViewFilters
                columns={columns}
                filters={filters}
                onAddFilter={handleAddFilter}
                onUpdateFilter={handleUpdateFilter}
                onRemoveFilter={handleRemoveFilter}
                selectedFilterColumns={selectedFilterColumns}
                onToggleFilterColumn={handleToggleFilterColumn}
              />
            </CardContent>
          </Card>
        )}

        <div className="rounded-md border">
          <DataViewHeader columns={columns} onColumnsChange={setColumns} />
          <Separator />
          {groupBy ? (
            <div className="divide-y">
              {Object.entries(groupedData).map(([groupValue, items]) => (
                <DataViewGroup
                  key={groupValue}
                  groupValue={groupValue}
                  items={items}
                  columns={
                    selectedFilterColumns.length > 0
                      ? columns.filter((col) => selectedFilterColumns.includes(col.key))
                      : columns
                  }
                  groupBy={groupBy}
                />
              ))}
            </div>
          ) : (
            <div className="divide-y">
              {filteredData.map((item, index) => (
                <div key={index} className="flex px-4 py-2">
                  {(selectedFilterColumns.length > 0
                    ? columns.filter((col) => selectedFilterColumns.includes(col.key))
                    : columns.filter((col) => col.isVisible)
                  ).map((column) => (
                    <div key={column.key} className="flex-1 truncate px-2" style={{ width: column.width }}>
                      {item[column.key]?.toString() || "-"}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  )
}

