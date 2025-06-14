"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, Layers, Search } from "lucide-react"
import { useState } from "react"

interface InventoryFiltersProps {
  onFilterChange: (field: string, value: string) => void
  selectedFilters: Record<string, string>
  onDisplayFieldsChange: (fields: string[]) => void
  displayFields: string[]
  onSearchChange: (value: string) => void
  searchTerm: string
  uniqueValues: Record<string, string[]>
}

export default function InventoryFilters({
  onFilterChange,
  selectedFilters,
  onDisplayFieldsChange,
  displayFields,
  onSearchChange,
  searchTerm,
  uniqueValues,
}: InventoryFiltersProps) {
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)

  const availableFields = [
    { id: "NUMERO", label: "Número" },
    { id: "MARCA_MODELO", label: "Marca/Modelo" },
    { id: "RESPONSABILIDADE_ATUAL", label: "Responsável" },
    { id: "SETOR_DO_RESPONSAVEL", label: "Setor" },
    { id: "CAMPUS_DA_LOTACAO_DO_BEM", label: "Campus" },
    { id: "SALA", label: "Sala" },
    { id: "ESTADO_DE_CONSERVACAO", label: "Estado de Conservação" },
    { id: "data_ultima_atualizacao", label: "Data de Atualização" },
    { id: "ED", label: "ED" },
    { id: "ROTULOS", label: "Rótulos" },
  ]

  const filterFields = [
    { id: "SALA", label: "Sala" },
    { id: "SETOR_DO_RESPONSAVEL", label: "Setor" },
    { id: "ESTADO_DE_CONSERVACAO", label: "Estado" },
  ]

  const toggleDisplayField = (fieldId: string) => {
    if (displayFields.includes(fieldId)) {
      onDisplayFieldsChange(displayFields.filter((id) => id !== fieldId))
    } else {
      onDisplayFieldsChange([...displayFields, fieldId])
    }
  }

  const clearFilters = () => {
    filterFields.forEach((field) => {
      onFilterChange(field.id, "")
    })
    setIsFilterDialogOpen(false)
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <div className="relative flex w-full sm:w-auto">
        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--font-color)]/70" />
        <Input
          placeholder="Buscar itens..."
          className="pl-8 bg-[var(--bg-simple)] border-[var(--border-input)] text-[var(--font-color)]"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 border-[var(--border-input)] bg-[var(--card-color)] text-[var(--font-color)] hover:bg-[var(--hover-3-color)] hover:text-white"
          >
            <Filter className="h-4 w-4" />
            <span>Filtrar Itens</span>
            {Object.values(selectedFilters).some(Boolean) && (
              <span className="ml-1 flex h-2 w-2 rounded-full bg-green-500" />
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Filtrar Inventário</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {filterFields.map((field) => (
              <div key={field.id} className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={field.id} className="text-right">
                  {field.label}
                </Label>
                <div className="col-span-3">
                  <Select
                    value={selectedFilters[field.id] || ""}
                    onValueChange={(value) => onFilterChange(field.id, value)}
                  >
                    <SelectTrigger id={field.id}>
                      <SelectValue placeholder="Selecionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {uniqueValues[field.id]?.map((value) => (
                        <SelectItem key={`${field.id}-${value}`} value={String(value)}>
                          {String(value)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={clearFilters}
              className="border-[var(--border-input)] bg-[var(--card-color)] text-[var(--font-color)] hover:bg-[var(--hover-3-color)] hover:text-white"
            >
              Limpar Filtros
            </Button>
            <Button
              onClick={() => setIsFilterDialogOpen(false)}
              className="bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white"
            >
              Aplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 border-[var(--border-input)] bg-[var(--card-color)] text-[var(--font-color)] hover:bg-[var(--hover-3-color)] hover:text-white"
          >
            <Layers className="h-4 w-4" />
            <span>Campos Exibidos</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Selecione os campos</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {availableFields.map((field) => (
            <DropdownMenuCheckboxItem
              key={field.id}
              checked={displayFields.includes(field.id)}
              onCheckedChange={() => toggleDisplayField(field.id)}
            >
              {field.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}