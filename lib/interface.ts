// Enums
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

// Interfaces
export interface Usuario {
  usuario_id: string;
  nome: string;
  papel: string;
  email: string;
  imagem_url?: string;
  senha_hash?: string | null;
  habilitado: boolean;
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
  autenticacoes?: AutenticacaoSocial[];
  comissoesPresididas?: Comissao[];
  historico_bens?: HistoricoBem[];
  inventarios_abertos?: Inventario[];
  inventarios_fechados?: Inventario[];
  bens_copias?: BemCopia[];
}

export interface Comissao {
  comissao_id: string;
  nome: string;
  data_inicio: Date;
  data_fim: Date;
  presidente_id: string;
  organizacao_id: string;

  // Relations
  organizacao?: Organizacao;
  presidente?: Usuario;
  inventarios?: Inventario[];
  membros?: Usuario[];
}

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

export interface ProfileType {
  id: string;
  nome: string;
  email: string;
  campus: string;
  descricao: string;
  cargo: "admin" | "operador" | "presidente";
  foto: string;
}

export interface Responsavel {
  responsavel_id: string;
  nome: string;
  setor: string;
  campus_id: string;

  // Relations
  campus?: Campus;
}

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

export interface BemCopia {
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

  // Relations
  campus?: Campus;
  inventario?: Inventario;
  grupo?: Grupo;
  bem_original?: BemOriginal;
  atualizado_por?: Usuario;
  historico?: HistoricoBem[];
}

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

export interface Grupo {
  grupo_id: string;
  nome: string;
  descricao?: string | null;

  // Relations
  bens?: BemCopia[];
}

export interface Role {
  role_id: string;
  role_name: string;

  // Relations
  permissoes?: RolePermission[];
  usuarios?: UserRole[];
}

export interface Permission {
  permission_id: string;
  permission_name: string;
  description: string;

  // Relations
  roles?: RolePermission[];
}

export interface RolePermission {
  role_id: string;
  permission_id: string;

  // Relations
  role?: Role;
  permission?: Permission;
}

export interface UserRole {
  usuario_id: string;
  role_id: string;

  // Relations
  usuario?: Usuario;
  role?: Role;
}

export interface AutenticacaoSocial {
  autenticacao_id: string;
  usuario_id: string;
  provedor: string;
  provedor_id: string;
  email: string;
  nome: string;
  avatar_url?: string | null;
  access_token?: string | null;
  refresh_token?: string | null;
  data_criacao: Date;

  // Relations
  usuario?: Usuario;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
  description?: string | null;
  updated_at: Date;
  created_at: Date;
}

// Metadata for the processed inventory file
export interface InventoryMetadata {
  fileName: string;
  timestamp: string;
  recordCount: number;
  usedAcceleration: boolean;
}
