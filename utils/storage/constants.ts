// Storage constants and configuration
export const INVENTORY_DATA_KEY = "inventory_data";
export const INVENTORY_METADATA_KEY = "inventory_metadata";
export const INVENTORY_CHUNKS_KEY_PREFIX = "inventory_chunk_";
export const INVENTORY_CHUNKS_COUNT_KEY = "inventory_chunks_count";
export const STORAGE_TYPE_KEY = "inventory_storage_type";

export const DB_NAME = "inventory_db";
export const DB_VERSION = 1;
export const STORE_NAME = "inventory_data";
export const METADATA_STORE = "inventory_metadata";

export const MAX_CHUNK_SIZE = 200 * 1024;

export const ESSENTIAL_FIELDS = [
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
] as const;

export type StorageType = "localStorage" | "indexedDB";
