// Tipos relacionados aos componentes de UI
// Este arquivo contém interfaces para props de componentes e tipos de UI

import React from 'react';

// ============================================================================
// TIPOS BÁSICOS DE UI
// ============================================================================

// Variantes de tema
export type Theme = "light" | "dark" | "system";

// Tamanhos padrão
export type Size = "sm" | "md" | "lg" | "xl";

// Variantes de cor
export type Variant = "default" | "primary" | "secondary" | "destructive" | "outline" | "ghost";

// Estados de loading
export type LoadingState = "idle" | "loading" | "success" | "error";

// ============================================================================
// INTERFACES DE COMPONENTES BÁSICOS
// ============================================================================

// Props básicas para componentes
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  id?: string;
}

// Props para botões
export interface ButtonProps extends BaseComponentProps {
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
}

// Props para inputs
export interface InputProps extends BaseComponentProps {
  type?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
}

// Props para modais
export interface ModalProps extends BaseComponentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  size?: Size;
}

// ============================================================================
// INTERFACES DE COMPONENTES ESPECÍFICOS
// ============================================================================

// Props para cards de usuário
export interface UserCardProps extends BaseComponentProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role?: string;
  };
  showActions?: boolean;
  onEdit?: (userId: string) => void;
  onDelete?: (userId: string) => void;
  onView?: (userId: string) => void;
}

// Props para cards de organização
export interface OrganizationCardProps extends BaseComponentProps {
  organization: {
    id: string;
    name: string;
    shortName: string;
    active: boolean;
  };
  showActions?: boolean;
  onEdit?: (orgId: string) => void;
  onDelete?: (orgId: string) => void;
  onView?: (orgId: string) => void;
}

// Props para cards de campus
export interface CampusCardProps extends BaseComponentProps {
  campus: {
    id: string;
    name: string;
    code: string;
    active: boolean;
    organizationName?: string;
  };
  showActions?: boolean;
  onEdit?: (campusId: string) => void;
  onDelete?: (campusId: string) => void;
  onView?: (campusId: string) => void;
}

// Props para avatar
export interface AvatarProps extends BaseComponentProps {
  src?: string;
  alt?: string;
  size?: Size;
  fallback?: string;
  onClick?: () => void;
}

// ============================================================================
// INTERFACES DE FORMULÁRIOS
// ============================================================================

// Props para campos de formulário
export interface FormFieldProps extends BaseComponentProps {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
}

// Props para formulários
export interface FormProps extends BaseComponentProps {
  onSubmit: (data: any) => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  resetOnSubmit?: boolean;
}

// ============================================================================
// INTERFACES DE NAVEGAÇÃO
// ============================================================================

// Item de menu
export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ComponentType;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  children?: MenuItem[];
}

// Props para sidebar
export interface SidebarProps extends BaseComponentProps {
  items: MenuItem[];
  collapsed?: boolean;
  onToggle?: () => void;
}

// Props para breadcrumb
export interface BreadcrumbProps extends BaseComponentProps {
  items: Array<{
    label: string;
    href?: string;
    current?: boolean;
  }>;
}

// ============================================================================
// INTERFACES DE TABELAS E LISTAS
// ============================================================================

// Coluna de tabela
export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
}

// Props para tabela
export interface TableProps<T = any> extends BaseComponentProps {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: {
    current: number;
    total: number;
    pageSize: number;
    onChange: (page: number, pageSize: number) => void;
  };
  rowKey?: keyof T | ((record: T) => string);
  onRowClick?: (record: T, index: number) => void;
}

// ============================================================================
// INTERFACES DE UPLOAD E MÍDIA
// ============================================================================

// Props para upload de arquivo
export interface FileUploadProps extends BaseComponentProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  onUpload: (files: File[]) => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
}

// Props para cropper de imagem
export interface ImageCropperProps extends BaseComponentProps {
  src: string;
  aspect?: number;
  onCrop: (croppedImage: string) => void;
  onCancel?: () => void;
}

// ============================================================================
// INTERFACES DE FEEDBACK
// ============================================================================

// Mensagem de toast
export interface ToastMessage {
  id?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Props para indicador de loading
export interface LoadingIndicatorProps extends BaseComponentProps {
  size?: Size;
  text?: string;
  overlay?: boolean;
}

// Props para indicador de progresso
export interface ProgressIndicatorProps extends BaseComponentProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
}

// ============================================================================
// INTERFACES DE CONTEXTO
// ============================================================================

// Contexto de tema
export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  systemTheme: 'light' | 'dark';
}

// Contexto de usuário
export interface UserContextType {
  user: any;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// ============================================================================
// TIPOS DE EVENTOS
// ============================================================================

// Evento de clique
export type ClickEvent = React.MouseEvent<HTMLElement>;

// Evento de mudança
export type ChangeEvent<T = HTMLInputElement> = React.ChangeEvent<T>;

// Evento de foco
export type FocusEvent<T = HTMLElement> = React.FocusEvent<T>;

// Evento de teclado
export type KeyboardEvent<T = HTMLElement> = React.KeyboardEvent<T>;