"use client";

import LoadingScreen from "@/components/custom/loading";
import InventoryPageBase from "@/components/inventories/inventory-page-base";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCommission } from "@/hooks/queries/use-commissions-query";
import { useInventoryItems } from "@/hooks/queries/use-inventory-query";
import { useCommissionPermissions } from "@/hooks/use-commission-permissions";
import { useUserPermissions } from "@/hooks/use-user-permissions";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CommissionInventoriesPage() {
  const { user, loading } = useUserPermissions();
  const router = useRouter();
  const params = useParams();
  const commissionId = params.commission_id as string;
  const { canAccessCommission, loading: permissionsLoading } =
    useCommissionPermissions(commissionId);

  // React Query hooks
  const {
    data: commission,
    isLoading: commissionLoading,
    error: commissionError,
  } = useCommission(commissionId);

  const {
    data: inventoryItems = [],
    isLoading: inventoryLoading,
    error: inventoryError,
  } = useInventoryItems(commissionId);

  useEffect(() => {
    if (!loading && !permissionsLoading && !canAccessCommission) {
      router.push("/application");
    }
  }, [loading, permissionsLoading, canAccessCommission, router]);

  // Loading states
  const isLoading = loading || permissionsLoading || commissionLoading;

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!canAccessCommission) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">Acesso negado a esta comissão</p>
        </CardContent>
      </Card>
    );
  }

  if (commissionError) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">
            Erro ao carregar comissão: {(commissionError as Error)?.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Botão de voltar */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() =>
            router.push(`/application/commissions/${commissionId}`)
          }
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Comissão
        </Button>

        {commission && (
          <div>
            <h1 className="text-2xl font-bold">{commission.name}</h1>
            <p className="text-muted-foreground">
              Inventário • {inventoryItems.length} itens
            </p>
          </div>
        )}
      </div>

      {/* Componente base com todas as funcionalidades */}
      <InventoryPageBase
        backRoute={`/application/commissions/${commissionId}`}
        errorRoute="/application"
        commissionId={commissionId}
      />
    </div>
  );
}
