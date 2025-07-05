// Tipos relacionados à configuração e constantes
// Este arquivo contém tipos para configurações do sistema e constantes

// ============================================================================
// TIPOS DE ARMAZENAMENTO
// ============================================================================

// Tipo de armazenamento
export type StorageType = "localStorage" | "indexedDB";

// Configuração de bucket
export interface BucketConfig {
  name: string;
  public: boolean;
  allowedMimeTypes?: string[];
  fileSizeLimit?: number;
  allowedFileExtensions?: string[];
}

// ============================================================================
// CONSTANTES DE ARMAZENAMENTO
// ============================================================================

// Chaves de armazenamento
export const STORAGE_KEYS = {
  INVENTORY_DATA: "inventory_data",
  INVENTORY_METADATA: "inventory_metadata",
  INVENTORY_CHUNKS_PREFIX: "inventory_chunk_",
  INVENTORY_CHUNKS_COUNT: "inventory_chunks_count",
  STORAGE_TYPE: "inventory_storage_type",
  USER_SETTINGS: "user_settings",
  THEME: "theme",
  LANGUAGE: "language"
} as const;

// Configuração do banco de dados
export const DB_CONFIG = {
  NAME: "inventory_db",
  VERSION: 1,
  STORE_NAME: "inventory_data",
  METADATA_STORE: "inventory_metadata"
} as const;

// Tamanhos e limites
export const LIMITS = {
  MAX_CHUNK_SIZE: 200 * 1024, // 200KB
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_UPLOAD_FILES: 10,
  MAX_ITEMS_PER_PAGE: 100,
  DEFAULT_ITEMS_PER_PAGE: 20
} as const;

// ============================================================================
// CAMPOS ESSENCIAIS
// ============================================================================

// Campos essenciais para inventário
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
  "ROTULOS"
] as const;

// Tipo para campos essenciais
export type EssentialField = typeof ESSENTIAL_FIELDS[number];

// ============================================================================
// CONFIGURAÇÕES DE API
// ============================================================================

// Configuração de rate limiting
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// Configuração de timeout
export interface TimeoutConfig {
  request: number;
  upload: number;
  download: number;
}

// Configuração de retry
export interface RetryConfig {
  attempts: number;
  delay: number;
  backoff: 'linear' | 'exponential';
}

// ============================================================================
// CONFIGURAÇÕES DE VALIDAÇÃO
// ============================================================================

// Regras de validação para campos
export interface FieldValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

// Configuração de validação
export interface ValidationConfig {
  [fieldName: string]: FieldValidationRules;
}

// ============================================================================
// CONFIGURAÇÕES DE TEMA E UI
// ============================================================================

// Configuração de cores do tema
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  error: string;
  warning: string;
  success: string;
  info: string;
}

// Configuração de tipografia
export interface TypographyConfig {
  fontFamily: {
    sans: string[];
    serif: string[];
    mono: string[];
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
}

// ============================================================================
// CONFIGURAÇÕES DE FUNCIONALIDADES
// ============================================================================

// Configuração de upload
export interface UploadConfig {
  allowedTypes: string[];
  maxFileSize: number;
  maxFiles: number;
  chunkSize: number;
  enableCompression: boolean;
  enableThumbnails: boolean;
}

// Configuração de notificações
export interface NotificationConfig {
  enabled: boolean;
  types: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
}

// Configuração de backup
export interface BackupConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  retention: number; // dias
  compression: boolean;
  encryption: boolean;
}

// ============================================================================
// CONFIGURAÇÕES DE SEGURANÇA
// ============================================================================

// Configuração de autenticação
export interface AuthConfig {
  sessionTimeout: number; // minutos
  maxLoginAttempts: number;
  lockoutDuration: number; // minutos
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
  };
}

// Configuração de CORS
export interface CorsConfig {
  origin: string | string[] | boolean;
  methods: string[];
  allowedHeaders: string[];
  credentials: boolean;
}

// ============================================================================
// CONFIGURAÇÃO PRINCIPAL DO SISTEMA
// ============================================================================

// Configuração completa do sistema
export interface SystemConfig {
  app: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
    debug: boolean;
  };
  database: {
    url: string;
    poolSize: number;
    timeout: number;
  };
  storage: {
    type: StorageType;
    config: any;
  };
  api: {
    baseUrl: string;
    timeout: TimeoutConfig;
    rateLimit: RateLimitConfig;
    retry: RetryConfig;
  };
  auth: AuthConfig;
  upload: UploadConfig;
  notifications: NotificationConfig;
  backup: BackupConfig;
  security: {
    cors: CorsConfig;
    encryption: {
      algorithm: string;
      keyLength: number;
    };
  };
  ui: {
    theme: {
      default: 'light' | 'dark' | 'system';
      colors: ThemeColors;
    };
    typography: TypographyConfig;
  };
  features: {
    [featureName: string]: boolean;
  };
}

// ============================================================================
// TIPOS DE AMBIENTE
// ============================================================================

// Variáveis de ambiente
export interface EnvironmentVariables {
  NODE_ENV: 'development' | 'staging' | 'production';
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  DATABASE_URL: string;
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;
}