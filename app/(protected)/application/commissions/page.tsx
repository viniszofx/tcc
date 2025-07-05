"use client";

import LoadingScreen from "@/components/custom/loading";
import { PageTitle } from "@/components/custom/page-title";
import { AddComissionModal } from "@/components/manager-comissions/add-comission-modal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NavigationButton } from "@/components/ui/navigation-button";
import { useCampuses } from "@/hooks/queries/use-campus-query";
import {
  useCommissions,
  useCreateCommission,
} from "@/hooks/queries/use-commissions-query";
import { useUserPermissions } from "@/hooks/use-consolidated-user";
import type { CommissionWithRelations } from '@/types';
import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useCommissionPermissions } from "../../../../lib/permissions/hooks";

export default function CommissionsPage() {
  const {
    user,
    loading: permissionsLoading,
    error: permissionsError,
  } = useUserPermissions();

  const { canAccessCommission, canManageCommissions } =
    useCommissionPermissions();

  const router = useRouter();
  const searchParams = useSearchParams();

  // Verificar se há erro de acesso negado
  const hasAccessError = searchParams?.get("error") === "access_denied";

  // React Query hooks
  const {
    data: allCommissions = [],
    isLoading: commissionsLoading,
    error: commissionsError,
  } = useCommissions();

  const {
    data: campuses = [],
    isLoading: campusesLoading,
    error: campusesError,
  } = useCampuses();

  // Mutations
  const createCommissionMutation = useCreateCommission();

  // Local state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // A API já filtra as comissões baseado nas permissões do usuário
  const commissions = allCommissions || [];

  // Removido redirecionamento automático - a API já controla o acesso

  // Loading states
  const isLoading =
    permissionsLoading ||
    commissionsLoading ||
    (canManageCommissions && campusesLoading);

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Removido bloqueio de acesso - a API já controla as permissões

  if (permissionsError || commissionsError || campusesError) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">
            Erro:{" "}
            {permissionsError ||
              (commissionsError as Error)?.message ||
              (campusesError as Error)?.message}
          </p>
          {campusesError && (
            <p className="text-yellow-600 mt-2">
              Problema ao carregar campus. Isso pode afetar a criação de
              comissões.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  const handleAddCommission = async (commissionData: any) => {
    try {
      await createCommissionMutation.mutateAsync(commissionData);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Erro ao criar comissão:", error);

      // Exibir erro mais detalhado para o usuário
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao criar comissão";

      toast.error(`Erro ao criar comissão: ${errorMessage}`);
    }
  };

  const getCampusName = (commission: CommissionWithRelations) => {
    return commission.campus?.name || "Campus não encontrado";
  };

  return (
    <>
      <PageTitle title="Comissões - KDÊ" />
      <Card className="w-full bg-[var(--bg-simple)] shadow-lg transition-all duration-300">
        {hasAccessError && (
          <div className="mx-6 mt-6 p-4 rounded-md bg-red-50 border border-red-200">
            <div className="flex items-center gap-2">
              <div className="text-red-800">
                <p className="font-medium">Acesso Negado</p>
                <p className="text-sm">
                  Você não tem permissão para acessar a comissão solicitada.
                  Abaixo estão listadas apenas as comissões que você tem acesso.
                </p>
              </div>
            </div>
          </div>
        )}

        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6">
          <div>
            <CardTitle className="text-2xl font-bold text-[var(--font-color)] md:text-3xl">
              {canManageCommissions ? "Todas as Comissões" : "Minhas Comissões"}
            </CardTitle>
            <CardDescription className="text-[var(--font-color)] opacity-70">
              {commissions.length > 0
                ? `Lista de comissões ${canManageCommissions
                  ? "do sistema"
                  : `do ${getCampusName(commissions[0])}`
                }`
                : "Nenhuma comissão encontrada"}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {canManageCommissions && (
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white transition-all w-full sm:w-auto"
                disabled={
                  campuses.length === 0 ||
                  createCommissionMutation.isPending ||
                  campusesLoading
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                {campusesLoading ? "Carregando..." : "Adicionar Comissão"}
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          {/* Debug temporário */}
          {process.env.NODE_ENV === "development" && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-sm">
                <div>
                  <strong>User ID:</strong> {user?.id}
                </div>
                <div>
                  <strong>User Email:</strong> {user?.email}
                </div>
                <div>
                  <strong>User Role:</strong> {user?.role}
                </div>
                <div>
                  <strong>Organization Members:</strong>{" "}
                  {JSON.stringify(user?.organizationMembers)}
                </div>
                <div>
                  <strong>Is Global Admin:</strong>{" "}
                  {user?.organizationMembers?.some(
                    (member: any) => member.role === "admin global"
                  )
                    ? "SIM"
                    : "NÃO"}
                </div>
                <div>
                  <strong>Is Org Admin:</strong>{" "}
                  {user?.organizationMembers?.some(
                    (member: any) => member.role === "admin"
                  )
                    ? "SIM"
                    : "NÃO"}
                </div>
                <div>
                  <strong>Pode Gerenciar Comissões:</strong>{" "}
                  {canManageCommissions ? "SIM" : "NÃO"}
                </div>
                <div>
                  <strong>Total Comissões:</strong> {allCommissions.length}
                </div>
                <div>
                  <strong>Comissões Filtradas:</strong> {commissions.length}
                </div>
                <div>
                  <strong>User Campuses:</strong> {JSON.stringify(user?.campuses)}
                </div>
                <div>
                  <strong>User Commissions:</strong>{" "}
                  {JSON.stringify(user?.commissions)}
                </div>
              </CardContent>
            </Card>
          )}

          {commissions.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {commissions.map((commission) => (
                <Card
                  key={commission.id}
                  className="bg-[var(--bg-simple)] border-[var(--border-color)]"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-[var(--font-color)]">
                      {commission.name}
                    </CardTitle>
                    <CardDescription className="text-[var(--font-color)] opacity-70">
                      Tipo: {commission.type} | Ano: {commission.year}
                    </CardDescription>
                    <CardDescription className="text-[var(--font-color)] opacity-70">
                      Campus: {getCampusName(commission)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <p className="text-[var(--font-color)] opacity-80 text-sm mb-4">
                      {commission.description || "Nenhuma descrição fornecida"}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-end">
                      <NavigationButton
                        href={`/application/commissions/${commission.id}`}
                        variant="outline"
                        size="sm"
                        className="border-[var(--border-input)] bg-[var(--card-color)] text-[var(--font-color)] hover:bg-[var(--hover-color)] hover:text-white"
                      >
                        Ver Detalhes
                      </NavigationButton>
                      <NavigationButton
                        href={`/application/commissions/${commission.id}/inventories`}
                        size="sm"
                        className="bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white"
                      >
                        Inventário
                      </NavigationButton>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-[var(--font-color)] opacity-70 text-lg">
                {canManageCommissions
                  ? "Nenhuma comissão cadastrada no sistema ainda."
                  : "Você não faz parte de nenhuma comissão ainda."}
              </p>
            </div>
          )}
        </CardContent>

        {canManageCommissions && (
          <AddComissionModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onAddComission={handleAddCommission}
            campuses={campuses}
          />
        )}
      </Card>
    </>
  );
}
