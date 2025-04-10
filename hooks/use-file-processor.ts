"use client"

import { type BemCopia, EstadoConservacao, StatusBem } from "@/lib/interface"
import { useState } from "react"
import * as XLSX from "xlsx"

const MAX_RECORDS = 50000

export function useFileProcessor() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const processFile = async (file: File, useAcceleration: boolean): Promise<BemCopia[]> => {
    setIsProcessing(true)
    setError(null)
    setProgress(0)

    try {
      if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls") && !file.name.endsWith(".csv")) {
        throw new Error("Formato de arquivo não suportado. Por favor, use arquivos XLSX, XLS ou CSV.")
      }

      const data = await readFileAsync(file)
      setProgress(20)

      const workbook = XLSX.read(data, { type: "array" })
      setProgress(40)

      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]

      let jsonData = XLSX.utils.sheet_to_json(worksheet, {
        defval: "",
        raw: false,
        header: "A",
      })

      if (jsonData.length === 0) {
        throw new Error("Nenhum dado encontrado na planilha.")
      }

      const headerRow = jsonData[0] as Record<string, any>

      const headerMap: Record<string, string> = {}
      Object.keys(headerRow as object).forEach((key) => {
        headerMap[key] = String(headerRow[key])
      })

      jsonData = jsonData.slice(1)

      const processedJsonData = jsonData.map((row) => {
        const processedRow: Record<string, any> = {}

        Object.keys(row as object).forEach((key) => {
          const headerName = headerMap[key]
          if (headerName) {
            const normalizedHeader = normalizeHeaderName(headerName)
            processedRow[normalizedHeader] = (row as Record<string, any>)[key]
          }
        })

        return processedRow
      })

      setProgress(60)

      let dataToProcess = processedJsonData
      if (dataToProcess.length > MAX_RECORDS) {
        console.warn(
          `Arquivo contém ${dataToProcess.length} registros, limitando a ${MAX_RECORDS} para evitar problemas de desempenho.`,
        )
        dataToProcess = dataToProcess.slice(0, MAX_RECORDS)
      }

      const processedData = processInventoryData(dataToProcess, useAcceleration)
      setProgress(90)

      await new Promise((resolve) => setTimeout(resolve, 500))
      setProgress(100)

      return processedData
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao processar o arquivo.")
      throw err
    } finally {
      setIsProcessing(false)
    }
  }

  return { processFile, isProcessing, error, progress }
}

function normalizeHeaderName(header: string): string {
  const headerMap: Record<string, string> = {
    NUMERO: "NUMERO",
    NÚMERO: "NUMERO",
    STATUS: "STATUS",
    ED: "ED",
    DESCRICAO: "DESCRICAO",
    DESCRIÇÃO: "DESCRICAO",
    RÓTULOS: "ROTULOS",
    ROTULOS: "ROTULOS",
    "RESPONSABILIDADE ATUAL": "RESPONSABILIDADE_ATUAL",
    RESPONSABILIDADE_ATUAL: "RESPONSABILIDADE_ATUAL",
    "SETOR DO RESPONSÁVEL": "SETOR_DO_RESPONSAVEL",
    "SETOR DO RESPONSAVEL": "SETOR_DO_RESPONSAVEL",
    SETOR_DO_RESPONSAVEL: "SETOR_DO_RESPONSAVEL",
    "CAMPUS DA LOTAÇÃO DO BEM": "CAMPUS_DA_LOTACAO_DO_BEM",
    "CAMPUS DA LOTACAO DO BEM": "CAMPUS_DA_LOTACAO_DO_BEM",
    CAMPUS_DA_LOTACAO_DO_BEM: "CAMPUS_DA_LOTACAO_DO_BEM",
    "VALOR AQUISIÇÃO": "VALOR_AQUISICAO",
    "VALOR AQUISICAO": "VALOR_AQUISICAO",
    VALOR_AQUISICAO: "VALOR_AQUISICAO",
    "VALOR DEPRECIADO": "VALOR_DEPRECIADO",
    VALOR_DEPRECIADO: "VALOR_DEPRECIADO",
    "NUMERO NOTA FISCAL": "NUMERO_NOTA_FISCAL",
    NUMERO_NOTA_FISCAL: "NUMERO_NOTA_FISCAL",
    "NÚMERO DE SÉRIE": "NUMERO_DE_SERIE",
    "NUMERO DE SERIE": "NUMERO_DE_SERIE",
    NUMERO_DE_SERIE: "NUMERO_DE_SERIE",
    "DATA DA ENTRADA": "DATA_DA_ENTRADA",
    DATA_DA_ENTRADA: "DATA_DA_ENTRADA",
    "DATA DA RESPONSABILIDADE": "DATA_DA_RESPONSABILIDADE",
    DATA_DA_RESPONSABILIDADE: "DATA_DA_RESPONSABILIDADE",
    FORNECEDOR: "FORNECEDOR",
    SALA: "SALA",
    "ESTADO DE CONSERVAÇÃO": "ESTADO_DE_CONSERVACAO",
    "ESTADO DE CONSERVACAO": "ESTADO_DE_CONSERVACAO",
    ESTADO_DE_CONSERVACAO: "ESTADO_DE_CONSERVACAO",
    "CAMPUS DA RESPONSABILIDADE CONTÁBIL": "CAMPUS_DA_RESPONSABILIDADE_CONTABIL",
    "CAMPUS DA RESPONSABILIDADE CONTABIL": "CAMPUS_DA_RESPONSABILIDADE_CONTABIL",
    CAMPUS_DA_RESPONSABILIDADE_CONTABIL: "CAMPUS_DA_RESPONSABILIDADE_CONTABIL",
    "UG EMITENTE EMPENHO": "UG_EMITENTE_EMPENHO",
    UG_EMITENTE_EMPENHO: "UG_EMITENTE_EMPENHO",
    "NÚMERO DE EMPENHO": "NUMERO_DE_EMPENHO",
    "NUMERO DE EMPENHO": "NUMERO_DE_EMPENHO",
    NUMERO_DE_EMPENHO: "NUMERO_DE_EMPENHO",
    "FORNECEDOR EMPENHO": "FORNECEDOR_EMPENHO",
    FORNECEDOR_EMPENHO: "FORNECEDOR_EMPENHO",
    "PROCESSO EMPENHO": "PROCESSO_EMPENHO",
    PROCESSO_EMPENHO: "PROCESSO_EMPENHO",
    "TIPO ENTRADA": "TIPO_ENTRADA",
    TIPO_ENTRADA: "TIPO_ENTRADA",
    "COD ENTRADA": "COD_ENTRADA",
    COD_ENTRADA: "COD_ENTRADA",
    "COD EMPENHO": "COD_EMPENHO",
    COD_EMPENHO: "COD_EMPENHO",
    "#": "ITEM_NUMBER",
  }

  const normalizedHeader = headerMap[header.trim()]
  if (normalizedHeader) {
    return normalizedHeader
  }

  return header.trim().replace(/\s+/g, "_").toUpperCase()
}

function readFileAsync(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as ArrayBuffer)
      } else {
        reject(new Error("Falha ao ler o arquivo."))
      }
    }
    reader.onerror = () => reject(new Error("Falha ao ler o arquivo."))
    reader.readAsArrayBuffer(file)
  })
}

function processInventoryData(data: any[], useAcceleration: boolean): BemCopia[] {
  return data.map((item, index) => {
    let marcaModelo = ""
    if (item.DESCRICAO && typeof item.DESCRICAO === "string") {
      const match = item.DESCRICAO.match(/\[Marca\/Modelo:(.*?)\]/)
      if (match && match[1]) {
        marcaModelo = match[1].trim()
      }
    }

    let status = item.STATUS || "ATIVO"
    if (status && typeof status === "string") {
      if (status.toUpperCase() === "ATIVO" || status === "Ativo") {
        status = StatusBem.ATIVO
      } else if (status.toUpperCase() === "EM_USO" || status === "Em Uso" || status === "Em Manutenção") {
        status = StatusBem.EM_USO
      } else if (status.toUpperCase() === "BAIXA_SOLICITADA" || status === "Inativo") {
        status = StatusBem.BAIXA_SOLICITADA
      } else if (status.toUpperCase() === "BAIXADO" || status === "Baixado") {
        status = StatusBem.BAIXADO
      }
    }

    let conservacao = item.ESTADO_DE_CONSERVACAO || "REGULAR"
    if (conservacao && typeof conservacao === "string") {
      if (conservacao.toUpperCase() === "NOVO" || conservacao === "Novo" || conservacao === "Ótimo") {
        conservacao = EstadoConservacao.NOVO
      } else if (conservacao.toUpperCase() === "BOM" || conservacao === "Bom") {
        conservacao = EstadoConservacao.BOM
      } else if (conservacao.toUpperCase() === "REGULAR" || conservacao === "Regular") {
        conservacao = EstadoConservacao.REGULAR
      } else if (conservacao.toUpperCase() === "RUIM" || conservacao === "Ruim") {
        conservacao = EstadoConservacao.RUIM
      } else if (
        conservacao.toUpperCase() === "INSERVIVEL" ||
        conservacao === "Péssimo" ||
        conservacao === "Irreversível"
      ) {
        conservacao = EstadoConservacao.INSERVIVEL
      }
    }

    const bemCopia: BemCopia = {
      bem_id: `bem-${index + 1}`,
      inventario_id: `inv-${Date.now()}-${index}`,
      grupo_id: `grp-${Math.floor(index / 10) + 1}`,
      campus_id: `campus-${(index % 5) + 1}`,

      NUMERO: item.NUMERO || `${index + 1}`,
      STATUS: status as StatusBem,
      ED: item.ED || "",
      DESCRICAO: item.DESCRICAO || `Item ${index + 1}`,
      ROTULOS: item.ROTULOS || "",
      RESPONSABILIDADE_ATUAL: item.RESPONSABILIDADE_ATUAL || "Não atribuído",
      SETOR_DO_RESPONSAVEL: item.SETOR_DO_RESPONSAVEL || "Não especificado",
      CAMPUS_DA_LOTACAO_DO_BEM: item.CAMPUS_DA_LOTACAO_DO_BEM || "Principal",
      SALA: item.SALA || "Não especificado",
      ESTADO_DE_CONSERVACAO: conservacao as EstadoConservacao,
      DESCRICAO_PRINCIPAL: item.DESCRICAO_PRINCIPAL || item.DESCRICAO || `Item ${index + 1}`,
      MARCA_MODELO: marcaModelo || item.MARCA_MODELO || "Não especificado",
      ultimo_atualizado_por: "Sistema de Importação",
      data_ultima_atualizacao: new Date(),
    }

    return bemCopia
  })
}
