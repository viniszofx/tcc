import type { BemCopia, InventoryMetadata } from "@/lib/interface";
import { compressToUTF16, decompressFromUTF16 } from "lz-string";
import {
  canStoreInLocalStorage,
  compressInventoryData,
  estimateStorageSize,
  getMaxItemCount,
  splitIntoChunks,
} from "./compression";
import {
  INVENTORY_CHUNKS_COUNT_KEY,
  INVENTORY_CHUNKS_KEY_PREFIX,
  INVENTORY_DATA_KEY,
  INVENTORY_METADATA_KEY,
  MAX_CHUNK_SIZE,
  METADATA_STORE,
  STORAGE_TYPE_KEY,
  StorageType,
  STORE_NAME,
} from "./constants";
import {
  clearIndexedDB,
  clearStore,
  initIndexedDB,
  storeChunk,
  storeMetadata,
} from "./indexeddb";
import { clearLocalStorage } from "./local-storage";

export async function storeInIndexedDB(
  data: BemCopia[],
  metadata: InventoryMetadata,
  compressData = true
): Promise<void> {
  try {
    const db = await initIndexedDB();

    await clearStore(db, STORE_NAME);
    await clearStore(db, METADATA_STORE);

    const dataToStore = compressData ? compressInventoryData(data) : data;

    const OPTIMAL_CHUNK_SIZE = data.length > 10000 ? 500 : 1000;
    const chunks = [];

    for (let i = 0; i < dataToStore.length; i += OPTIMAL_CHUNK_SIZE) {
      chunks.push(dataToStore.slice(i, i + OPTIMAL_CHUNK_SIZE));
    }

    await storeMetadata(db, {
      id: "metadata",
      ...metadata,
      chunksCount: chunks.length,
    });

    const BATCH_SIZE = 5;
    for (
      let batchStart = 0;
      batchStart < chunks.length;
      batchStart += BATCH_SIZE
    ) {
      const batchEnd = Math.min(batchStart + BATCH_SIZE, chunks.length);
      const batchPromises = [];

      for (let i = batchStart; i < batchEnd; i++) {
        const chunk = chunks[i];
        const compressedData = compressToUTF16(JSON.stringify(chunk));

        batchPromises.push(storeChunk(db, i, compressedData));
      }

      await Promise.all(batchPromises);

      if (batchEnd < chunks.length) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }

    localStorage.setItem(STORAGE_TYPE_KEY, "indexedDB");

    return Promise.resolve();
  } catch (error) {
    console.error("Error storing data in IndexedDB:", error);
    throw error;
  }
}

export async function retrieveFromIndexedDB(): Promise<{
  data: BemCopia[];
  metadata: InventoryMetadata | null;
}> {
  try {
    const db = await initIndexedDB();

    const metadata = await new Promise<any>((resolve, reject) => {
      const transaction = db.transaction([METADATA_STORE], "readonly");
      const metadataStore = transaction.objectStore(METADATA_STORE);
      const request = metadataStore.get("metadata");

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error("Error retrieving metadata"));
    });

    if (!metadata) {
      return { data: [], metadata: null };
    }

    const { chunksCount, id, ...metadataRest } = metadata;

    let allData: BemCopia[] = [];
    const BATCH_SIZE = 10;

    for (
      let batchStart = 0;
      batchStart < chunksCount;
      batchStart += BATCH_SIZE
    ) {
      const batchEnd = Math.min(batchStart + BATCH_SIZE, chunksCount);
      const batchPromises = [];

      for (let i = batchStart; i < batchEnd; i++) {
        batchPromises.push(
          new Promise<BemCopia[]>((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], "readonly");
            const objectStore = transaction.objectStore(STORE_NAME);
            const request = objectStore.get(i);

            request.onsuccess = () => {
              if (request.result) {
                try {
                  const decompressedData = decompressFromUTF16(
                    request.result.data
                  );
                  const chunkData = JSON.parse(decompressedData) as BemCopia[];
                  resolve(chunkData);
                } catch (error) {
                  console.error(`Error processing chunk ${i}:`, error);
                  resolve([]);
                }
              } else {
                console.warn(`Chunk ${i} not found`);
                resolve([]);
              }
            };

            request.onerror = () => {
              console.error(`Error retrieving chunk ${i}`);
              resolve([]);
            };
          })
        );
      }

      const batchResults = await Promise.all(batchPromises);

      for (const chunkData of batchResults) {
        allData = allData.concat(chunkData);
      }

      if (batchEnd < chunksCount) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }

    return {
      data: allData,
      metadata: metadataRest as InventoryMetadata,
    };
  } catch (error) {
    console.error("Error retrieving data from IndexedDB:", error);
    return { data: [], metadata: null };
  }
}

export async function storeProcessedData(
  data: BemCopia[],
  metadata: InventoryMetadata,
  compressData = true
): Promise<void> {
  try {
    await clearProcessedData();

    if (data.length > 1000) {
      return storeInIndexedDB(data, metadata, compressData);
    }

    try {
      localStorage.setItem(INVENTORY_METADATA_KEY, JSON.stringify(metadata));

      const dataToStore = compressData ? compressInventoryData(data) : data;

      const jsonData = JSON.stringify(dataToStore);
      if (jsonData.length < MAX_CHUNK_SIZE) {
        localStorage.setItem(INVENTORY_DATA_KEY, compressToUTF16(jsonData));
        localStorage.setItem(STORAGE_TYPE_KEY, "localStorage");
        return Promise.resolve();
      }

      const chunks = splitIntoChunks(dataToStore);
      localStorage.setItem(
        INVENTORY_CHUNKS_COUNT_KEY,
        chunks.length.toString()
      );

      for (let i = 0; i < chunks.length; i++) {
        try {
          const chunkData = JSON.stringify(chunks[i]);
          localStorage.setItem(
            `${INVENTORY_CHUNKS_KEY_PREFIX}${i}`,
            compressToUTF16(chunkData)
          );
        } catch (error) {
          console.error(`Error storing chunk ${i}:`, error);

          clearLocalStorage();
          return storeInIndexedDB(data, metadata, compressData);
        }
      }

      localStorage.setItem(STORAGE_TYPE_KEY, "localStorage");
      return Promise.resolve();
    } catch (error) {
      console.error(
        "Error storing in localStorage, falling back to IndexedDB:",
        error
      );
      return storeInIndexedDB(data, metadata, compressData);
    }
  } catch (error) {
    console.error("Error storing data:", error);
    return Promise.reject(error);
  }
}

export async function getProcessedData(): Promise<{
  data: BemCopia[];
  metadata: InventoryMetadata | null;
}> {
  try {
    const storageType = localStorage.getItem(STORAGE_TYPE_KEY) as StorageType;

    if (storageType === "indexedDB") {
      return retrieveFromIndexedDB();
    }

    const metadataString = localStorage.getItem(INVENTORY_METADATA_KEY);
    const metadata = metadataString ? JSON.parse(metadataString) : null;

    const chunksCountString = localStorage.getItem(INVENTORY_CHUNKS_COUNT_KEY);

    if (chunksCountString) {
      const chunksCount = Number.parseInt(chunksCountString, 10);
      let data: BemCopia[] = [];

      for (let i = 0; i < chunksCount; i++) {
        const compressedChunk = localStorage.getItem(
          `${INVENTORY_CHUNKS_KEY_PREFIX}${i}`
        );
        if (compressedChunk) {
          const chunkString = decompressFromUTF16(compressedChunk);
          if (chunkString) {
            const chunk = JSON.parse(chunkString);
            data = data.concat(chunk);
          }
        }
      }

      return { data, metadata };
    } else {
      const compressedData = localStorage.getItem(INVENTORY_DATA_KEY);
      if (compressedData) {
        const dataString = decompressFromUTF16(compressedData);
        const data = dataString ? JSON.parse(dataString) : [];
        return { data, metadata };
      }
      return { data: [], metadata };
    }
  } catch (error) {
    console.error("Error retrieving data:", error);
    return { data: [], metadata: null };
  }
}

export async function clearProcessedData(): Promise<void> {
  try {
    const storageType = localStorage.getItem(STORAGE_TYPE_KEY) as StorageType;

    if (storageType === "indexedDB") {
      await clearIndexedDB();
    }

    clearLocalStorage();
  } catch (error) {
    console.error("Error clearing data:", error);
  }
}

export async function saveProcessedData(
  data: BemCopia[],
  metadata?: InventoryMetadata,
  compressData = true
): Promise<void> {
  try {
    const defaultMetadata: InventoryMetadata = {
      recordCount: data.length,
      timestamp: new Date().toISOString(),
      fileName: metadata?.fileName || "manual_update.json",
      usedAcceleration: metadata?.usedAcceleration || false,
    };

    const finalMetadata = metadata || defaultMetadata;
    await clearProcessedData();

    if (data.length > 1000) {
      return storeInIndexedDB(data, finalMetadata, compressData);
    }

    try {
      localStorage.setItem(
        INVENTORY_METADATA_KEY,
        JSON.stringify(finalMetadata)
      );

      const dataToStore = compressData ? compressInventoryData(data) : data;
      const jsonData = JSON.stringify(dataToStore);

      if (jsonData.length < MAX_CHUNK_SIZE) {
        localStorage.setItem(INVENTORY_DATA_KEY, compressToUTF16(jsonData));
        localStorage.setItem(STORAGE_TYPE_KEY, "localStorage");
        return;
      }

      const chunks = splitIntoChunks(dataToStore);
      localStorage.setItem(
        INVENTORY_CHUNKS_COUNT_KEY,
        chunks.length.toString()
      );

      for (let i = 0; i < chunks.length; i++) {
        const chunkData = JSON.stringify(chunks[i]);
        localStorage.setItem(
          `${INVENTORY_CHUNKS_KEY_PREFIX}${i}`,
          compressToUTF16(chunkData)
        );
      }

      localStorage.setItem(STORAGE_TYPE_KEY, "localStorage");
    } catch (error) {
      console.error(
        "Error storing in localStorage, falling back to IndexedDB:",
        error
      );
      return storeInIndexedDB(data, finalMetadata, compressData);
    }
  } catch (error) {
    console.error("Error saving processed data:", error);
    throw error;
  }
}

// Re-export common functions for backwards compatibility
export { canStoreInLocalStorage, estimateStorageSize, getMaxItemCount };
