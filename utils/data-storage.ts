import type { BemCopia, InventoryMetadata } from "@/lib/interface"
import { compressToUTF16, decompressFromUTF16 } from "lz-string"

type StorageType = "localStorage" | "indexedDB"

const INVENTORY_DATA_KEY = "inventory_data"
const INVENTORY_METADATA_KEY = "inventory_metadata"
const INVENTORY_CHUNKS_KEY_PREFIX = "inventory_chunk_"
const INVENTORY_CHUNKS_COUNT_KEY = "inventory_chunks_count"
const STORAGE_TYPE_KEY = "inventory_storage_type"

const DB_NAME = "inventory_db"
const DB_VERSION = 1
const STORE_NAME = "inventory_data"
const METADATA_STORE = "inventory_metadata"

const MAX_CHUNK_SIZE = 200 * 1024

const ESSENTIAL_FIELDS = [
  "bem_id",
  "NUMERO",
  "STATUS",
  "DESCRICAO",
  "RESPONSABILIDADE_ATUAL",
  "SETOR_DO_RESPONSAVEL",
  "CAMPUS_DA_LOTACAO_DO_BEM",
  "SALA",
  "ESTADO_DE_CONSERVACAO",
  "MARCA_MODELO",
  "data_ultima_atualizacao",
  "ED",
  "ROTULOS",
]

function initIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("Your browser doesn't support IndexedDB"))
      return
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = (event) => {
      reject(new Error("Error opening IndexedDB"))
    }

    request.onsuccess = (event) => {
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = request.result

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "chunkId" })
      }

      if (!db.objectStoreNames.contains(METADATA_STORE)) {
        db.createObjectStore(METADATA_STORE, { keyPath: "id" })
      }
    }
  })
}

async function storeChunk(db: IDBDatabase, chunkId: number, data: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite")
    const objectStore = transaction.objectStore(STORE_NAME)

    const request = objectStore.put({
      chunkId,
      data,
    })

    request.onsuccess = () => resolve()
    request.onerror = () => reject(new Error(`Failed to store chunk ${chunkId}`))

    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(new Error(`Transaction failed for chunk ${chunkId}`))
  })
}

async function storeMetadata(db: IDBDatabase, metadata: InventoryMetadata & { id: string }): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([METADATA_STORE], "readwrite")
    const metadataStore = transaction.objectStore(METADATA_STORE)

    const request = metadataStore.put(metadata)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(new Error("Failed to store metadata"))

    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(new Error("Metadata transaction failed"))
  })
}

async function clearStore(db: IDBDatabase, storeName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], "readwrite")
    const objectStore = transaction.objectStore(storeName)

    const request = objectStore.clear()

    request.onsuccess = () => resolve()
    request.onerror = () => reject(new Error(`Failed to clear ${storeName}`))

    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(new Error(`Clear transaction failed for ${storeName}`))
  })
}

async function storeInIndexedDB(data: BemCopia[], metadata: InventoryMetadata, compressData = true): Promise<void> {
  try {
    const db = await initIndexedDB()

    await clearStore(db, STORE_NAME)
    await clearStore(db, METADATA_STORE)

    const dataToStore = compressData ? compressInventoryData(data) : data

    const OPTIMAL_CHUNK_SIZE = data.length > 10000 ? 500 : 1000
    const chunks = []

    for (let i = 0; i < dataToStore.length; i += OPTIMAL_CHUNK_SIZE) {
      chunks.push(dataToStore.slice(i, i + OPTIMAL_CHUNK_SIZE))
    }

    await storeMetadata(db, {
      id: "metadata",
      ...metadata,
      chunksCount: chunks.length,
    } as InventoryMetadata & { id: string; chunksCount: number })

    const BATCH_SIZE = 5
    for (let batchStart = 0; batchStart < chunks.length; batchStart += BATCH_SIZE) {
      const batchEnd = Math.min(batchStart + BATCH_SIZE, chunks.length)
      const batchPromises = []

      for (let i = batchStart; i < batchEnd; i++) {
        const chunk = chunks[i]
        const compressedData = compressToUTF16(JSON.stringify(chunk))

        batchPromises.push(storeChunk(db, i, compressedData))
      }

      await Promise.all(batchPromises)

      if (batchEnd < chunks.length) {
        await new Promise((resolve) => setTimeout(resolve, 10))
      }
    }

    localStorage.setItem(STORAGE_TYPE_KEY, "indexedDB")

    return Promise.resolve()
  } catch (error) {
    console.error("Error storing data in IndexedDB:", error)
    throw error
  }
}

async function retrieveFromIndexedDB(): Promise<{
  data: BemCopia[]
  metadata: InventoryMetadata | null
}> {
  try {
    const db = await initIndexedDB()

    const metadata = await new Promise<any>((resolve, reject) => {
      const transaction = db.transaction([METADATA_STORE], "readonly")
      const metadataStore = transaction.objectStore(METADATA_STORE)
      const request = metadataStore.get("metadata")

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(new Error("Error retrieving metadata"))
    })

    if (!metadata) {
      return { data: [], metadata: null }
    }

    const { chunksCount, id, ...metadataRest } = metadata

    let allData: BemCopia[] = []
    const BATCH_SIZE = 10

    for (let batchStart = 0; batchStart < chunksCount; batchStart += BATCH_SIZE) {
      const batchEnd = Math.min(batchStart + BATCH_SIZE, chunksCount)
      const batchPromises = []

      for (let i = batchStart; i < batchEnd; i++) {
        batchPromises.push(
          new Promise<BemCopia[]>((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], "readonly")
            const objectStore = transaction.objectStore(STORE_NAME)
            const request = objectStore.get(i)

            request.onsuccess = () => {
              if (request.result) {
                try {
                  const decompressedData = decompressFromUTF16(request.result.data)
                  const chunkData = JSON.parse(decompressedData) as BemCopia[]
                  resolve(chunkData)
                } catch (error) {
                  console.error(`Error processing chunk ${i}:`, error)
                  resolve([])
                }
              } else {
                console.warn(`Chunk ${i} not found`)
                resolve([])
              }
            }

            request.onerror = () => {
              console.error(`Error retrieving chunk ${i}`)
              resolve([])
            }
          }),
        )
      }

      const batchResults = await Promise.all(batchPromises)

      for (const chunkData of batchResults) {
        allData = allData.concat(chunkData)
      }

      if (batchEnd < chunksCount) {
        await new Promise((resolve) => setTimeout(resolve, 10))
      }
    }

    return {
      data: allData,
      metadata: metadataRest as InventoryMetadata,
    }
  } catch (error) {
    console.error("Error retrieving data from IndexedDB:", error)
    return { data: [], metadata: null }
  }
}

async function clearIndexedDB(): Promise<void> {
  try {
    const db = await initIndexedDB()

    await clearStore(db, STORE_NAME)
    await clearStore(db, METADATA_STORE)
  } catch (error) {
    console.error("Error clearing IndexedDB:", error)
  }
}

export async function storeProcessedData(
  data: BemCopia[],
  metadata: InventoryMetadata,
  compressData = true,
): Promise<void> {
  try {
    await clearProcessedData()

    if (data.length > 1000) {
      return storeInIndexedDB(data, metadata, compressData)
    }

    try {
      localStorage.setItem(INVENTORY_METADATA_KEY, JSON.stringify(metadata))

      const dataToStore = compressData ? compressInventoryData(data) : data

      const jsonData = JSON.stringify(dataToStore)
      if (jsonData.length < MAX_CHUNK_SIZE) {
        localStorage.setItem(INVENTORY_DATA_KEY, compressToUTF16(jsonData))
        localStorage.setItem(STORAGE_TYPE_KEY, "localStorage")
        return Promise.resolve()
      }

      const chunks = splitIntoChunks(dataToStore)
      localStorage.setItem(INVENTORY_CHUNKS_COUNT_KEY, chunks.length.toString())

      for (let i = 0; i < chunks.length; i++) {
        try {
          const chunkData = JSON.stringify(chunks[i])
          localStorage.setItem(`${INVENTORY_CHUNKS_KEY_PREFIX}${i}`, compressToUTF16(chunkData))
        } catch (error) {
          console.error(`Error storing chunk ${i}:`, error)

          clearLocalStorage()
          return storeInIndexedDB(data, metadata, compressData)
        }
      }

      localStorage.setItem(STORAGE_TYPE_KEY, "localStorage")
      return Promise.resolve()
    } catch (error) {
      console.error("Error storing in localStorage, falling back to IndexedDB:", error)
      return storeInIndexedDB(data, metadata, compressData)
    }
  } catch (error) {
    console.error("Error storing data:", error)
    return Promise.reject(error)
  }
}

export async function getProcessedData(): Promise<{
  data: BemCopia[]
  metadata: InventoryMetadata | null
}> {
  try {
    const storageType = localStorage.getItem(STORAGE_TYPE_KEY) as StorageType

    if (storageType === "indexedDB") {
      return retrieveFromIndexedDB()
    }

    const metadataString = localStorage.getItem(INVENTORY_METADATA_KEY)
    const metadata = metadataString ? JSON.parse(metadataString) : null

    const chunksCountString = localStorage.getItem(INVENTORY_CHUNKS_COUNT_KEY)

    if (chunksCountString) {
      const chunksCount = Number.parseInt(chunksCountString, 10)
      let data: BemCopia[] = []

      for (let i = 0; i < chunksCount; i++) {
        const compressedChunk = localStorage.getItem(`${INVENTORY_CHUNKS_KEY_PREFIX}${i}`)
        if (compressedChunk) {
          const chunkString = decompressFromUTF16(compressedChunk)
          if (chunkString) {
            const chunk = JSON.parse(chunkString)
            data = data.concat(chunk)
          }
        }
      }

      return { data, metadata }
    } else {
      const compressedData = localStorage.getItem(INVENTORY_DATA_KEY)
      if (compressedData) {
        const dataString = decompressFromUTF16(compressedData)
        const data = dataString ? JSON.parse(dataString) : []
        return { data, metadata }
      }
      return { data: [], metadata }
    }
  } catch (error) {
    console.error("Error retrieving data:", error)
    return { data: [], metadata: null }
  }
}

export async function clearProcessedData(): Promise<void> {
  try {
    const storageType = localStorage.getItem(STORAGE_TYPE_KEY) as StorageType

    if (storageType === "indexedDB") {
      await clearIndexedDB()
    }

    clearLocalStorage()
  } catch (error) {
    console.error("Error clearing data:", error)
  }
}

function clearLocalStorage(): void {
  localStorage.removeItem(INVENTORY_DATA_KEY)
  localStorage.removeItem(INVENTORY_METADATA_KEY)

  const chunksCountString = localStorage.getItem(INVENTORY_CHUNKS_COUNT_KEY)
  if (chunksCountString) {
    const chunksCount = Number.parseInt(chunksCountString, 10)

    for (let i = 0; i < chunksCount; i++) {
      localStorage.removeItem(`${INVENTORY_CHUNKS_KEY_PREFIX}${i}`)
    }

    localStorage.removeItem(INVENTORY_CHUNKS_COUNT_KEY)
  }

  localStorage.removeItem(STORAGE_TYPE_KEY)
}

function splitIntoChunks(data: any[]): any[][] {
  const chunks: any[][] = []
  let currentChunk: any[] = []
  let currentChunkSize = 0

  data.forEach((item) => {
    const itemJson = JSON.stringify(item)
    const itemSize = itemJson.length

    if (itemSize > MAX_CHUNK_SIZE) {
      const compressedItem = {} as any
      ESSENTIAL_FIELDS.forEach((field) => {
        if (item[field]) {
          compressedItem[field] = item[field]
        }
      })

      const compressedItemJson = JSON.stringify(compressedItem)
      if (compressedItemJson.length > MAX_CHUNK_SIZE) {
        console.warn("Item too large even after compression, skipping:", item.bem_id || item.NUMERO)
        return
      }

      if (currentChunkSize + compressedItemJson.length > MAX_CHUNK_SIZE && currentChunk.length > 0) {
        chunks.push(currentChunk)
        currentChunk = []
        currentChunkSize = 0
      }

      currentChunk.push(compressedItem)
      currentChunkSize += compressedItemJson.length
      return
    }

    if (currentChunkSize + itemSize > MAX_CHUNK_SIZE && currentChunk.length > 0) {
      chunks.push(currentChunk)
      currentChunk = []
      currentChunkSize = 0
    }

    currentChunk.push(item)
    currentChunkSize += itemSize
  })

  if (currentChunk.length > 0) {
    chunks.push(currentChunk)
  }

  return chunks
}

function compressInventoryData(data: BemCopia[]): Partial<BemCopia>[] {
  return data.map((item) => {
    const compressedItem: Partial<BemCopia> = {}

    ESSENTIAL_FIELDS.forEach((field) => {
      if (field in item) {
        ;(compressedItem as any)[field] = item[field as keyof BemCopia]
      }
    })

    return compressedItem
  })
}

export function estimateStorageSize(data: any[]): number {
  return JSON.stringify(data).length
}

export function canStoreInLocalStorage(data: any[]): boolean {
  const estimatedSize = estimateStorageSize(data)
  const MAX_STORAGE = 4 * 1024 * 1024 
  return estimatedSize < MAX_STORAGE
}

export function getMaxItemCount(): number {
  return 50000
}

export async function addInventoryItem(item: BemCopia): Promise<void> {
  try {
    const { data, metadata } = await getProcessedData()

    const updatedData = [...data, item]

    const usedAcceleration = false;

    const updatedMetadata: InventoryMetadata = {
      recordCount: updatedData.length,
      timestamp: new Date().toISOString(),
      fileName: metadata?.fileName || "arquivo_desconhecido.json",
      usedAcceleration,
    }

    await storeProcessedData(updatedData, updatedMetadata)

    return Promise.resolve()
  } catch (error) {
    console.error("Error adding inventory item:", error)
    return Promise.reject(error)
  }
}
