"use client";

import LoadingScreen from "@/components/custom/loading";
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
import { useCommissionPermissions } from "@/hooks/use-commission-permissions";
import { useUserPermissions } from "@/hooks/use-user-permissions";
import type { CommissionWithRelations, UserProfile } from "@/interface";
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

  const [commission, setCommission] = useState<CommissionWithRelations | null>(
    null
  );
  const [members, setMembers] = useState<CommissionMemberWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar dados da comissão
        const commissionResponse = await fetch(
          `/api/commission/${commissionId}`
        );
        if (!commissionResponse.ok) {
          throw new Error("Comissão não encontrada");
        }
        const commissionData = await commissionResponse.json();
        setCommission(commissionData);

        // Buscar membros da comissão
        const membersResponse = await fetch(
          `/api/commission-member?commissionId=${commissionId}`
        );
        if (membersResponse.ok) {
          const membersData = await membersResponse.json();
          setMembers(membersData);
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setError("Erro ao carregar dados");
      } finally {
        setIsLoading(false);
      }
    };

    if (commissionId && canAccessCommission) {
      fetchData();
    }
  }, [commissionId, canAccessCommission]);

  const handleAddMember = async (userId: string, role: string) => {
    try {
      const response = await fetch("/api/commission-member", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          commissionId,
          roleInCommission: role,
        }),
      });

      if (response.ok) {
        // Recarregar dados dos membros
        const membersResponse = await fetch(
          `/api/commission-member?commissionId=${commissionId}`
        );
        if (membersResponse.ok) {
          const membersData = await membersResponse.json();
          setMembers(membersData);
        }
        setIsAddModalOpen(false);
      } else {
        const errorData = await response.json();
        alert(`Erro ao adicionar membro: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Erro ao adicionar membro:", error);
      alert("Erro inesperado ao adicionar membro");
    }
  };

  const handleRemoveMember = async (userId: string, userName: string) => {
    // Confirmar remoção
    const confirmRemoval = confirm(
      `Tem certeza que deseja remover "${userName}" desta comissão?\n\nEsta ação irá:\n- Remover o usuário da comissão "${commission?.name}"\n- Remover suas permissões nesta comissão\n- Manter o usuário no sistema (não exclui o usuário)\n\nEsta ação não pode ser desfeita.`
    );

    if (!confirmRemoval) return;

    try {
      const response = await fetch(
        `/api/commission-member?userId=${userId}&commissionId=${commissionId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // Recarregar dados dos membros
        const membersResponse = await fetch(
          `/api/commission-member?commissionId=${commissionId}`
        );
        if (membersResponse.ok) {
          const membersData = await membersResponse.json();
          setMembers(membersData);
        }
        alert(`"${userName}" foi removido da comissão com sucesso.`);
      } else {
        const errorData = await response.json();
        alert(`Erro ao remover membro: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Erro ao remover membro:", error);
      alert("Erro inesperado ao remover membro");
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
          <p className="text-red-500">{error || "Comissão não encontrada"}</p>
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

  const sortedMembers = [...members].sort((a, b) => {
    const roleOrder = { Presidente: 0, Membro: 1 };
    return roleOrder[a.roleInCommission] - roleOrder[b.roleInCommission];
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-[var(--bg-simple)] shadow-lg">
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
        <Card className="bg-[var(--card-color)]">
          <CardHeader>
            <CardTitle className="text-[var(--font-color)] flex items-center gap-2">
              <Users className="w-5 h-5" />
              Lista de Membros ({members.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {members.map((member) => {
                const RoleIcon = getRoleIcon(member.roleInCommission);
                return (
                  <Card
                    key={member.userId}
                    className="bg-[var(--bg-simple)] border border-[var(--border-color)] hover:bg-[var(--hover-color)] transition-colors cursor-pointer"
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
                          <div className="flex items-center justify-between mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {member.roleInCommission}
                            </Badge>
                            <div className="flex gap-1">
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
        <Card className="bg-[var(--card-color)]">
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
          <Card className="bg-[var(--card-color)]">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Crown className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--font-color)]">
                    {
                      members.filter((m) => m.roleInCommission === "Presidente")
                        .length
                    }
                  </p>
                  <p className="text-sm text-[var(--font-color)] opacity-70">
                    Presidentes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[var(--card-color)]">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--font-color)]">
                    {
                      members.filter((m) => m.roleInCommission === "Membro")
                        .length
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

      {/* Modal para adicionar membro */}
      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddMember}
        commissionId={commissionId}
        currentMembers={members.map((m) => m.userId)}
        campusId={commission?.campus?.id}
      />
    </div>
  );
}
