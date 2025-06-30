import {
  INVENTORY_CHUNKS_COUNT_KEY,
  INVENTORY_CHUNKS_KEY_PREFIX,
  INVENTORY_DATA_KEY,
  INVENTORY_METADATA_KEY,
  STORAGE_TYPE_KEY,
} from "./constants";

export function clearLocalStorage(): void {
  localStorage.removeItem(INVENTORY_DATA_KEY);
  localStorage.removeItem(INVENTORY_METADATA_KEY);

  const chunksCountString = localStorage.getItem(INVENTORY_CHUNKS_COUNT_KEY);
  if (chunksCountString) {
    const chunksCount = Number.parseInt(chunksCountString, 10);

    for (let i = 0; i < chunksCount; i++) {
      localStorage.removeItem(`${INVENTORY_CHUNKS_KEY_PREFIX}${i}`);
    }

    localStorage.removeItem(INVENTORY_CHUNKS_COUNT_KEY);
  }

  localStorage.removeItem(STORAGE_TYPE_KEY);
}
