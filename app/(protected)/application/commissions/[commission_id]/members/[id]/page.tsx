"use client";

import LoadingScreen from "@/components/custom/loading";
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
import type { UserRole } from "@/hooks/use-user-permissions";
import { useUserPermissions } from "@/hooks/use-user-permissions";
import { ArrowLeft, Calendar, Mail, Shield, User } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CommissionMemberDetailPage() {
  const { user, loading: userLoading } = useUserPermissions();
  const params = useParams();
  const router = useRouter();
  const memberId = params.id as string;
  const commissionId = params.commission_id as string;
  const { canManageMembers, loading: permissionsLoading } =
    useCommissionPermissions(commissionId);

  const [isLoading, setIsLoading] = useState(true);
  const [member, setMember] = useState<
    (UserRole & { roleInCommission?: "Presidente" | "Membro" }) | null
  >(null);
  const [commission, setCommission] = useState<any>(null);

  useEffect(() => {
    if (!permissionsLoading && !canManageMembers) {
      router.push("/application");
    }
  }, [permissionsLoading, canManageMembers, router]);

  useEffect(() => {
    const fetchMemberData = async () => {
      console.log("Buscando dados do membro:", { memberId, commissionId });
      try {
        // Buscar dados do membro na comissão
        const memberResponse = await fetch(
          `/api/commission-member?commissionId=${commissionId}&userId=${memberId}`
        );
        if (memberResponse.ok) {
          const memberData = await memberResponse.json();
          // A API retorna um único objeto quando busca por userId e commissionId específicos
          if (memberData) {
            setMember({
              ...memberData.user,
              roleInCommission: memberData.roleInCommission,
            });
          }
        } else {
          console.error("Erro ao buscar membro:", await memberResponse.text());
        }

        // Buscar dados da comissão
        const commissionResponse = await fetch(
          `/api/commission/${commissionId}`
        );
        if (commissionResponse.ok) {
          const commissionData = await commissionResponse.json();
          setCommission(commissionData);
        } else {
          console.error(
            "Erro ao buscar comissão:",
            await commissionResponse.text()
          );
        }
      } catch (error) {
        console.error("Erro ao buscar dados do membro:", error);
        setMember(null);
        setCommission(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (memberId && commissionId && !permissionsLoading) {
      fetchMemberData();
    }
  }, [memberId, commissionId, permissionsLoading]);

  const handleGoBack = () => {
    router.push(`/application/commissions/${commissionId}/members`);
  };

  const handleRemoveMember = async () => {
    if (!member) return;

    const confirmRemoval = confirm(
      `Tem certeza que deseja remover "${member.name || member.email
      }" da comissão? Esta ação não pode ser desfeita.`
    );

    if (!confirmRemoval) return;

    try {
      const response = await fetch(
        `/api/commission-member?userId=${memberId}&commissionId=${commissionId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        alert(
          `"${member.name || member.email
          }" foi removido da comissão com sucesso.`
        );
        router.push(`/application/commissions/${commissionId}/members`);
      } else {
        const errorData = await response.json();
        alert(`Erro ao remover membro: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Erro ao remover membro:", error);
      alert("Erro inesperado ao remover membro");
    }
  };

  if (userLoading || permissionsLoading || isLoading) {
    return <LoadingScreen />;
  }

  if (!canManageMembers) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">Acesso negado</p>
        </CardContent>
      </Card>
    );
  }

  if (!member) {
    return (
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
    );
  }

  return (
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
            {canManageMembers && (
              <Button
                variant="destructive"
                onClick={handleRemoveMember}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Remover da Comissão
              </Button>
            )}
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
  );
}
