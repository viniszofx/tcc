"use client";

import LoadingScreen from "@/components/custom/loading";
import { PageTitle } from "@/components/custom/page-title";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useRemoveCommissionMember,
  useUpdateCommissionMember,
} from "@/hooks/mutations/use-mutations";
import { useCommissionMemberDetailData } from "@/hooks/queries/use-page-data";
import { useCommissionPermissions } from "@/hooks/use-commission-permissions";
import { useUserPermissions } from "@/hooks/use-consolidated-user";
import {
  ArrowLeft,
  Calendar,
  Edit,
  Mail,
  Save,
  Shield,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CommissionMemberDetailPage() {
  const {
    user,
    loading: userLoading,
    canManageOrganizations,
    canManageCommissionMembers,
  } = useUserPermissions();
  const params = useParams();
  const router = useRouter();
  const memberId = params.id as string;
  const commissionId = params.commission_id as string;
  const { canManageMembers, loading: permissionsLoading } =
    useCommissionPermissions(commissionId);

  const [isEditing, setIsEditing] = useState(false);
  const [newRole, setNewRole] = useState<string>("");

  const {
    member: memberData,
    commission,
    isLoading,
    error,
    refetch,
  } = useCommissionMemberDetailData(commissionId, memberId);

  // Mutations
  const updateMemberMutation = useUpdateCommissionMember();
  const removeMemberMutation = useRemoveCommissionMember();

  const member = memberData
    ? {
      ...memberData.user,
      roleInCommission: memberData.roleInCommission,
    }
    : null;

  useEffect(() => {
    if (!permissionsLoading && !canManageMembers) {
      router.push("/application");
    }
  }, [permissionsLoading, canManageMembers, router]);

  useEffect(() => {
    if (member && !isEditing) {
      setNewRole(member.roleInCommission);
    }
  }, [member, isEditing]);

  const handleGoBack = () => {
    router.push(`/application/commissions/${commissionId}/members`);
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setNewRole(member?.roleInCommission || "Membro");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNewRole(member?.roleInCommission || "Membro");
  };

  const handleSaveRole = async () => {
    if (!member || !newRole) return;

    try {
      await updateMemberMutation.mutateAsync({
        userId: memberId,
        commissionId,
        roleInCommission: newRole,
      });

      setIsEditing(false);
      // O refetch acontece automaticamente via invalidateQueries na mutation
    } catch (error) {
      console.error("Erro ao atualizar papel do membro:", error);
      toast.error("Erro ao atualizar papel do membro. Tente novamente.");
    }
  };

  const handleRemoveMember = async () => {
    if (!member) return;

    const confirmRemoval = confirm(
      `Tem certeza que deseja remover "${member.name || member.email
      }" da comissão? Esta ação não pode ser desfeita.`
    );

    if (!confirmRemoval) return;

    try {
      await removeMemberMutation.mutateAsync({
        userId: memberId,
        commissionId,
      });

      toast.success(
        `"${member.name || member.email}" foi removido da comissão com sucesso.`
      );
      router.push(`/application/commissions/${commissionId}/members`);
    } catch (error) {
      console.error("Erro ao remover membro:", error);
      toast.error("Erro inesperado ao remover membro");
    }
  };

  // Verificar se o usuário pode gerenciar membros (admin, org admin, ou presidente da comissão)
  const canEditMemberRole =
    canManageOrganizations || canManageCommissionMembers;

  if (userLoading || permissionsLoading || isLoading) {
    return <LoadingScreen />;
  }

  if (!canManageMembers) {
    return (
      <>
        <PageTitle title="Acesso negado - KDÊ" />
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">Acesso negado</p>
          </CardContent>
        </Card>
      </>
    );
  }

  if (!member) {
    return (
      <>
        <PageTitle title="Membro não encontrado - KDÊ" />
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-500 mb-4">Membro não encontrado</p>
              <Button onClick={handleGoBack} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Membros
              </Button>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageTitle title="Detalhes dos membros - KDÊ" />
      <div className="space-y-6">
        {/* Header com navegação */}
        <Card className="bg-[var(--bg-simple)] shadow-lg border border-[var(--border-color)]">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div>
                  <CardTitle className="text-2xl font-bold text-[var(--font-color)]">
                    {member.name || member.email}
                  </CardTitle>
                  <CardDescription className="text-[var(--font-color)] opacity-70">
                    Membro da Comissão: {commission?.name || "Carregando..."}
                  </CardDescription>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {canEditMemberRole && (
                  <>
                    {!isEditing ? (
                      <Button
                        variant="outline"
                        onClick={handleStartEdit}
                        className="bg-[var(--bg-simple)] text-[var(--font-color)] border-[var(--border-color)] hover:bg-[var(--hover-3-color)]"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar Papel
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          onClick={handleSaveRole}
                          disabled={
                            updateMemberMutation.isPending ||
                            newRole === member.roleInCommission
                          }
                          className="bg-green-600 text-white hover:bg-green-700 border-green-600"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {updateMemberMutation.isPending
                            ? "Salvando..."
                            : "Salvar"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleCancelEdit}
                          disabled={updateMemberMutation.isPending}
                          className="bg-[var(--bg-simple)] text-[var(--font-color)] border-[var(--border-color)] hover:bg-[var(--hover-3-color)]"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancelar
                        </Button>
                      </>
                    )}
                  </>
                )}
                {canManageMembers && (
                  <Button
                    variant="destructive"
                    onClick={handleRemoveMember}
                    disabled={removeMemberMutation.isPending}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {removeMemberMutation.isPending
                      ? "Removendo..."
                      : "Remover da Comissão"}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Informações do Membro */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="w-full bg-[var(--bg-simple)] border border-[var(--border-color)]">
            <CardHeader>
              <CardTitle className="text-[var(--font-color)] flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-6 md:px-8">
              <div>
                <label className="text-sm font-medium text-[var(--font-color)] opacity-70">
                  Nome Completo
                </label>
                <p className="text-[var(--font-color)]">
                  {member.name || "Não informado"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--font-color)] opacity-70">
                  E-mail
                </label>
                <p className="text-[var(--font-color)] flex items-center gap-2 break-all">
                  <Mail className="w-4 h-4" />
                  {member.email}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--font-color)] opacity-70">
                  ID do Usuário
                </label>
                <p className="font-mono text-sm text-[var(--font-color)] opacity-70">
                  {member.id}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="w-full bg-[var(--bg-simple)] border border-[var(--border-color)]">
            <CardHeader>
              <CardTitle className="text-[var(--font-color)] flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Permissões na Comissão
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-6 md:px-8">
              <div>
                <label className="text-sm font-medium text-[var(--font-color)] opacity-70">
                  Papel na Comissão
                </label>
                <div className="flex items-center gap-2">
                  {isEditing && canEditMemberRole ? (
                    <Select
                      value={newRole}
                      onValueChange={setNewRole}
                      disabled={updateMemberMutation.isPending}
                    >
                      <SelectTrigger className="w-48 bg-[var(--bg-simple)] border-[var(--border-color)] text-[var(--font-color)]">
                        <SelectValue placeholder="Selecione o papel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Membro">Membro</SelectItem>
                        <SelectItem value="Presidente">Presidente</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge
                      variant={
                        member.roleInCommission === "Presidente"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {member.roleInCommission === "Presidente"
                        ? "Presidente"
                        : "Membro"}
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--font-color)] opacity-70">
                  Papel no Sistema
                </label>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={member.role === "admin" ? "destructive" : "outline"}
                  >
                    {member.role === "admin"
                      ? "Admin do Sistema"
                      : "Usuário Padrão"}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--font-color)] opacity-70">
                  ID do Usuário
                </label>
                <p className="font-mono text-sm text-[var(--font-color)] opacity-70">
                  {member.id}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informações da Comissão */}
        {commission && (
          <Card className="bg-[var(--bg-simple)] border border-[var(--border-color)]">
            <CardHeader>
              <CardTitle className="text-[var(--font-color)] flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Detalhes da Comissão
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-[var(--font-color)] opacity-70">
                    Nome da Comissão
                  </label>
                  <p className="text-[var(--font-color)]">{commission.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--font-color)] opacity-70">
                    Descrição
                  </label>
                  <p className="text-[var(--font-color)]">
                    {commission.description || "Nenhuma descrição fornecida"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--font-color)] opacity-70">
                    Status da Comissão
                  </label>
                  <div className="flex items-center gap-2">
                    <Badge variant={commission.active ? "default" : "secondary"}>
                      {commission.active ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--font-color)] opacity-70">
                    ID da Comissão
                  </label>
                  <p className="font-mono text-sm text-[var(--font-color)] opacity-70">
                    {commission.id}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
