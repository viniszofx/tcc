"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCampusName } from "@/hooks/queries/use-campus-name";
import type { BemCopia } from "@/lib/interface";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

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

  // Fetch campus name if the campus_id is available
  const { data: campusName, isLoading: isLoadingCampus } = useCampusName(
    item.campus_id
  );

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
    <Link href={itemDetailRoute}>
      <Card className="border-[var(--border-input)] bg-[var(--card-color)] transition-all hover:shadow-md cursor-pointer h-full">
        <CardContent className="p-3 sm:p-4">
          <div className="flex justify-between items-start mb-2 gap-2">
            <h3 className="font-semibold text-[var(--font-color)] line-clamp-2 text-sm sm:text-base">
              {(() => {
                const descricao = item.DESCRICAO || '';
                const index = descricao.indexOf('[');
                if (index > 0) {
                  return descricao.substring(0, index).trim() + (descricao.length > index ? '...' : '');
                }
                return descricao;
              })()}
            </h3>
            <Badge
              className={`${getStatusColor(item.STATUS)} text-white text-xs`}
            >
              {item.STATUS && item.STATUS.length > 10
                ? `${item.STATUS.substring(0, 8)}...`
                : item.STATUS || "Ativo"}
            </Badge>
          </div>

          <div className="text-xs sm:text-sm text-[var(--font-color)]/70 space-y-1">
            {displayFields.map((field) => {
              if (!item[field as keyof BemCopia]) return null;

              // Special handling for campus field
              if (field === "CAMPUS_DA_LOTACAO_DO_BEM") {
                return (
                  <div key={field} className="flex justify-between gap-1">
                    <span className="whitespace-nowrap">
                      {fieldLabels[field]}:
                    </span>
                    <span className="font-medium text-[var(--font-color)] truncate max-w-[50%] sm:max-w-[150px]">
                      {displayCampusName}
                    </span>
                  </div>
                );
              }

              return (
                <div key={field} className="flex justify-between gap-1">
                  <span className="whitespace-nowrap">
                    {fieldLabels[field]}:
                  </span>
                  <span className="font-medium text-[var(--font-color)] truncate max-w-[50%] sm:max-w-[150px]">
                    {String(item[field as keyof BemCopia] || "")}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
