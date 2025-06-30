// Main barrel export file for storage utilities
export * from "./compression";
export * from "./constants";
export * from "./inventory-api";
export * from "./storage-manager";

// Re-export the main functions for backwards compatibility
export {
  canStoreInLocalStorage,
  clearProcessedData,
  estimateStorageSize,
  getMaxItemCount,
  getProcessedData,
  saveProcessedData,
  storeProcessedData,
} from "./storage-manager";

export { addInventoryItem } from "./inventory-api";
