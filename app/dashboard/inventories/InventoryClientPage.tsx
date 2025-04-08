"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, Download, FileJson, FilePlus, Filter, LayoutGrid, Search } from "lucide-react"
import { useState } from "react"

const inventoryItems = [
  {
    id: 1,
    name: "Notebook Dell XPS 13",
    category: "Eletrônicos",
    quantity: 15,
    status: "Disponível",
    lastUpdated: "10/04/2025",
  },
  {
    id: 2,
    name: 'Monitor LG 27"',
    category: "Eletrônicos",
    quantity: 8,
    status: "Baixo Estoque",
    lastUpdated: "05/04/2025",
  },
  {
    id: 3,
    name: "Cadeira Ergonômica",
    category: "Mobiliário",
    quantity: 23,
    status: "Disponível",
    lastUpdated: "01/04/2025",
  },
  {
    id: 4,
    name: "Mesa de Escritório",
    category: "Mobiliário",
    quantity: 12,
    status: "Disponível",
    lastUpdated: "28/03/2025",
  },
  {
    id: 5,
    name: "Teclado Mecânico",
    category: "Periféricos",
    quantity: 5,
    status: "Baixo Estoque",
    lastUpdated: "15/03/2025",
  },
  {
    id: 6,
    name: "Mouse Sem Fio",
    category: "Periféricos",
    quantity: 0,
    status: "Esgotado",
    lastUpdated: "12/03/2025",
  },
  {
    id: 7,
    name: "Headset Bluetooth",
    category: "Áudio",
    quantity: 7,
    status: "Disponível",
    lastUpdated: "08/04/2025",
  },
  {
    id: 8,
    name: "Projetor 4K",
    category: "Eletrônicos",
    quantity: 3,
    status: "Baixo Estoque",
    lastUpdated: "02/04/2025",
  },
  {
    id: 9,
    name: "Câmera de Segurança",
    category: "Segurança",
    quantity: 18,
    status: "Disponível",
    lastUpdated: "25/03/2025",
  },
  {
    id: 10,
    name: "Impressora Laser",
    category: "Periféricos",
    quantity: 4,
    status: "Baixo Estoque",
    lastUpdated: "20/03/2025",
  },
  {
    id: 11,
    name: "Tablet Samsung",
    category: "Eletrônicos",
    quantity: 9,
    status: "Disponível",
    lastUpdated: "18/03/2025",
  },
  {
    id: 12,
    name: "Roteador Wi-Fi",
    category: "Redes",
    quantity: 6,
    status: "Disponível",
    lastUpdated: "15/03/2025",
  },
  {
    id: 13,
    name: "Armário de Arquivo",
    category: "Mobiliário",
    quantity: 2,
    status: "Baixo Estoque",
    lastUpdated: "10/03/2025",
  },
  {
    id: 14,
    name: "Webcam HD",
    category: "Periféricos",
    quantity: 0,
    status: "Esgotado",
    lastUpdated: "05/03/2025",
  },
  {
    id: 15,
    name: "Dock Station USB-C",
    category: "Acessórios",
    quantity: 11,
    status: "Disponível",
    lastUpdated: "01/03/2025",
  },
]

export default function InventoryClientPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(0)
  const [showAll, setShowAll] = useState(false)

  const ITEMS_PER_PAGE = 9

  const filteredItems = inventoryItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE)

  const currentItems = showAll
    ? filteredItems
    : filteredItems.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE)

  const goToPrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1))
  }

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
  }

  const toggleShowAll = () => {
    setShowAll((prev) => !prev)
    setCurrentPage(0) 
  }

  const handleExport = (format: "pdf" | "json") => {
    alert(`Exportando inventário como ${format.toUpperCase()}`)
  }
  const handleCreateNew = () => {
    alert("Criando novo item de inventário")
  }

  return (
    <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-md lg:max-w-5xl xl:max-w-6xl">
      <CardHeader className="pb-2 text-center">
        <CardTitle className="text-xl font-bold text-[var(--font-color)] md:text-2xl lg:text-3xl">Inventário</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => handleExport("pdf")}
              variant="outline"
              className="flex items-center gap-2 border-[var(--border-input)] bg-[var(--card-color)] text-[var(--font-color)] hover:bg-[var(--hover-3-color)] hover:text-white"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar</span> PDF
            </Button>
            <Button
              onClick={() => handleExport("json")}
              variant="outline"
              className="flex items-center gap-2 border-[var(--border-input)] bg-[var(--card-color)] text-[var(--font-color)] hover:bg-[var(--hover-3-color)] hover:text-white"
            >
              <FileJson className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar</span> JSON
            </Button>
            <Button
              onClick={handleCreateNew}
              className="flex items-center gap-2 bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white"
            >
              <FilePlus className="h-4 w-4" />
              <span>Novo Item</span>
            </Button>
          </div>
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
                Página {currentPage + 1} de {totalPages}
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {currentItems.map((item) => (
            <Card
              key={item.id}
              className="border-[var(--border-input)] bg-[var(--card-color)] transition-all hover:shadow-md"
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-[var(--font-color)]">{item.name}</h3>
                  <Badge
                    className={`
                      ${
                        item.status === "Disponível"
                          ? "bg-green-500"
                          : item.status === "Baixo Estoque"
                            ? "bg-amber-500"
                            : "bg-red-500"
                      } 
                      text-white
                    `}
                  >
                    {item.status}
                  </Badge>
                </div>
                <div className="text-sm text-[var(--font-color)]/70 space-y-1">
                  <div className="flex justify-between">
                    <span>Categoria:</span>
                    <span className="font-medium text-[var(--font-color)]">{item.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantidade:</span>
                    <span className="font-medium text-[var(--font-color)]">{item.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Atualizado:</span>
                    <span className="font-medium text-[var(--font-color)]">{item.lastUpdated}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Filter className="h-12 w-12 text-[var(--font-color)]/30 mb-4" />
            <h3 className="text-lg font-medium text-[var(--font-color)]">Nenhum item encontrado</h3>
            <p className="text-sm text-[var(--font-color)]/70 mt-1">Tente ajustar sua busca ou criar um novo item</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}