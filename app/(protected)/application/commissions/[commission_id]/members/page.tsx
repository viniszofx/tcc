"use client";

import LoadingScreen from "@/components/custom/loading";
import { PageTitle } from "@/components/custom/page-title";
import AddMemberModal from "@/components/members/add-member-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useAddCommissionMember,
  useRemoveCommissionMember,
} from "@/hooks/mutations/use-mutations";
import { useCommissionMembersData } from "@/hooks/queries/use-page-data";
import { useCommissionPermissions } from "@/hooks/use-commission-permissions";
import { useUserPermissions } from "@/hooks/use-user-permissions-rq";
import type { UserProfile } from "@/interface";
import { Crown, Plus, User, Users } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface CommissionMemberWithUser {
  userId: string;
  commissionId: string;
  roleInCommission: "Presidente" | "Membro";
  user: UserProfile;
}

export default function CommissionMembersPage() {
  const { user, loading } = useUserPermissions();
  const router = useRouter();
  const params = useParams();
  const commissionId = params.commission_id as string;
  const {
    canAccessCommission,
    canManageMembers,
    loading: permissionsLoading,
  } = useCommissionPermissions(commissionId);

  // Usar hook otimizado para buscar dados da comissão e membros
  const { commission, members, isLoading, error, refetchMembers } =
    useCommissionMembersData(commissionId);

  // Mutations para gerenciar membros
  const addMemberMutation = useAddCommissionMember();
  const removeMemberMutation = useRemoveCommissionMember();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    if (
      !loading &&
      !permissionsLoading &&
      (!canAccessCommission || !canManageMembers)
    ) {
      router.push("/application");
    }
  }, [
    loading,
    permissionsLoading,
    canAccessCommission,
    canManageMembers,
    router,
  ]);

  const handleAddMember = async (userId: string, role: string) => {
    try {
      await addMemberMutation.mutateAsync({
        userId,
        commissionId,
        roleInCommission: role,
      });
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Erro ao adicionar membro:", error);
      alert("Erro ao adicionar membro");
    }
  };

  const handleRemoveMember = async (userId: string, userName: string) => {
    const confirmRemoval = confirm(
      `Tem certeza que deseja remover "${userName}" desta comissão?\n\nEsta ação irá:\n- Remover o usuário da comissão "${commission?.name}"\n- Remover suas permissões nesta comissão\n- Manter o usuário no sistema (não exclui o usuário)\n\nEsta ação não pode ser desfeita.`
    );

    if (!confirmRemoval) return;

    try {
      await removeMemberMutation.mutateAsync({
        userId,
        commissionId,
      });
      alert(`"${userName}" foi removido da comissão com sucesso.`);
    } catch (error) {
      console.error("Erro ao remover membro:", error);
      alert("Erro ao remover membro");
    }
  };

  if (loading || permissionsLoading || isLoading) {
    return <LoadingScreen />;
  }

  if (!canAccessCommission || !canManageMembers) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">
            {!canAccessCommission
              ? "Acesso negado a esta comissão"
              : "Você não tem permissão para gerenciar membros desta comissão"}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error || !commission) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">
            {error?.message || "Comissão não encontrada"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Presidente":
        return Crown;
      default:
        return User;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Presidente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const sortedMembers = [...(members as CommissionMemberWithUser[])].sort(
    (a, b) => {
      const roleOrder = { Presidente: 0, Membro: 1 };
      return roleOrder[a.roleInCommission] - roleOrder[b.roleInCommission];
    }
  );

  return (
    <>
      <PageTitle title="Gerenciar Membros - KDÊ" />
      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-[var(--bg-simple)] shadow-lg border border-[var(--border-color)]">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold text-[var(--font-color)]">
                  Membros - {commission.name}
                </CardTitle>
                <CardDescription className="text-[var(--font-color)] opacity-70">
                  {members.length} {members.length === 1 ? "membro" : "membros"}{" "}
                  na comissão
                </CardDescription>
              </div>
              {canManageMembers && (
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Membro
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Lista de Membros */}
        {members.length > 0 && (
          <Card className="bg-[var(--bg-simple)] border border-[var(--border-color)]">
            <CardHeader>
              <CardTitle className="text-[var(--font-color)] flex items-center gap-2">
                <Users className="w-5 h-5" />
                Lista de Membros ({members.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sortedMembers.map((member: CommissionMemberWithUser) => {
                  const RoleIcon = getRoleIcon(member.roleInCommission);
                  return (
                    <Card
                      key={member.userId}
                      className="bg-[var(--bg-simple)] border border-[var(--border-color)]"
                      onClick={() =>
                        router.push(
                          `/application/commissions/${commissionId}/members/${member.userId}`
                        )
                      }
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-[var(--secondary-color)] rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-[var(--font-color)]">
                              {member.user?.name?.charAt(0) ||
                                member.user?.email?.charAt(0) ||
                                "?"}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-[var(--font-color)] truncate">
                                {member.user?.name ||
                                  member.user?.email ||
                                  "Usuário"}
                              </h4>
                              <RoleIcon className="w-4 h-4 text-[var(--font-color)] opacity-70" />
                            </div>
                            <p className="text-sm text-[var(--font-color)] opacity-70 truncate">
                              {member.user?.email}
                            </p>
                            <div className="mt-2 space-y-2">
                              <Badge variant="secondary" className="text-xs">
                                {member.roleInCommission}
                              </Badge>
                              <div className="flex flex-wrap justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 text-xs px-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(
                                      `/application/commissions/${commissionId}/members/${member.userId}`
                                    );
                                  }}
                                >
                                  Ver Detalhes
                                </Button>
                                {canManageMembers && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 text-xs px-2 text-red-600 hover:text-red-800 hover:bg-red-50"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveMember(
                                        member.userId,
                                        member.user?.name ||
                                        member.user?.email ||
                                        "Usuário"
                                      );
                                    }}
                                  >
                                    Remover
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quando não há membros */}
        {members.length === 0 && (
          <Card className="bg-[var(--bg-simple)] border border-[var(--border-color)]">
            <CardContent className="p-12 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-[var(--secondary-color)] rounded-full flex items-center justify-center mx-auto">
                  <Users className="w-8 h-8 text-[var(--font-color)] opacity-50" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--font-color)] mb-2">
                    Nenhum membro encontrado
                  </h3>
                  <p className="text-[var(--font-color)] opacity-70 mb-4">
                    Esta comissão ainda não possui membros cadastrados
                  </p>
                  {canManageMembers && (
                    <Button
                      onClick={() => setIsAddModalOpen(true)}
                      className="bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)]"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Primeiro Membro
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estatísticas dos Membros */}
        {members.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-[var(--bg-simple)] border border-[var(--border-color)]">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Crown className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[var(--font-color)]">
                      {
                        (members as CommissionMemberWithUser[]).filter(
                          (m) => m.roleInCommission === "Presidente"
                        ).length
                      }
                    </p>
                    <p className="text-sm text-[var(--font-color)] opacity-70">
                      Presidentes
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[var(--bg-simple)] border border-[var(--border-color)]">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[var(--font-color)]">
                      {
                        (members as CommissionMemberWithUser[]).filter(
                          (m) => m.roleInCommission === "Membro"
                        ).length
                      }
                    </p>
                    <p className="text-sm text-[var(--font-color)] opacity-70">
                      Membros
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <AddMemberModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddMember}
          commissionId={commissionId}
          currentMembers={(members as CommissionMemberWithUser[]).map(
            (m) => m.userId
          )}
          campusId={commission?.campus?.id}
        />
      </div>
    </>
  );
}
