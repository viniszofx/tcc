"use client";

import { PageTitle } from "@/components/custom/page-title";
import { AdvancedSettings } from "@/components/settings/settings-advanced";
import { AppearanceSettings } from "@/components/settings/settings-apaerence";
import { NotificationSettings } from "@/components/settings/settings-notification";
import { SecuritySettings } from "@/components/settings/settings-security";
import { SettingsToast } from "@/components/settings/settings-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserPermissions } from "@/hooks/use-consolidated-user";
import {
  Bell,
  Lock,
  Monitor,
  Palette,
  Settings as SettingsIcon,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { user, loading } = useUserPermissions();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("appearance");
  const [showPasswordResetMessage, setShowPasswordResetMessage] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    // Verificar se o usuário chegou através de um magic link de reset de senha
    const checkPasswordReset = async () => {
      try {
        const { supabase } = await import("@/lib/supabase");
        const { data: { session } } = await supabase.auth.getSession();
        
        // Se há uma sessão e o usuário veio de um reset de senha
        if (session && session.user?.app_metadata?.provider === 'email') {
          // Verificar se é um reset de senha baseado nos parâmetros da URL ou metadata
          const urlParams = new URLSearchParams(window.location.search);
          const isPasswordReset = urlParams.get('type') === 'recovery' || 
                                 session.user?.user_metadata?.email_confirmed_at;
          
          if (isPasswordReset) {
            setActiveTab("security");
            setShowPasswordResetMessage(true);
            
            // Limpar a URL dos parâmetros de reset
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar reset de senha:', error);
      }
    };

    if (user) {
      checkPasswordReset();
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--button-color)]"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <PageTitle title="Configurações - KDÊ" />
      <div className="w-full max-w-full px-2 sm:px-0 py-4 sm:py-6 mx-auto">
        <SettingsToast />
        <Card className="bg-[var(--bg-simple)] shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--button-color)]/10">
                <SettingsIcon className="h-6 w-6 text-[var(--button-color)]" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-[var(--font-color)]">
                  Configurações
                </CardTitle>
                <CardDescription className="text-[var(--font-color)] opacity-70">
                  Gerencie suas preferências e configurações do sistema
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="flex flex-wrap w-full gap-2 bg-[var(--card-color)] lg:grid lg:grid-cols-4 lg:gap-0">
                <TabsTrigger
                  value="appearance"
                  className="flex items-center gap-2 data-[state=active]:bg-[var(--button-color)] data-[state=active]:text-[var(--font-color2)] text-xs sm:text-base"
                >
                  <Palette className="h-4 w-4" />
                  <span className="hidden sm:inline">Aparência</span>
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="flex items-center gap-2 data-[state=active]:bg-[var(--button-color)] data-[state=active]:text-[var(--font-color2)] text-xs sm:text-base"
                >
                  <Bell className="h-4 w-4" />
                  <span className="hidden sm:inline">Notificações</span>
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="flex items-center gap-2 data-[state=active]:bg-[var(--button-color)] data-[state=active]:text-[var(--font-color2)] text-xs sm:text-base"
                >
                  <Lock className="h-4 w-4" />
                  <span className="hidden sm:inline">Segurança</span>
                </TabsTrigger>
                <TabsTrigger
                  value="advanced"
                  className="flex items-center gap-2 data-[state=active]:bg-[var(--button-color)] data-[state=active]:text-[var(--font-color2)] text-xs sm:text-base"
                >
                  <Monitor className="h-4 w-4" />
                  <span className="hidden sm:inline">Avançado</span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-4 sm:mt-6">
                <TabsContent value="appearance" className="space-y-4 sm:space-y-6">
                  <Card className="bg-[var(--card-color)]">
                    <CardContent className="p-4 sm:p-6">
                      <AppearanceSettings />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4 sm:space-y-6">
                  <Card className="bg-[var(--card-color)]">
                    <CardContent className="p-4 sm:p-6">
                      <NotificationSettings />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-4 sm:space-y-6">
                  {showPasswordResetMessage && (
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Lock className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-blue-800">
                              Link de redefinição de senha acessado
                            </p>
                            <p className="text-sm text-blue-600">
                              Você pode agora definir uma nova senha para sua conta.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  <Card className="bg-[var(--card-color)]">
                    <CardContent className="p-4 sm:p-6">
                      <SecuritySettings />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4 sm:space-y-6">
                  <Card className="bg-[var(--card-color)]">
                    <CardContent className="p-4 sm:p-6">
                      <AdvancedSettings />
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
