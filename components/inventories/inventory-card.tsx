import { formatDate } from "@/app/dashboard/inventories/data/copy-data"
import type { BemCopia } from "@/app/dashboard/inventories/types/inventory-types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface InventoryCardProps {
  item: BemCopia
  displayFields: string[]
}

export default function InventoryCard({ item, displayFields }: InventoryCardProps) {
  // Função para obter a cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo":
        return "bg-green-500"
      case "Em Manutenção":
        return "bg-amber-500"
      case "Inativo":
        return "bg-gray-500"
      case "Baixado":
        return "bg-red-500"
      case "Transferido":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  // Função para obter a cor do estado de conservação
  const getConservacaoColor = (estado: string) => {
    switch (estado) {
      case "Ótimo":
        return "text-green-500"
      case "Bom":
        return "text-emerald-500"
      case "Regular":
        return "text-amber-500"
      case "Ruim":
        return "text-orange-500"
      case "Péssimo":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  // Mapeamento de campos para rótulos mais amigáveis
  const fieldLabels: Record<string, string> = {
    bem_id: "ID",
    NUMERO: "Número",
    STATUS: "Status",
    DESCRICAO: "Descrição",
    RESPONSABILIDADE_ATUAL: "Responsável",
    SETOR_DO_RESPONSAVEL: "Setor",
    CAMPUS_DA_LOTACAO_DO_BEM: "Campus",
    SALA: "Sala",
    ESTADO_DE_CONSERVACAO: "Conservação",
    MARCA_MODELO: "Marca/Modelo",
    data_ultima_atualizacao: "Atualizado em",
    DESCRICAO_PRINCIPAL: "Descrição Principal",
    ROTULOS: "Rótulos",
    ED: "ED",
  }

  return (
    <Card className="border-[var(--border-input)] bg-[var(--card-color)] transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-[var(--font-color)]">{item.DESCRICAO}</h3>
          <Badge className={`${getStatusColor(item.STATUS)} text-white`}>{item.STATUS}</Badge>
        </div>
        <div className="text-sm text-[var(--font-color)]/70 space-y-1">
          {displayFields.includes("NUMERO") && (
            <div className="flex justify-between">
              <span>{fieldLabels.NUMERO}:</span>
              <span className="font-medium text-[var(--font-color)]">{item.NUMERO}</span>
            </div>
          )}

          {displayFields.includes("MARCA_MODELO") && (
            <div className="flex justify-between">
              <span>{fieldLabels.MARCA_MODELO}:</span>
              <span className="font-medium text-[var(--font-color)]">{item.MARCA_MODELO}</span>
            </div>
          )}

          {displayFields.includes("RESPONSABILIDADE_ATUAL") && (
            <div className="flex justify-between">
              <span>{fieldLabels.RESPONSABILIDADE_ATUAL}:</span>
              <span className="font-medium text-[var(--font-color)]">{item.RESPONSABILIDADE_ATUAL}</span>
            </div>
          )}

          {displayFields.includes("SETOR_DO_RESPONSAVEL") && (
            <div className="flex justify-between">
              <span>{fieldLabels.SETOR_DO_RESPONSAVEL}:</span>
              <span className="font-medium text-[var(--font-color)]">{item.SETOR_DO_RESPONSAVEL}</span>
            </div>
          )}

          {displayFields.includes("CAMPUS_DA_LOTACAO_DO_BEM") && (
            <div className="flex justify-between">
              <span>{fieldLabels.CAMPUS_DA_LOTACAO_DO_BEM}:</span>
              <span className="font-medium text-[var(--font-color)]">{item.CAMPUS_DA_LOTACAO_DO_BEM}</span>
            </div>
          )}

          {displayFields.includes("SALA") && (
            <div className="flex justify-between">
              <span>{fieldLabels.SALA}:</span>
              <span className="font-medium text-[var(--font-color)]">{item.SALA}</span>
            </div>
          )}

          {displayFields.includes("ESTADO_DE_CONSERVACAO") && (
            <div className="flex justify-between">
              <span>{fieldLabels.ESTADO_DE_CONSERVACAO}:</span>
              <span className={`font-medium ${getConservacaoColor(item.ESTADO_DE_CONSERVACAO)}`}>
                {item.ESTADO_DE_CONSERVACAO}
              </span>
            </div>
          )}

          {displayFields.includes("data_ultima_atualizacao") && (
            <div className="flex justify-between">
              <span>{fieldLabels.data_ultima_atualizacao}:</span>
              <span className="font-medium text-[var(--font-color)]">{formatDate(item.data_ultima_atualizacao)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}