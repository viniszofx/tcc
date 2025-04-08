export type StatusBem = "Ativo" | "Inativo" | "Em Manutenção" | "Baixado" | "Transferido"
export type EstadoConservacao = "Ótimo" | "Bom" | "Regular" | "Ruim" | "Péssimo"

export interface BemCopia {
  bem_id: string
  inventario_id: string
  grupo_id: string
  campus_id: string
  NUMERO: string
  STATUS: StatusBem
  ED: string
  DESCRICAO: string
  ROTULOS: string
  RESPONSABILIDADE_ATUAL: string
  SETOR_DO_RESPONSAVEL: string
  CAMPUS_DA_LOTACAO_DO_BEM: string
  SALA: string
  ESTADO_DE_CONSERVACAO: EstadoConservacao
  DESCRICAO_PRINCIPAL: string
  MARCA_MODELO: string
  ultimo_atualizado_por: string
  data_ultima_atualizacao: Date
  observacoes?: string | null
}

export interface CSVFileInfo {
  fileName: string
  totalItems: number
}
