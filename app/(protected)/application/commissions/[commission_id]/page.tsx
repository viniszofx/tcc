"use client";

import LoadingScreen from "@/components/custom/loading";
import { PageTitle } from "@/components/custom/page-title";
import { EditComissionModal } from "@/components/manager-comissions/edit-comission-modal";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDeleteCommission } from "@/hooks/mutations/use-mutations";
import { useCommissionDetailData } from "@/hooks/queries/use-page-data";
import { useCommissionPermissions } from "@/hooks/use-commission-permissions";
import { useUserPermissions } from "@/hooks/use-consolidated-user";
import {
  Building2,
  CalendarDays,
  Edit,
  FileText,
  History,
  Package,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CommissionDetailPage() {
  const { user, loading } = useUserPermissions();
  const router = useRouter();
  const params = useParams();
  const commissionId = params.commission_id as string;
  const [editModalOpen, setEditModalOpen] = useState(false);

  const {
    canAccessCommission,
    canUploadToCommission,
    canManageMembers,
    loading: permissionsLoading,
  } = useCommissionPermissions(commissionId);

  // Usar hook otimizado para buscar dados da comissão
  const {
    commission,
    isLoading: commissionLoading,
    error: commissionError,
    refetch,
  } = useCommissionDetailData(commissionId);

  // Mutation para deletar comissão
  const deleteCommissionMutation = useDeleteCommission();

  useEffect(() => {
    // Debug logs para entender o problema
    console.log('Commission Detail Debug:', {
      loading,
      permissionsLoading,
      canAccessCommission,
      canUploadToCommission,
      canManageMembers,
      user: user ? {
        id: user.id,
        role: user.role,
        commissions: user.commissions,
        organizationMembers: user.organizationMembers
      } : null,
      commissionId
    });

    if (!loading && !permissionsLoading && !canAccessCommission) {
      console.warn('Redirecionando usuário - sem acesso à comissão');
      // Redirecionar para a listagem de comissões com uma mensagem
      router.push("/application/commissions?error=access_denied");
    }
  }, [loading, permissionsLoading, canAccessCommission, router, user, canUploadToCommission, canManageMembers, commissionId]);

  const handleEditCommission = () => {
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
  };

  const handleSaveEditModal = (updatedCommission: any) => {
    setEditModalOpen(false);
    refetch();
  };

  const handleDeleteCommission = async () => {
    if (!commission) return;

    const confirmDelete = confirm(
      `Tem certeza que deseja excluir a comissão "${commission.name}"?\n\n` +
      "Esta ação irá:\n" +
      "- Excluir permanentemente a comissão\n" +
      "- Remover todos os membros da comissão\n" +
      "- Manter o histórico de inventário para auditoria\n\n" +
      "Esta ação NÃO PODE ser desfeita!"
    );

    if (!confirmDelete) return;

    try {
      await deleteCommissionMutation.mutateAsync(commissionId);
      toast.success("Comissão excluída com sucesso!");
      router.push("/application/commissions");
    } catch (error) {
      console.error("Erro ao excluir comissão:", error);
      toast.error("Erro ao excluir comissão. Tente novamente.");
    }
  };

  // Verificar se o usuário pode gerenciar a comissão
  // - Administrador global ("admin global" em qualquer organização)
  // - Administrador da organização que contém a comissão
  // - Administrador direto (role "admin")
  // - Presidente da comissão
  const isGlobalAdmin =
    user?.organizationMembers?.some(
      (member: any) => member.role === "admin global"
    ) || false;

  const isOrgAdmin =
    user?.organizationMembers?.some((member: any) => member.role === "admin") ||
    false;

  // Backward compatibility - verificar role antigo diretamente
  const isAdmin = user?.role === "admin" || isGlobalAdmin || isOrgAdmin;

  const isPresidentOfCommission =
    commission?.members?.some(
      (member: any) =>
        member.userId === user?.id && member.roleInCommission === "Presidente"
    ) || false;

  const canManageCommission =
    isAdmin || // Qualquer tipo de admin
    isPresidentOfCommission; // Presidente da comissão

  if (loading || permissionsLoading || commissionLoading) {
    return <LoadingScreen />;
  }

  if (commissionError || !commission) {
    return (
      <>
        <PageTitle title="Erro - KDÊ" />
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">
              {commissionError?.message || "Comissão não encontrada"}
            </p>
          </CardContent>
        </Card>
      </>
    );
  }

  const menuItems = [
    {
      title: "Inventário",
      description: "Gerenciar itens do inventário",
      href: `/application/commissions/${commissionId}/inventories`,
      icon: Package,
      color: "bg-blue-500",
      show: true, // Todos podem ver inventário (mas podem ter restrições de ação)
    },
    {
      title: "Membros",
      description: "Gerenciar membros da comissão",
      href: `/application/commissions/${commissionId}/members`,
      icon: Users,
      color: "bg-green-500",
      show: canManageMembers, // Apenas quem pode gerenciar membros
    },
    {
      title: "Upload",
      description: "Fazer upload de arquivos",
      href: `/application/commissions/${commissionId}/upload`,
      icon: Upload,
      color: "bg-purple-500",
      show: canUploadToCommission, // Apenas quem pode fazer upload
    },
    {
      title: "Histórico",
      description: "Ver histórico de atividades",
      href: `/application/commissions/${commissionId}/history`,
      icon: History,
      color: "bg-orange-500",
      show: true, // Todos podem ver histórico
    },
  ];

  return (
    <>
      <PageTitle title="Detalhes da Comissão - KDÊ" />
      {canManageCommission && commission && (
        <EditComissionModal
          isOpen={editModalOpen}
          onClose={handleCloseEditModal}
          onSave={handleSaveEditModal}
          onDelete={handleDeleteCommission}
          comissao={commission}
        />
      )}
      <div className="space-y-6">
        {/* Header da Comissão */}
        <Card className="bg-[var(--bg-simple)] shadow-lg border border-[var(--border-color)]">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold text-[var(--font-color)]">
                  {commission.name}
                </CardTitle>
                <CardDescription className="text-lg text-[var(--font-color)] opacity-70">
                  {commission.description || "Nenhuma descrição fornecida"}
                </CardDescription>
                <div className="flex gap-2 flex-wrap">
                  <Badge
                    variant="secondary"
                    className="bg-[var(--bg-simple)] text-[var(--font-color)]"
                  >
                    <Building2 className="w-3 h-3 mr-1" />
                    {commission.campus?.name || "Campus não definido"}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-[var(--bg-simple)] text-[var(--font-color)]"
                  >
                    <CalendarDays className="w-3 h-3 mr-1" />
                    {commission.year}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-[var(--bg-simple)] text-[var(--font-color)]"
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    {commission.type}
                  </Badge>
                </div>
              </div>
              {/* Ações Administrativas */}
              {canManageCommission && (
                <div className="flex gap-2 mt-4 flex-wrap">
                  <button
                    type="button"
                    onClick={handleEditCommission}
                    className="flex items-center justify-center rounded-md border border-[var(--border-color)] bg-[var(--bg-simple)] text-[var(--font-color)] hover:bg-[var(--hover-3-color)] transition-all p-2"
                  >
                    <Edit className="w-5 h-5" />
                    <span className="hidden sm:inline ml-2">Editar Comissão</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteCommission}
                    disabled={deleteCommissionMutation.isPending}
                    className="flex items-center justify-center rounded-md bg-red-600 hover:bg-red-700 text-white transition-all p-2 disabled:opacity-70"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span className="hidden sm:inline ml-2">
                      {deleteCommissionMutation.isPending
                        ? "Excluindo..."
                        : "Excluir Comissão"}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Menu de Ações */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {menuItems
            .filter((item) => item.show)
            .map((item, index) => (
              <Link key={index} href={item.href}>
                <Card className="h-full bg-[var(--bg-simple)] border-[var(--border-color)] hover:bg-[var(--hover-color)] transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-3 rounded-lg ${item.color} text-white group-hover:scale-110 transition-transform`}
                      >
                        <item.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-[var(--font-color)] group-hover:text-white transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-sm text-[var(--font-color)] opacity-70 group-hover:text-white group-hover:opacity-90 transition-colors">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
        </div>

        {/* Informações Adicionais */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-[var(--bg-simple)] shadow-lg border border-[var(--border-color)]">
            <CardHeader>
              <CardTitle className="text-[var(--font-color)]">
                Informações da Comissão
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[var(--font-color)] opacity-70">
                  Nome
                </label>
                <p className="text-[var(--font-color)]">{commission.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--font-color)] opacity-70">
                  Tipo
                </label>
                <p className="text-[var(--font-color)]">{commission.type}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--font-color)] opacity-70">
                  Ano
                </label>
                <p className="text-[var(--font-color)]">{commission.year}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--font-color)] opacity-70">
                  Campus
                </label>
                <p className="text-[var(--font-color)]">
                  {commission.campus?.name || "Não definido"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[var(--bg-simple)] shadow-lg border border-[var(--border-color)]">
            <CardHeader>
              <CardTitle className="text-[var(--font-color)]">
                Estatísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-[var(--font-color)] opacity-70">
                  Total de Membros
                </span>
                <span className="font-semibold text-[var(--font-color)]">
                  {commission.members?.length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--font-color)] opacity-70">
                  Itens no Inventário
                </span>
                <span className="font-semibold text-[var(--font-color)]">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--font-color)] opacity-70">
                  Status
                </span>
                <span className="font-semibold text-[var(--font-color)]">
                  {commission.active ? "Ativa" : "Inativa"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
