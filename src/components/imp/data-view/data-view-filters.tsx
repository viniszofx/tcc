"use client"

import { Plus, X, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
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
import type { DataViewColumn, DataViewFilter } from "./types"

interface DataViewFiltersProps {
  columns: DataViewColumn[]
  filters: DataViewFilter[]
  onAddFilter: () => void
  onUpdateFilter: (filterId: number, updates: Partial<DataViewFilter>) => void
  onRemoveFilter: (filterId: number) => void
  selectedFilterColumns: string[]
  onToggleFilterColumn: (columnKey: string) => void
}

const FILTER_OPERATORS = [
  { value: "equals", label: "Igual a" },
  { value: "not_equals", label: "Diferente de" },
  { value: "contains", label: "Contém" },
  { value: "not_contains", label: "Não contém" },
  { value: "starts_with", label: "Começa com" },
  { value: "ends_with", label: "Termina com" },
  { value: "is_empty", label: "Está vazio" },
  { value: "is_not_empty", label: "Não está vazio" },
]

export function DataViewFilters({
  columns,
  filters,
  onAddFilter,
  onUpdateFilter,
  onRemoveFilter,
  selectedFilterColumns,
  onToggleFilterColumn,
}: DataViewFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onAddFilter} className="h-8">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar filtro
          </Button>
          {filters.length > 0 && (
            <Badge variant="secondary" className="h-6">
              {filters.length} {filters.length === 1 ? "filtro" : "filtros"} aplicado
              {filters.length === 1 ? "" : "s"}
            </Badge>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Settings2 className="mr-2 h-4 w-4" />
              Colunas do resultado
              {selectedFilterColumns.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedFilterColumns.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel>Colunas visíveis no resultado</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <ScrollArea className="h-[300px]">
              {columns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.key}
                  checked={selectedFilterColumns.includes(column.key)}
                  onCheckedChange={() => onToggleFilterColumn(column.key)}
                >
                  {column.label}
                </DropdownMenuCheckboxItem>
              ))}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-4">
        {filters.map((filter) => (
          <div key={filter.id} className="flex items-center gap-2">
            <Select value={filter.column} onValueChange={(value) => onUpdateFilter(filter.id, { column: value })}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecione a coluna" />
              </SelectTrigger>
              <SelectContent>
                {columns.map((column) => (
                  <SelectItem key={column.key} value={column.key}>
                    {column.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filter.operator} onValueChange={(value) => onUpdateFilter(filter.id, { operator: value })}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecione o operador" />
              </SelectTrigger>
              <SelectContent>
                {FILTER_OPERATORS.map((operator) => (
                  <SelectItem key={operator.value} value={operator.value}>
                    {operator.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {!["is_empty", "is_not_empty"].includes(filter.operator) && (
              <Input
                placeholder="Valor"
                value={filter.value}
                onChange={(e) => onUpdateFilter(filter.id, { value: e.target.value })}
                className="w-[200px]"
              />
            )}

            <Button variant="ghost" size="sm" onClick={() => onRemoveFilter(filter.id)} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

