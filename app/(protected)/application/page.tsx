"use client";

import LoadingScreen from "@/components/custom/loading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useProfilePageData } from "@/hooks/queries/use-page-data";
import { useUserPermissions } from "@/hooks/use-user-permissions";
import { Building2, Database, Settings, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ApplicationDashboard() {
  const { user, loading, error, ...permissions } = useUserPermissions();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Usar hook otimizado para dados de perfil (com cache)
  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
  } = useProfilePageData(user?.id);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading || profileLoading) {
    return <LoadingScreen />;
  }

  if (error || profileError || !user) {
    router.push("/login");
    return <LoadingScreen />;
  }

  // Usar dados do perfil quando disponíveis para informações detalhadas,
  // mas manter user das permissões para role e lógica de acesso
  const profileInfo = profileData || user;

  const getWelcomeMessage = () => {
    switch (user.role) {
      case "admin":
        return {
          title: "Painel Administrativo",
          description: "Gerencie organizações, campus e usuários do sistema",
          icon: Settings,
        };
      case "presidente":
        return {
          title: "Painel do Presidente",
          description: "Gerencie suas comissões e inventários",
          icon: Users,
        };
      default:
        return {
          title: "Painel do Membro",
          description: "Acesse suas comissões e visualize inventários",
          icon: Database,
        };
    }
  };

  const welcome = getWelcomeMessage();
  const WelcomeIcon = welcome.icon;

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className="bg-[var(--bg-simple)] border border-[var(--border-color)]">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <WelcomeIcon className="h-8 w-8 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <CardTitle className="text-2xl text-blue-900 dark:text-blue-100">
                Bem-vindo, {profileInfo.name}!
              </CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300 text-lg">
                {welcome.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Admin Actions */}
        {permissions.canManageOrganizations && (
          <Card className="border border-[var(--border-color)] hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-6 w-6 text-green-600" />
                <CardTitle className="text-lg">Organizações</CardTitle>
              </div>
              <CardDescription>
                Gerencie organizações e campus do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push("/application/organizations")}
                >
                  Gerenciar Organizações
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push("/application/campus")}
                >
                  Gerenciar Campus
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {permissions.canManageUsers && (
          <Card className="border border-[var(--border-color)] hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-blue-600" />
                <CardTitle className="text-lg">Usuários</CardTitle>
              </div>
              <CardDescription>
                Gerencie usuários e permissões do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push("/application/users")}
              >
                Gerenciar Usuários
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Comissões Actions */}
        {permissions.canManageCommissions && (
          <Card className="border border-[var(--border-color)] hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <Database className="h-6 w-6 text-purple-600" />
                <CardTitle className="text-lg">Comissões</CardTitle>
              </div>
              <CardDescription>
                {user.role === "admin"
                  ? "Gerencie todas as comissões"
                  : "Gerencie suas comissões"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push("/application/commissions")}
              >
                {user.role === "admin"
                  ? "Todas as Comissões"
                  : "Minhas Comissões"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Commission Access for Members */}
        {permissions.canAccessCommission &&
          !permissions.canManageCommissions && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <Database className="h-6 w-6 text-purple-600" />
                  <CardTitle className="text-lg">Minhas Comissões</CardTitle>
                </div>
                <CardDescription>
                  Acesse as comissões das quais você faz parte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push("/application/commissions")}
                >
                  Acessar Comissões
                </Button>
              </CardContent>
            </Card>
          )}
      </div>

      {/* User Info */}
      <Card className="border border-[var(--border-color)]">
        <CardHeader>
          <CardTitle>Informações do Usuário</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Nome
              </label>
              <p className="text-lg">{profileInfo.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Email
              </label>
              <p className="text-lg">{profileInfo.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Cargo
              </label>
              <p className="text-lg capitalize">
                {user.role === "admin"
                  ? "Administrador"
                  : user.role === "presidente"
                  ? "Presidente"
                  : "Membro"}
              </p>
            </div>
            {user.organization && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Organização
                </label>
                <p className="text-lg">{user.organization.name}</p>
              </div>
            )}
          </div>

          {user.commissions && user.commissions.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Comissões
              </label>
              <div className="mt-2 space-y-2">
                {user.commissions.map((commission) => (
                  <div
                    key={commission.id}
                    className="flex justify-between items-center p-2 bg-muted rounded"
                  >
                    <span>{commission.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {commission.roleInCommission}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
