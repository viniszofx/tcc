"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCampusName } from "@/hooks/queries/use-campus-name";
import { useCommission } from "@/hooks/queries/use-commissions-query";
import type { BemCopia } from "@/types";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useState } from "react";

interface InventoryCardProps {
  item: BemCopia;
  displayFields: string[];
}

export default function InventoryCard({
  item,
  displayFields,
}: InventoryCardProps) {
  const pathname = usePathname();
  const params = useParams();
  const commissionId = params?.commission_id as string;
  const [isDownloading, setIsDownloading] = useState(false);

  // Fetch campus name if the campus_id is available
  const { data: campusName, isLoading: isLoadingCampus } = useCampusName(
    item.campus_id
  );

  // Fetch commission data to get spreadsheet_url
  const { data: commission } = useCommission(commissionId);

  // Variável para exibição do campus - usa o nome do campus da API ou o valor já existente no item
  const displayCampusName = isLoadingCampus
    ? "Carregando..."
    : campusName || item.CAMPUS_DA_LOTACAO_DO_BEM || "Campus não especificado";

  const isAdminRoute = pathname.includes("/application/");
  const basePath = "/application";
  const itemDetailRoute = `${basePath}/commissions/${commissionId}/inventories/${item.bem_id}`;

  const getStatusColor = (status: string | undefined) => {
    if (!status) return "bg-gray-500";

    switch (status.toUpperCase()) {
      case "ATIVO":
      case "ATIVO":
        return "bg-green-500";
      case "EM_USO":
      case "EM MANUTENÇÃO":
        return "bg-amber-500";
      case "BAIXA_SOLICITADA":
      case "INATIVO":
        return "bg-gray-500";
      case "BAIXADO":
        return "bg-red-500";
      case "TRANSFERIDO":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getConservacaoColor = (estado: string) => {
    switch (estado) {
      case "NOVO":
      case "Ótimo":
      case "Novo":
        return "text-green-500";
      case "BOM":
      case "Bom":
        return "text-emerald-500";
      case "REGULAR":
      case "Regular":
        return "text-amber-500";
      case "RUIM":
      case "Ruim":
        return "text-orange-500";
      case "INSERVIVEL":
      case "Péssimo":
      case "Irreversível":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

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
  };

  return (
    <Link href={itemDetailRoute} className="block">
      <Card className="border-[var(--border-input)] bg-[var(--card-color)] transition-all hover:shadow-md overflow-hidden cursor-pointer">
        <CardContent className="p-3 sm:p-4">
          {/* Cabeçalho com título e botão de download da planilha */}
          <div className="flex justify-between items-start gap-2 mb-3">
            <h3 className="font-semibold text-[var(--font-color)] text-xs sm:text-sm flex-1 min-w-0 line-clamp-2">
              {(() => {
                const descricao = item.DESCRICAO || "Sem descrição";
                const index = descricao.indexOf("[");
                if (index > 0) {
                  return descricao.substring(0, index).trim();
                }
                return descricao;
              })()}
            </h3>

            <div className="flex items-center gap-1 flex-shrink-0">
              <Badge
                className={`${getStatusColor(
                  item.STATUS
                )} text-white text-xs px-2 py-1 font-medium`}
              >
                {item.STATUS && item.STATUS.length > 8
                  ? `${item.STATUS.substring(0, 6)}...`
                  : item.STATUS || "Ativo"}
              </Badge>
            </div>
          </div>

          {/* Campos de informação */}
          <div className="space-y-2">
            {displayFields.map((field) => {
              let displayValue: string;
              let label = fieldLabels[field] || field;

              // Tratamento especial para campo de campus
              if (field === "CAMPUS_DA_LOTACAO_DO_BEM") {
                displayValue = displayCampusName;
              } else {
                const fieldValue = item[field as keyof BemCopia];
                displayValue =
                  fieldValue !== null && fieldValue !== undefined
                    ? String(fieldValue)
                    : "N/A";
              }

              // Aplicar cor especial para conservação
              const isConservacao = field === "ESTADO_DE_CONSERVACAO";
              const conservacaoColor = isConservacao
                ? getConservacaoColor(displayValue)
                : "";

              return (
                <div
                  key={field}
                  className="flex justify-between items-center gap-2 py-1"
                >
                  <span className="text-xs text-[var(--font-color)]/70 font-medium min-w-0 flex-shrink-0 truncate">
                    {label}:
                  </span>
                  <span
                    className={`text-xs font-semibold text-right truncate max-w-[60%] ${isConservacao
                        ? conservacaoColor
                        : "text-[var(--font-color)]"
                      }`}
                    title={displayValue}
                  >
                    {displayValue}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Rodapé com ID do item */}
          <div className="mt-3 pt-2 border-t border-[var(--border-input)]/20 flex gap-1 flex-wrap">
            <span className="text-xs text-[var(--font-color)]/60 font-medium">ID:</span>
            <span className="text-xs text-[var(--font-color)]/60 font-medium break-all">
              {item.bem_id || item.NUMERO || "N/A"}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
