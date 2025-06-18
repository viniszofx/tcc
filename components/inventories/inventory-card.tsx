import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { BemCopia } from "@/lib/interface"
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
    <Link href={`/comissions/${item.comissao_id}/inventories/${item.bem_id}`}>
      <Card className="border-[var(--border-input)] bg-[var(--card-color)] transition-all hover:shadow-md cursor-pointer h-full">
        <CardContent className="p-3 sm:p-4">
          <div className="flex justify-between items-start mb-2 gap-2">
            <h3 className="font-semibold text-[var(--font-color)] line-clamp-2 text-sm sm:text-base">
              {item.DESCRICAO}
            </h3>
            <Badge className={`${getStatusColor(item.STATUS)} text-white text-xs`}>
              {item.STATUS.length > 10 ? `${item.STATUS.substring(0,8)}...` : item.STATUS}
            </Badge>
          </div>
          
          <div className="text-xs sm:text-sm text-[var(--font-color)]/70 space-y-1">
            {displayFields.map(field => {
              if (!item[field as keyof BemCopia]) return null;
              
              return (
                <div key={field} className="flex justify-between gap-1">
                  <span className="whitespace-nowrap">{fieldLabels[field]}:</span>
                  <span className="font-medium text-[var(--font-color)] truncate max-w-[50%] sm:max-w-[150px]">
                    {String(item[field as keyof BemCopia])}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}