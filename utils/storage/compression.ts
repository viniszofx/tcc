import type { BemCopia } from "@/lib/interface";
import { ESSENTIAL_FIELDS, MAX_CHUNK_SIZE } from "./constants";

export function splitIntoChunks(data: any[]): any[][] {
  const chunks: any[][] = [];
  let currentChunk: any[] = [];
  let currentChunkSize = 0;

  data.forEach((item) => {
    const itemJson = JSON.stringify(item);
    const itemSize = itemJson.length;

    if (itemSize > MAX_CHUNK_SIZE) {
      const compressedItem = {} as any;
      ESSENTIAL_FIELDS.forEach((field) => {
        if (item[field]) {
          compressedItem[field] = item[field];
        }
      });

      const compressedItemJson = JSON.stringify(compressedItem);
      if (compressedItemJson.length > MAX_CHUNK_SIZE) {
        console.warn(
          "Item too large even after compression, skipping:",
          item.bem_id || item.NUMERO
        );
        return;
      }

      if (
        currentChunkSize + compressedItemJson.length > MAX_CHUNK_SIZE &&
        currentChunk.length > 0
      ) {
        chunks.push(currentChunk);
        currentChunk = [];
        currentChunkSize = 0;
      }

      currentChunk.push(compressedItem);
      currentChunkSize += compressedItemJson.length;
      return;
    }

    if (
      currentChunkSize + itemSize > MAX_CHUNK_SIZE &&
      currentChunk.length > 0
    ) {
      chunks.push(currentChunk);
      currentChunk = [];
      currentChunkSize = 0;
    }

    currentChunk.push(item);
    currentChunkSize += itemSize;
  });

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}

export function compressInventoryData(data: BemCopia[]): Partial<BemCopia>[] {
  return data.map((item) => {
    const compressedItem: Partial<BemCopia> = {};

    ESSENTIAL_FIELDS.forEach((field) => {
      if (field in item) {
        (compressedItem as any)[field] = item[field as keyof BemCopia];
      }
    });

    return compressedItem;
  });
}

export function estimateStorageSize(data: any[]): number {
  return JSON.stringify(data).length;
}

export function canStoreInLocalStorage(data: any[]): boolean {
  const estimatedSize = estimateStorageSize(data);
  const MAX_STORAGE = 4 * 1024 * 1024;
  return estimatedSize < MAX_STORAGE;
}

export function getMaxItemCount(): number {
  return 50000;
}
