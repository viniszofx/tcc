// Tipos legados para compatibilidade
// Este arquivo mantém as interfaces antigas para garantir compatibilidade durante a migração

// ============================================================================
// ENUMS LEGADOS
// ============================================================================

export enum EstadoConservacao {
  NOVO = "NOVO",
  BOM = "BOM",
  REGULAR = "REGULAR",
  RUIM = "RUIM",
  INSERVIVEL = "INSERVIVEL",
}

export enum StatusBem {
  ATIVO = "ATIVO",
  EM_USO = "EM_USO",
  BAIXA_SOLICITADA = "BAIXA_SOLICITADA",
  BAIXADO = "BAIXADO",
}

// ============================================================================
// INTERFACES LEGADAS DO SISTEMA ANTIGO
// ============================================================================

// Interface de usuário do sistema antigo
export interface Usuario {
  usuario_id: string;
  nome: string;
  papel: string;
  email: string;
  senha_hash?: string | null;
  habilitado: boolean;
  perfil?: {
    descricao?: string;
    imagem_url?: string;
  };
  organizacao_id: string;
  campus_id?: string | null;
  comissao_id?: string | null;
  data_inicio?: Date | string | null;
  data_fim?: Date | string | null;
  metodo_autenticacao?: string;

  // Relations
  organizacao?: Organizacao;
  campus?: Campus | null;
  comissao?: Comissao | null;
  inventarios?: Inventario[];
  papeis?: UserRole[];
  comissoesPresididas?: Comissao[];
  historico_bens?: HistoricoBem[];
  inventarios_abertos?: Inventario[];
  inventarios_fechados?: Inventario[];
  bens_copias?: BemCopia[];
}

// Interface de comissão do sistema antigo
export interface Comissao {
  comissao_id: string;
  nome: string;
  ativo?: boolean;
  tipo: string;
  ano?: number;
  descricao?: string;
  presidente_id?: string;
  organizacao_id?: string;
  campus_id: string;

  // Relations
  organizacao?: Organizacao;
  presidente?: Usuario;
  inventarios?: Inventario[];
  membros?: Usuario[];
}

// Interface de organização do sistema antigo
export interface Organizacao {
  organizacao_id: string;
  nome: string;
  ativo?: boolean;
  nome_curto?: string;

  // Relations
  campus?: Campus[];
  usuarios?: Usuario[];
  comissoes?: Comissao[];
}

// Interface de campus do sistema antigo
export interface Campus {
  campus_id: string;
  nome: string;
  campus_codigo: string;
  organizacao_id?: string;
  campus_ativo: boolean;

  // Relations
  organizacao?: Organizacao;
  usuarios?: Usuario[];
  bens?: BemOriginal[];
  bens_copias?: BemCopia[];
  responsavel?: Responsavel;
}

// Interface de responsável
export interface Responsavel {
  responsavel_id: string;
  nome: string;
  setor: string;
  campus_id: string;

  // Relations
  campus?: Campus;
}

// ============================================================================
// INTERFACES DE BENS E INVENTÁRIO
// ============================================================================

// Interface de bem original
export interface BemOriginal {
  bem_id: string;
  campus_id: string;
  NUMERO: string;
  STATUS: string;
  ED: string;
  DESCRICAO: string;
  ROTULOS: string;
  RESPONSABILIDADE_ATUAL: string;
  SETOR_DO_RESPONSAVEL: string;
  CAMPUS_DA_LOTACAO_DO_BEM: string;
  SALA: string;
  ESTADO_DE_CONSERVACAO: string;
  DESCRICAO_PRINCIPAL: string;
  MARCA_MODELO: string;

  // Relations
  campus?: Campus;
  copias?: BemCopia[];
}

// Interface de bem cópia
export interface BemCopia {
  comissao_id?: any;
  bem_id: string;
  inventario_id: string;
  grupo_id: string;
  campus_id: string;
  NUMERO: string;
  STATUS: StatusBem;
  ED: string;
  DESCRICAO: string;
  ROTULOS: string;
  RESPONSABILIDADE_ATUAL: string;
  SETOR_DO_RESPONSAVEL: string;
  CAMPUS_DA_LOTACAO_DO_BEM: string;
  SALA: string;
  ESTADO_DE_CONSERVACAO: EstadoConservacao;
  DESCRICAO_PRINCIPAL: string;
  MARCA_MODELO: string;
  ultimo_atualizado_por: string;
  data_ultima_atualizacao: Date;
  observacoes?: string | null;

  // Novos campos para sincronização inteligente
  id?: string; // ID único para controle local
  isPending?: boolean; // Indica se o item ainda não foi sincronizado
  createdAt?: string; // Data de criação local
  updatedAt?: string; // Data de última atualização

  // Relations
  campus?: Campus;
  inventario?: Inventario;
  grupo?: Grupo;
  bem_original?: BemOriginal;
  atualizado_por?: Usuario;
  historico?: HistoricoBem[];
}

// Interface de inventário
export interface Inventario {
  inventario_id: string;
  comissao_id: string;
  responsavel_id: string;
  data_inicio: Date;
  data_fim: Date;
  status: string;
  aberto_por: string;
  fechado_por?: string | null;
  data_abertura: Date;
  data_fechamento?: Date | null;

  // Relations
  comissao?: Comissao;
  responsavel?: Usuario;
  abertoPor?: Usuario;
  fechadoPor?: Usuario | null;
  bens?: BemCopia[];
  historico?: HistoricoBem[];
}

// Interface de histórico de bem
export interface HistoricoBem {
  evento_id: string;
  bem_id: string;
  inventario_id: string;
  usuario_id: string;
  acao: string;
  observacao?: string | null;
  data_evento: Date;

  // Relations
  bem?: BemCopia;
  inventario?: Inventario;
  usuario?: Usuario;
}

// Interface de grupo
export interface Grupo {
  grupo_id: string;
  nome: string;
  descricao?: string | null;

  // Relations
  bens?: BemCopia[];
}

// ============================================================================
// INTERFACES DE ROLES E PERMISSÕES LEGADAS
// ============================================================================

// Interface de role legada
export interface Role {
  role_id: string;
  role_name: string;

  // Relations
  permissoes?: RolePermission[];
  usuarios?: UserRole[];
}

// Interface de permissão legada
export interface Permission {
  permission_id: string;
  permission_name: string;
  description: string;

  // Relations
  roles?: RolePermission[];
}

// Interface de relacionamento role-permission legada
export interface RolePermission {
  role_id: string;
  permission_id: string;

  // Relations
  role?: Role;
  permission?: Permission;
}

// Interface de relacionamento user-role legada
export interface UserRole {
  user_id: string;
  role_id: string;

  // Relations
  user?: Usuario;
  role?: Role;
}

// ============================================================================
// INTERFACES DE CONFIGURAÇÃO LEGADAS
// ============================================================================

// Interface de configuração legada
export interface Setting {
  id: string;
  key: string;
  value: string;
  description?: string | null;
  updated_at: Date;
  created_at: Date;
}

// ============================================================================
// TIPOS DE COMPATIBILIDADE
// ============================================================================

// Mapeamento de tipos antigos para novos
export type LegacyUser = Usuario;
export type LegacyOrganization = Organizacao;
export type LegacyCampus = Campus;
export type LegacyCommission = Comissao;
export type LegacyInventoryItem = BemCopia;
export type LegacyInventory = Inventario;

// ============================================================================
// FUNÇÕES DE MIGRAÇÃO (para uso futuro)
// ============================================================================

// Função para converter usuário legado para novo formato
export function migrateLegacyUser(legacyUser: Usuario): any {
  return {
    id: legacyUser.usuario_id,
    name: legacyUser.nome,
    email: legacyUser.email,
    description: legacyUser.perfil?.descricao || '',
    role: legacyUser.papel as any,
    avatar: legacyUser.perfil?.imagem_url || null,
    active: legacyUser.habilitado
  };
}

// Função para converter organização legada para novo formato
export function migrateLegacyOrganization(legacyOrg: Organizacao): any {
  return {
    id: legacyOrg.organizacao_id,
    name: legacyOrg.nome,
    shortName: legacyOrg.nome_curto || '',
    active: legacyOrg.ativo ?? true
  };
}

// Função para converter campus legado para novo formato
export function migrateLegacyCampus(legacyCampus: Campus): any {
  return {
    id: legacyCampus.campus_id,
    organizationId: legacyCampus.organizacao_id || '',
    name: legacyCampus.nome,
    code: legacyCampus.campus_codigo,
    active: legacyCampus.campus_ativo
  };
}

// Função para converter comissão legada para novo formato
export function migrateLegacyCommission(legacyCommission: Comissao): any {
  return {
    id: legacyCommission.comissao_id,
    campusId: legacyCommission.campus_id,
    name: legacyCommission.nome,
    type: legacyCommission.tipo,
    description: legacyCommission.descricao,
    active: legacyCommission.ativo ?? true,
    year: legacyCommission.ano || new Date().getFullYear()
  };
}