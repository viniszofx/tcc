"use client";

import LoadingScreen from "@/components/custom/loading";
import { AddComissionModal } from "@/components/manager-comissions/add-comission-modal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCampuses } from "@/hooks/queries/use-campus-query";
import {
  useCommissions,
  useCreateCommission,
} from "@/hooks/queries/use-commissions-query";
import { useUserPermissions } from "@/hooks/use-user-permissions";
import type { CommissionWithRelations } from "@/interface";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function CommissionsPage() {
  const {
    user,
    canManageCommissions,
    canAccessCommission,
    loading: permissionsLoading,
    error: permissionsError,
  } = useUserPermissions();
  const router = useRouter();

  // React Query hooks
  const {
    data: allCommissions = [],
    isLoading: commissionsLoading,
    error: commissionsError,
  } = useCommissions();

  const { data: campuses = [], isLoading: campusesLoading } = useCampuses();

  // Mutations
  const createCommissionMutation = useCreateCommission();

  // Local state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filtrar comissões baseado no papel do usuário
  const commissions = useMemo(() => {
    if (!user || user.role === "admin") {
      return allCommissions;
    }

    // Para não-admins, filtrar apenas comissões onde o usuário é membro
    return allCommissions.filter((commission) =>
      commission.members?.some((member) => member.userId === user.id)
    );
  }, [allCommissions, user]);

  // Verificar permissões
  useEffect(() => {
    if (!permissionsLoading && !canAccessCommission) {
      router.push("/application");
    }
  }, [permissionsLoading, canAccessCommission, router]);

  // Loading states
  const isLoading =
    permissionsLoading ||
    commissionsLoading ||
    (canManageCommissions && campusesLoading);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!canAccessCommission) {
    return <LoadingScreen />;
  }

  if (permissionsError || commissionsError) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">
            Erro: {permissionsError || (commissionsError as Error)?.message}
          </p>
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
      alert("Erro ao criar comissão");
    }
  };

  const getCampusName = (commission: CommissionWithRelations) => {
    return commission.campus?.name || "Campus não encontrado";
  };

  const pageTitle =
    user?.role === "admin"
      ? "Todas as Comissões"
      : canManageCommissions
      ? "Minhas Comissões (Presidente)"
      : "Minhas Comissões";

  return (
    <Card className="w-full bg-[var(--bg-simple)] shadow-lg transition-all duration-300">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6">
        <div>
          <CardTitle className="text-2xl font-bold text-[var(--font-color)] md:text-3xl">
            {pageTitle}
          </CardTitle>
          <CardDescription className="text-[var(--font-color)] opacity-70">
            {commissions.length > 0
              ? `Lista de comissões ${
                  user?.role === "admin"
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
                campuses.length === 0 || createCommissionMutation.isPending
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Comissão
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
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
                    <Link href={`/application/commissions/${commission.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[var(--border-input)] bg-[var(--card-color)] text-[var(--font-color)] hover:bg-[var(--hover-color)] hover:text-white"
                      >
                        Ver Detalhes
                      </Button>
                    </Link>
                    <Link
                      href={`/application/commissions/${commission.id}/inventories`}
                    >
                      <Button
                        size="sm"
                        className="bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white"
                      >
                        Inventário
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[var(--font-color)] opacity-70 text-lg">
              {user?.role === "admin"
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
  );
}
