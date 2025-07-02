"use client";

import LoadingScreen from "@/components/custom/loading";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCommissionPermissions } from "@/hooks/use-commission-permissions";
import { useUserPermissions } from "@/hooks/use-user-permissions";
import type { CommissionWithRelations } from "@/interface";
import {
  Building2,
  CalendarDays,
  FileText,
  History,
  Package,
  Upload,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CommissionDetailPage() {
  const { user, loading } = useUserPermissions();
  const router = useRouter();
  const params = useParams();
  const commissionId = params.commission_id as string;

  const { canAccessCommission, loading: permissionsLoading } =
    useCommissionPermissions(commissionId);

  const [commission, setCommission] = useState<CommissionWithRelations | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !permissionsLoading && !canAccessCommission) {
      router.push("/application");
    }
  }, [loading, permissionsLoading, canAccessCommission, router]);

  useEffect(() => {
    const fetchCommission = async () => {
      try {
        const response = await fetch(`/api/commission/${commissionId}`);
        if (!response.ok) {
          throw new Error("Comissão não encontrada");
        }
        const data = await response.json();
        setCommission(data);
      } catch (error) {
        console.error("Erro ao buscar comissão:", error);
        setError("Erro ao carregar dados da comissão");
      } finally {
        setIsLoading(false);
      }
    };

    if (commissionId && !permissionsLoading && canAccessCommission) {
      fetchCommission();
    }
  }, [commissionId, permissionsLoading, canAccessCommission]);

  if (loading || permissionsLoading || isLoading) {
    return <LoadingScreen />;
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

  const menuItems = [
    {
      title: "Inventário",
      description: "Gerenciar itens do inventário",
      href: `/application/commissions/${commissionId}/inventories`,
      icon: Package,
      color: "bg-blue-500",
    },
    {
      title: "Membros",
      description: "Gerenciar membros da comissão",
      href: `/application/commissions/${commissionId}/members`,
      icon: Users,
      color: "bg-green-500",
    },
    {
      title: "Upload",
      description: "Fazer upload de arquivos",
      href: `/application/commissions/${commissionId}/upload`,
      icon: Upload,
      color: "bg-purple-500",
    },
    {
      title: "Histórico",
      description: "Ver histórico de atividades",
      href: `/application/commissions/${commissionId}/history`,
      icon: History,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header da Comissão */}
      <Card className="bg-[var(--bg-simple)] shadow-lg">
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
                  className="bg-[var(--card-color)] text-[var(--font-color)]"
                >
                  <Building2 className="w-3 h-3 mr-1" />
                  {commission.campus?.name || "Campus não definido"}
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-[var(--card-color)] text-[var(--font-color)]"
                >
                  <CalendarDays className="w-3 h-3 mr-1" />
                  {commission.year}
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-[var(--card-color)] text-[var(--font-color)]"
                >
                  <FileText className="w-3 h-3 mr-1" />
                  {commission.type}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Menu de Ações */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {menuItems.map((item, index) => (
          <Link key={index} href={item.href}>
            <Card className="h-full bg-[var(--card-color)] border-[var(--border-color)] hover:bg-[var(--hover-color)] transition-all duration-300 cursor-pointer group">
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
        <Card className="bg-[var(--card-color)]">
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

        <Card className="bg-[var(--card-color)]">
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
  );
}
