import { DB_NAME, DB_VERSION, METADATA_STORE, STORE_NAME } from "./constants";

export function initIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("Your browser doesn't support IndexedDB"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      reject(new Error("Error opening IndexedDB"));
    };

    request.onsuccess = (event) => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "chunkId" });
      }

      if (!db.objectStoreNames.contains(METADATA_STORE)) {
        db.createObjectStore(METADATA_STORE, { keyPath: "id" });
      }
    };
  });
}

export async function storeChunk(
  db: IDBDatabase,
  chunkId: number,
  data: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const objectStore = transaction.objectStore(STORE_NAME);

    const request = objectStore.put({
      chunkId,
      data,
    });

    request.onsuccess = () => resolve();
    request.onerror = () =>
      reject(new Error(`Failed to store chunk ${chunkId}`));

    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(new Error(`Transaction failed for chunk ${chunkId}`));
  });
}

export async function storeMetadata(
  db: IDBDatabase,
  metadata: any
): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([METADATA_STORE], "readwrite");
    const metadataStore = transaction.objectStore(METADATA_STORE);

    const request = metadataStore.put(metadata);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error("Failed to store metadata"));

    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(new Error("Metadata transaction failed"));
  });
}

export async function clearStore(
  db: IDBDatabase,
  storeName: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], "readwrite");
    const objectStore = transaction.objectStore(storeName);

    const request = objectStore.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error(`Failed to clear ${storeName}`));

    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(new Error(`Clear transaction failed for ${storeName}`));
  });
}

export async function clearIndexedDB(): Promise<void> {
  try {
    const db = await initIndexedDB();

    await clearStore(db, STORE_NAME);
    await clearStore(db, METADATA_STORE);
  } catch (error) {
    console.error("Error clearing IndexedDB:", error);
  }
}
