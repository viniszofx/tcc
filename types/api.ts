// Tipos relacionados à API e validação
// Este arquivo contém interfaces para requisições, respostas e validação de dados

// ============================================================================
// TIPOS DE API
// ============================================================================

// Erro de API
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// Opções para API segura
export interface UseSecureApiOptions {
  requireAuth?: boolean;
  retries?: number;
  timeout?: number;
}

// Resposta padrão da API
export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
  success: boolean;
  message?: string;
}

// ============================================================================
// TIPOS DE VALIDAÇÃO
// ============================================================================

// Resultado de validação
export interface ValidationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: string[];
}

// ============================================================================
// TIPOS DE FORMULÁRIOS
// ============================================================================

// Dados do formulário de usuário
export interface UserFormData {
  name: string;
  email: string;
  description?: string;
  organizationId?: string;
  campusId?: string;
  role?: string;
}

// Dados do formulário de organização
export interface OrganizationFormData {
  name: string;
  shortName: string;
  active?: boolean;
}

// Dados do formulário de campus
export interface CampusFormData {
  name: string;
  code: string;
  organizationId: string;
  active?: boolean;
}

// Dados do formulário de comissão
export interface CommissionFormData {
  name: string;
  type: string;
  description?: string;
  campusId: string;
  year: number;
  active?: boolean;
}

// ============================================================================
// TIPOS DE UPLOAD E PROCESSAMENTO
// ============================================================================

// Resultado de upload de arquivo
export interface FileUploadResult {
  success: boolean;
  fileName?: string;
  fileSize?: number;
  recordCount?: number;
  errors?: string[];
  warnings?: string[];
}

// Status de processamento
export interface ProcessingStatus {
  isProcessing: boolean;
  progress?: number;
  currentStep?: string;
  totalSteps?: number;
  errors?: string[];
}

// ============================================================================
// TIPOS DE BUSCA E FILTROS
// ============================================================================

// Parâmetros de busca
export interface SearchParams {
  query?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

// Resultado de busca paginada
export interface PaginatedResult<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Filtros de inventário
export interface InventoryFilters {
  search?: string;
  campus?: string;
  commission?: string;
  conservationState?: string;
  sector?: string;
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

// ============================================================================
// TIPOS DE SINCRONIZAÇÃO
// ============================================================================

// Status de sincronização
export interface SyncStatus {
  status: 'synced' | 'pending' | 'syncing' | 'error';
  lastSync?: string;
  pendingChanges?: number;
  errors?: string[];
}

// Informações de sincronização
export interface SyncInfo {
  lastSyncTime: string;
  pendingItems: number;
  syncInProgress: boolean;
  errors: string[];
}

// ============================================================================
// TIPOS DE CONFIGURAÇÃO
// ============================================================================

// Configurações do usuário
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    inventory: boolean;
  };
  preferences: {
    itemsPerPage: number;
    defaultView: 'grid' | 'list';
    autoSave: boolean;
  };
}

// Status do sistema
export interface SystemStatus {
  database: {
    connected: boolean;
    responseTime?: number;
  };
  storage: {
    available: boolean;
    usage?: {
      used: number;
      total: number;
    };
  };
  services: {
    auth: boolean;
    api: boolean;
    upload: boolean;
  };
}

// ============================================================================
// TIPOS DE WEBHOOK E EVENTOS
// ============================================================================

// Evento do sistema
export interface SystemEvent {
  id: string;
  type: string;
  data: any;
  timestamp: string;
  userId?: string;
  source: string;
}

// Payload de webhook
export interface WebhookPayload {
  event: string;
  data: any;
  timestamp: string;
  signature?: string;
}