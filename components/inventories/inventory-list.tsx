"use client"

import { bemCopiaItems, csvFileInfo } from "@/app/dashboard/inventories/data/copy-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FileText, Filter, Search } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import InventoryActions from "./inventory-actions"
import InventoryCard from "./inventory-card"
import InventoryFilters from "./inventory-filters"
import InventoryNavigation from "./inventory-navigation"

export default function InventoryList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(0)
  const [showAll, setShowAll] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({})
  const [displayFields, setDisplayFields] = useState<string[]>([
    "NUMERO",
    "MARCA_MODELO",
    "RESPONSABILIDADE_ATUAL",
    "SALA",
    "ESTADO_DE_CONSERVACAO",
    "data_ultima_atualizacao",
  ])

  const ITEMS_PER_PAGE = 9 // 3x3 grid

  // Filtrar itens com base no termo de busca e filtros selecionados
  const filteredItems = bemCopiaItems.filter((item) => {
    // Verificar termo de busca
    const matchesSearch =
      item.DESCRICAO.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.MARCA_MODELO.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.NUMERO.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.RESPONSABILIDADE_ATUAL.toLowerCase().includes(searchTerm.toLowerCase())

    // Verificar filtros selecionados
    const matchesFilters = Object.entries(selectedFilters).every(([field, value]) => {
      if (!value || value === "all") return true // Ignorar filtros vazios ou "todos"
      return String(item[field as keyof typeof item]).toLowerCase() === value.toLowerCase()
    })

    return matchesSearch && matchesFilters
  })

  // Calcular total de páginas
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE)

  // Obter itens atuais para exibição
  const currentItems = showAll
    ? filteredItems
    : filteredItems.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE)

  // Funções de navegação
  const goToPrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1))
  }

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
  }

  // Alternar exibição de todos os itens
  const toggleShowAll = () => {
    setShowAll((prev) => !prev)
    setCurrentPage(0) // Resetar para a primeira página ao alternar
  }

  // Atualizar filtros selecionados
  const handleFilterChange = (field: string, value: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [field]: value,
    }))
    setCurrentPage(0) // Resetar para a primeira página ao filtrar
  }

  // Atualizar campos exibidos
  const handleDisplayFieldsChange = (fields: string[]) => {
    setDisplayFields(fields)
  }

  return (
    <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-md lg:max-w-5xl xl:max-w-6xl mx-auto">
      <CardHeader className="pb-2 text-center">
        <CardTitle className="text-xl font-bold text-[var(--font-color)] md:text-2xl lg:text-3xl">Inventário</CardTitle>

        {/* Informações do arquivo CSV */}
        <div className="flex items-center justify-center gap-2 mt-2 text-sm text-[var(--font-color)]/70">
          <FileText className="h-4 w-4" />
          <span>
            Arquivo: <strong>{csvFileInfo.fileName}</strong>
          </span>
          <span className="mx-2">•</span>
          <span>
            Total de itens: <strong>{csvFileInfo.totalItems}</strong>
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        {/* Ações e busca */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          <InventoryActions />
          <div className="relative flex w-full sm:w-auto">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--font-color)]/70" />
            <Input
              placeholder="Buscar itens..."
              className="pl-8 bg-[var(--bg-simple)] border-[var(--border-input)] text-[var(--font-color)]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Filtros */}
        <InventoryFilters
          onFilterChange={handleFilterChange}
          selectedFilters={selectedFilters}
          onDisplayFieldsChange={handleDisplayFieldsChange}
          displayFields={displayFields}
        />

        {/* Navegação e controles de visualização */}
        <InventoryNavigation
          currentPage={currentPage}
          totalPages={totalPages}
          showAll={showAll}
          goToPrevPage={goToPrevPage}
          goToNextPage={goToNextPage}
          toggleShowAll={toggleShowAll}
          totalItems={filteredItems.length}
        />

        {/* Itens de inventário */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {currentItems.map((item) => (
            <Link href={`/dashboard/inventories/${item.bem_id}`} key={item.bem_id} className="block">
              <InventoryCard item={item} displayFields={displayFields} />
            </Link>
          ))}
        </div>

        {/* Estado vazio */}
        {filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Filter className="h-12 w-12 text-[var(--font-color)]/30 mb-4" />
            <h3 className="text-lg font-medium text-[var(--font-color)]">Nenhum item encontrado</h3>
            <p className="text-sm text-[var(--font-color)]/70 mt-1">Tente ajustar sua busca ou filtros</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}