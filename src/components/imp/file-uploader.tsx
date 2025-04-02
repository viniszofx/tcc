"use client"

import { useState, useRef, useEffect } from "react"
import type React from "react"

import { Upload, FileSpreadsheet, X, Zap } from "lucide-react"
import Papa from "papaparse"
import * as XLSX from "xlsx"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ProcessingOverlay } from "@/components/processing-overlay"
import { getDataProcessor } from "@/lib/data-processor"
import { getAccelerationCapabilities } from "@/lib/hardware-acceleration"
import { ProcessingSteps } from "@/components/processing-steps"
import { useProcessingSteps } from "@/lib/hooks/use-processing-steps"

interface FileUploaderProps {
  onDataLoaded: (data: any[], fileName: string) => void
}

// Função para extrair informações da descrição
function parsePatrimonioDescricao(descricao: string) {
  const result: Record<string, string> = {
    DESCRICAO_PRINCIPAL: "",
    MARCA_MODELO: "",
    NOTA_FISCAL: "",
    EMPENHO: "",
    ESTADO: "",
  }

  // Extrai a descrição principal (texto antes do primeiro colchete)
  const mainDesc = descricao.split("[")[0].trim()
  result.DESCRICAO_PRINCIPAL = mainDesc

  // Extrai informações entre colchetes usando regex
  const regex = /\[(.*?):(.*?)\]/g
  let match

  while ((match = regex.exec(descricao)) !== null) {
    const [, key, value] = match
    const normalizedKey = key.trim().toUpperCase().replace(/\s+/g, "_")
    result[normalizedKey] = value.trim()
  }

  return result
}

// Função para processar dados de patrimônio
function processPatrimonioData(data: any[]) {
  return data.map((item) => {
    if (!item.DESCRICAO) return item

    const parsedDesc = parsePatrimonioDescricao(item.DESCRICAO)

    return {
      ...item,
      DESCRICAO_PRINCIPAL: parsedDesc.DESCRICAO_PRINCIPAL,
      MARCA_MODELO: parsedDesc.MARCA_MODELO || "-",
      NOTA_FISCAL_DESC: parsedDesc.NOTA_FISCAL || "-",
      EMPENHO_DESC: parsedDesc.EMPENHO || "-",
      ESTADO_DESC: parsedDesc.ESTADO || "-",
    }
  })
}

export function FileUploader({ onDataLoaded }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [headerRow, setHeaderRow] = useState("1")
  const [isLoading, setIsLoading] = useState(false)
  const [preview, setPreview] = useState<any[] | null>(null)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [useHardwareAcceleration, setUseHardwareAcceleration] = useState(true)
  const [isPatrimonio, setIsPatrimonio] = useState(false)
  const [accelerationCapabilities, setAccelerationCapabilities] = useState({
    webgl: false,
    webWorkers: false,
    hardwareAccelerated: false,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { steps, currentStep, startProcessing, resetSteps } = useProcessingSteps()

  // Verifica as capacidades de aceleração de hardware
  useEffect(() => {
    if (typeof window !== "undefined") {
      const capabilities = getAccelerationCapabilities()
      setAccelerationCapabilities(capabilities)
      setUseHardwareAcceleration(capabilities.hardwareAccelerated)
    }
  }, [])

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      handleFile(droppedFile)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ]

    if (!validTypes.includes(file.type)) {
      alert("Por favor, selecione um arquivo CSV ou Excel válido.")
      return
    }

    setFile(file)

    // Gerar preview
    if (file.type === "text/csv") {
      Papa.parse(file, {
        preview: 5,
        complete: (results) => {
          setPreview(results.data as any[])
        },
      })
    } else {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: "array" })
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })
          setPreview(jsonData.slice(0, 5) as any[])
        } catch (error) {
          console.error("Erro ao ler arquivo Excel:", error)
        }
      }
      reader.readAsArrayBuffer(file)
    }
  }

  const processFile = async () => {
    if (!file) return

    setIsLoading(true)
    setProcessingProgress(0)
    const headerRowIndex = Number.parseInt(headerRow) - 1

    try {
      await startProcessing() // Inicia o processamento com passos

      if (file.type === "text/csv") {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: async (results) => {
            try {
              const processor = getDataProcessor()
              let processedData = results.data as any[]

              if (isPatrimonio) {
                processedData = processPatrimonioData(processedData)
              }

              const result = await processor.processData(
                processedData,
                "csv",
                {
                  headerRow: headerRowIndex,
                  useHardwareAcceleration,
                },
                (progress) => setProcessingProgress(progress),
              )

              setIsLoading(false)
              resetSteps()
              onDataLoaded(result.data, file.name)
            } catch (error) {
              console.error("Erro ao processar CSV:", error)
              setIsLoading(false)
              resetSteps()
            }
          },
          error: (error) => {
            setIsLoading(false)
            resetSteps()
            console.error("Erro ao processar CSV:", error)
          },
        })
      } else {
        const reader = new FileReader()
        reader.onload = async (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer)
            const workbook = XLSX.read(data, { type: "array" })
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]]

            const jsonData = XLSX.utils.sheet_to_json(firstSheet, {
              header: 1,
              range: headerRowIndex,
            }) as any[]

            // Converter para formato com cabeçalhos
            const headers = jsonData[0] as string[]
            let rows = jsonData.slice(1).map((row) => {
              const obj: Record<string, any> = {}
              headers.forEach((header, i) => {
                obj[header] = (row as any[])[i]
              })
              return obj
            })

            // Se for patrimônio, processa os dados adicionais
            if (isPatrimonio) {
              rows = processPatrimonioData(rows)
            }

            const processor = getDataProcessor()
            const result = await processor.processData(
              rows,
              "excel",
              {
                headerRow: headerRowIndex,
                useHardwareAcceleration,
              },
              (progress) => setProcessingProgress(progress),
            )

            setIsLoading(false)
            onDataLoaded(result.data, file.name)
          } catch (error) {
            setIsLoading(false)
            console.error("Erro ao processar Excel:", error)
          }
        }
        reader.readAsArrayBuffer(file)
      }
    } catch (error) {
      setIsLoading(false)
      resetSteps()
      console.error("Erro ao processar arquivo:", error)
    }
  }

  const clearFile = () => {
    setFile(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-4">
      {!file ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <FileSpreadsheet className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Arraste seu arquivo aqui</h3>
            <p className="text-sm text-muted-foreground mt-2 mb-4">Ou clique para selecionar um arquivo CSV ou Excel</p>
            <Input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xls,.xlsx"
              className="hidden"
              onChange={handleFileChange}
              id="file-upload"
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="mt-2">
              <Upload className="mr-2 h-4 w-4" />
              Selecionar arquivo
            </Button>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <FileSpreadsheet className="h-8 w-8 text-primary mr-2" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={clearFile}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="header-row">Linha do cabeçalho</Label>
                  <Select value={headerRow} onValueChange={setHeaderRow}>
                    <SelectTrigger id="header-row">
                      <SelectValue placeholder="Selecione a linha do cabeçalho" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Linha 1 (Padrão)</SelectItem>
                      <SelectItem value="2">Linha 2</SelectItem>
                      <SelectItem value="3">Linha 3</SelectItem>
                      <SelectItem value="4">Linha 4</SelectItem>
                      <SelectItem value="5">Linha 5</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Selecione qual linha contém os cabeçalhos das colunas
                  </p>
                </div>

                <div className="space-y-4">
                  {accelerationCapabilities.hardwareAccelerated && (
                    <div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="hardware-acceleration" className="flex items-center gap-2">
                          Aceleração de Hardware
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Zap className="h-4 w-4 text-yellow-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Utiliza recursos de GPU para processamento mais rápido</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>
                        <Switch
                          id="hardware-acceleration"
                          checked={useHardwareAcceleration}
                          onCheckedChange={setUseHardwareAcceleration}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Acelera o processamento usando recursos de hardware
                      </p>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="is-patrimonio" className="flex items-center gap-2">
                        Dados de Patrimônio
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <FileSpreadsheet className="h-4 w-4 text-primary" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Processa dados específicos de patrimônio</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                      <Switch id="is-patrimonio" checked={isPatrimonio} onCheckedChange={setIsPatrimonio} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ative para processar dados específicos de patrimônio
                    </p>
                  </div>
                </div>
              </div>

              {preview && (
                <div className="border rounded-md overflow-hidden">
                  <div className="bg-muted px-4 py-2 text-sm font-medium">Pré-visualização</div>
                  <div className="p-4 overflow-x-auto">
                    <table className="w-full text-sm">
                      <tbody>
                        {preview.map((row, rowIndex) => (
                          <tr key={rowIndex} className={rowIndex === 0 ? "font-medium bg-muted/50" : ""}>
                            {Array.isArray(row)
                              ? row.map((cell, cellIndex) => (
                                  <td key={cellIndex} className="border px-3 py-2">
                                    {cell?.toString() || ""}
                                  </td>
                                ))
                              : Object.values(row).map((cell, cellIndex) => (
                                  <td key={cellIndex} className="border px-3 py-2">
                                    {cell?.toString() || ""}
                                  </td>
                                ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={processFile} disabled={isLoading}>
                  {isLoading ? "Processando..." : "Processar arquivo"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <ProcessingOverlay
        isVisible={isLoading}
        progress={processingProgress}
        processingText="Processando arquivo..."
        hardwareAccelerated={useHardwareAcceleration && accelerationCapabilities.hardwareAccelerated}
      >
        <ProcessingSteps steps={steps} currentStep={currentStep} />
      </ProcessingOverlay>
    </div>
  )
}

