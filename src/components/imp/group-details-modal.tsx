"use client"

import { useState, useCallback } from "react"
import { FileSpreadsheet, FileJson, FileText, Download, Loader2, Settings2 } from "lucide-react"
import * as XLSX from "xlsx"
import Papa from "papaparse"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/hooks/use-auth"
import { exportToPDF } from "@/lib/pdf-export"

interface GroupDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  groupKey: string
  items: any[]
  columns: { key: string; label: string }[]
}

export function GroupDetailsModal({ isOpen, onClose, groupKey, items, columns }: GroupDetailsModalProps) {
  const { user } = useAuth()
  const [isExporting, setIsExporting] = useState(false)
  const [selectedColumns, setSelectedColumns] = useState<string[]>(columns.map((col) => col.key))

  // Função para alternar a seleção de uma coluna
  const toggleColumn = useCallback((columnKey: string) => {
    setSelectedColumns((prev) => {
      if (prev.includes(columnKey)) {
        // Não permite deselecionar se for a última coluna
        if (prev.length === 1) return prev
        return prev.filter((key) => key !== columnKey)
      }
      return [...prev, columnKey]
    })
  }, [])

  // Função para selecionar todas as colunas
  const selectAllColumns = useCallback(() => {
    setSelectedColumns(columns.map((col) => col.key))
  }, [columns])

  // Função para limpar a seleção (mantendo pelo menos uma coluna)
  const clearColumnSelection = useCallback(() => {
    setSelectedColumns([columns[0].key])
  }, [columns])

  // Função para extrair o nome do item da descrição
  const extractItemName = (description: string) => {
    if (!description) return "-"
    return description.split("[")[0].trim()
  }

  // Função para formatar os dados para exportação
  const formatDataForExport = () => {
    return items.map((item) => ({
      ...item,
      NOME_ITEM: extractItemName(item.DESCRICAO || ""),
      OPERADOR: user?.name || "Não especificado",
      DATA_EXPORTACAO: new Date().toLocaleString("pt-BR"),
      GRUPO: groupKey,
    }))
  }

  // Função para gerar nome de arquivo seguro
  const getSafeFileName = (base: string) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const safeGroupName = groupKey.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()
    return `${base}_${safeGroupName}_${timestamp}`
  }

  // Exportar como JSON
  const handleExportJSON = () => {
    setIsExporting(true)
    try {
      const formattedData = formatDataForExport()
      const json = JSON.stringify(formattedData, null, 2)

      // Criar Blob com BOM para garantir UTF-8
      const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), json], {
        type: "application/json;charset=utf-8",
      })

      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${getSafeFileName("grupo")}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Erro ao exportar JSON:", error)
      alert("Erro ao exportar JSON. Tente novamente.")
    } finally {
      setIsExporting(false)
    }
  }

  // Exportar como Excel
  const handleExportExcel = () => {
    setIsExporting(true)
    try {
      const formattedData = formatDataForExport()

      // Configurar opções para garantir suporte a caracteres especiais
      const ws = XLSX.utils.json_to_sheet(formattedData)
      const wb = XLSX.utils.book_new()

      // Definir propriedades do workbook para UTF-8
      wb.Props = {
        Title: `Grupo ${groupKey}`,
        Subject: "Exportação de dados",
        Author: user?.name || "Saturn",
        CreatedDate: new Date(),
      }

      XLSX.utils.book_append_sheet(wb, ws, "Dados")

      // Usar bookType xlsx para melhor suporte a caracteres especiais
      XLSX.writeFile(wb, `${getSafeFileName("grupo")}.xlsx`, {
        bookType: "xlsx",
        type: "binary",
      })
    } catch (error) {
      console.error("Erro ao exportar Excel:", error)
      alert("Erro ao exportar Excel. Tente novamente.")
    } finally {
      setIsExporting(false)
    }
  }

  // Exportar como CSV
  const handleExportCSV = () => {
    setIsExporting(true)
    try {
      const formattedData = formatDataForExport()

      // Configurar Papa Parse para garantir UTF-8
      const csv = Papa.unparse(formattedData, {
        delimiter: ";", // Usar ponto e vírgula para melhor compatibilidade com Excel brasileiro
        header: true,
        newline: "\r\n", // CRLF para melhor compatibilidade com Excel
      })

      // Criar Blob com BOM para garantir UTF-8
      const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csv], {
        type: "text/csv;charset=utf-8;",
      })

      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${getSafeFileName("grupo")}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Erro ao exportar CSV:", error)
      alert("Erro ao exportar CSV. Tente novamente.")
    } finally {
      setIsExporting(false)
    }
  }

  // Exportar como PDF
  const handleExportPDF = async () => {
    if (!user) return

    setIsExporting(true)
    try {
      // Preparar dados formatados
      const formattedData = formatDataForExport()

      // Exportar PDF
      await exportToPDF({
        title: `Relatório de Grupo - ${groupKey}`,
        fileName: `${getSafeFileName("relatorio")}.pdf`,
        data: formattedData,
        columns: selectedColumns,
        user,
        groupInfo: {
          groupBy: "Grupo",
          groupValue: groupKey,
        },
      })
    } catch (error) {
      console.error("Erro ao exportar PDF:", error)
      alert("Erro ao exportar PDF. Tente novamente.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DialogTitle>Detalhes do Grupo: {groupKey}</DialogTitle>
              <Badge variant="secondary">{items.length} itens</Badge>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings2 className="mr-2 h-4 w-4" />
                  Colunas
                  <Badge variant="secondary" className="ml-2">
                    {selectedColumns.length}
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Colunas visíveis</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-2 flex gap-2">
                  <Button size="sm" variant="outline" className="h-8 flex-1 text-xs" onClick={selectAllColumns}>
                    Todas
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 flex-1 text-xs" onClick={clearColumnSelection}>
                    Nenhuma
                  </Button>
                </div>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[300px]">
                  {columns.map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.key}
                      checked={selectedColumns.includes(column.key)}
                      onCheckedChange={() => toggleColumn(column.key)}
                    >
                      {column.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <DialogDescription>Lista completa de itens deste grupo com opções de exportação</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 py-2">
          <Button variant="outline" size="sm" onClick={handleExportJSON} disabled={isExporting}>
            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileJson className="mr-2 h-4 w-4" />}
            JSON
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportExcel} disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="mr-2 h-4 w-4" />
            )}
            Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={isExporting}>
            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            CSV
          </Button>
          <Button variant="default" size="sm" onClick={handleExportPDF} disabled={isExporting}>
            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
            PDF
          </Button>
        </div>

        <Separator />

        <ScrollArea className="flex-1 rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[4rem] sticky left-0 bg-background">Índice</TableHead>
                {selectedColumns.map((columnKey) => {
                  const column = columns.find((col) => col.key === columnKey)
                  return column ? <TableHead key={columnKey}>{column.label}</TableHead> : null
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium sticky left-0 bg-background">{index + 1}</TableCell>
                  {selectedColumns.map((columnKey) => (
                    <TableCell key={columnKey}>{item[columnKey]?.toString() || "-"}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

