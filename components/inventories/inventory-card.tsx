import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { BemCopia } from "@/lib/interface"
import { formatDate } from "@/utils/data-utils"
import Link from "next/link"

interface InventoryCardProps {
  item: BemCopia
  displayFields: string[]
}

export default function InventoryCard({ item, displayFields }: InventoryCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ATIVO":
      case "Ativo":
        return "bg-green-500"
      case "EM_USO":
      case "Em Manutenção":
        return "bg-amber-500"
      case "BAIXA_SOLICITADA":
      case "Inativo":
        return "bg-gray-500"
      case "BAIXADO":
      case "Baixado":
        return "bg-red-500"
      case "Transferido":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getConservacaoColor = (estado: string) => {
    switch (estado) {
      case "NOVO":
      case "Ótimo":
      case "Novo":
        return "text-green-500"
      case "BOM":
      case "Bom":
        return "text-emerald-500"
      case "REGULAR":
      case "Regular":
        return "text-amber-500"
      case "RUIM":
      case "Ruim":
        return "text-orange-500"
      case "INSERVIVEL":
      case "Péssimo":
      case "Irreversível":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

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
    <Link href={`/dashboard/comissions/${item.comissao_id}/inventories/${item.bem_id}`}>
      <Card className="border-[var(--border-input)] bg-[var(--card-color)] transition-all hover:shadow-md cursor-pointer h-full">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-[var(--font-color)] line-clamp-2">{item.DESCRICAO}</h3>
            <Badge className={`${getStatusColor(item.STATUS)} text-white ml-2 shrink-0`}>{item.STATUS}</Badge>
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
                <span className="font-medium text-[var(--font-color)] truncate max-w-[150px]">{item.MARCA_MODELO}</span>
              </div>
            )}

            {displayFields.includes("RESPONSABILIDADE_ATUAL") && (
              <div className="flex justify-between">
                <span>{fieldLabels.RESPONSABILIDADE_ATUAL}:</span>
                <span className="font-medium text-[var(--font-color)] truncate max-w-[150px]">
                  {item.RESPONSABILIDADE_ATUAL}
                </span>
              </div>
            )}

            {displayFields.includes("SETOR_DO_RESPONSAVEL") && (
              <div className="flex justify-between">
                <span>{fieldLabels.SETOR_DO_RESPONSAVEL}:</span>
                <span className="font-medium text-[var(--font-color)] truncate max-w-[150px]">
                  {item.SETOR_DO_RESPONSAVEL}
                </span>
              </div>
            )}

            {displayFields.includes("CAMPUS_DA_LOTACAO_DO_BEM") && (
              <div className="flex justify-between">
                <span>{fieldLabels.CAMPUS_DA_LOTACAO_DO_BEM}:</span>
                <span className="font-medium text-[var(--font-color)] truncate max-w-[150px]">
                  {item.CAMPUS_DA_LOTACAO_DO_BEM}
                </span>
              </div>
            )}

            {displayFields.includes("SALA") && (
              <div className="flex justify-between">
                <span>{fieldLabels.SALA}:</span>
                <span className="font-medium text-[var(--font-color)] truncate max-w-[150px]">{item.SALA}</span>
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

            {displayFields.includes("data_ultima_atualizacao") && item.data_ultima_atualizacao && (
              <div className="flex justify-between">
                <span>{fieldLabels.data_ultima_atualizacao}:</span>
                <span className="font-medium text-[var(--font-color)]">
                  {typeof item.data_ultima_atualizacao === "string"
                    ? formatDate(item.data_ultima_atualizacao)
                    : formatDate(new Date(item.data_ultima_atualizacao).toISOString())}
                </span>
              </div>
            )}

            {displayFields.includes("ED") && (
              <div className="flex justify-between">
                <span>{fieldLabels.ED}:</span>
                <span className="font-medium text-[var(--font-color)]">{item.ED}</span>
              </div>
            )}
            {displayFields.includes("ROTULOS") && item.ROTULOS && (
              <div className="flex justify-between">
                <span>{fieldLabels.ROTULOS}:</span>
                <span className="font-medium text-[var(--font-color)] truncate max-w-[150px]">{item.ROTULOS}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}