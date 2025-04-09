"use client"

export async function storeProcessedData(
  results: any[],
  metadata: {
    fileName: string
    timestamp: string
    recordCount: number
    usedAcceleration: boolean
  },
) {
  try {
    if (results.length > 10000) {
      throw new Error("Dados muito grandes para armazenamento")
    }

    localStorage.setItem("processedData", JSON.stringify(results))
    localStorage.setItem("processedMetadata", JSON.stringify(metadata))

    return true
  } catch (error) {
    console.error("Erro ao armazenar dados:", error)
    throw error
  }
}

export function getProcessedData() {
  try {
    const data = localStorage.getItem("processedData")
    const metadata = localStorage.getItem("processedMetadata")

    return {
      results: data ? JSON.parse(data) : [],
      metadata: metadata ? JSON.parse(metadata) : null,
    }
  } catch (error) {
    console.error("Erro ao recuperar dados:", error)
    return { results: [], metadata: null }
  }
}