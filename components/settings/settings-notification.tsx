"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Mail } from "lucide-react";
import { useEffect, useState } from "react";

export function NotificationSettings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [inventoryUpdates, setInventoryUpdates] = useState(true);
  const [commissionUpdates, setCommissionUpdates] = useState(true);
  const [systemUpdates, setSystemUpdates] = useState(false);

  // Carregar configurações salvas
  useEffect(() => {
    const savedEmailNotifications = localStorage.getItem("email-notifications");
    const savedPushNotifications = localStorage.getItem("push-notifications");
    const savedInventoryUpdates = localStorage.getItem("inventory-updates");
    const savedCommissionUpdates = localStorage.getItem("commission-updates");
    const savedSystemUpdates = localStorage.getItem("system-updates");

    if (savedEmailNotifications !== null)
      setEmailNotifications(savedEmailNotifications === "true");
    if (savedPushNotifications !== null)
      setPushNotifications(savedPushNotifications === "true");
    if (savedInventoryUpdates !== null)
      setInventoryUpdates(savedInventoryUpdates === "true");
    if (savedCommissionUpdates !== null)
      setCommissionUpdates(savedCommissionUpdates === "true");
    if (savedSystemUpdates !== null)
      setSystemUpdates(savedSystemUpdates === "true");
  }, []);

  const handleSaveSettings = () => {
    // Salvar no localStorage
    localStorage.setItem("email-notifications", emailNotifications.toString());
    localStorage.setItem("push-notifications", pushNotifications.toString());
    localStorage.setItem("inventory-updates", inventoryUpdates.toString());
    localStorage.setItem("commission-updates", commissionUpdates.toString());
    localStorage.setItem("system-updates", systemUpdates.toString());

    // Mostrar feedback de sucesso
    const event = new CustomEvent("settings-saved", {
      detail: { message: "Configurações de notificação salvas com sucesso!" },
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-[var(--font-color)]">
          Notificações
        </h3>
        <p className="text-sm text-[var(--font-color)] opacity-70">
          Gerencie como e quando você recebe notificações.
        </p>
      </div>
      <Separator className="bg-[var(--header-color)]" />

      <Tabs defaultValue="channels" className="w-full">
        <TabsContent value="channels" className="mt-4 space-y-4">
          <div className="space-y-6">
            <h4 className="text-sm font-medium text-[var(--font-color)]">
              Canais de Notificação
            </h4>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[var(--font-color)]" />
                <div className="space-y-0.5">
                  <Label
                    htmlFor="email-notifications"
                    className="text-[var(--font-color)]"
                  >
                    Notificações por Email
                  </Label>
                  <p className="text-xs text-[var(--font-color)] opacity-70">
                    Receba atualizações importantes por email
                  </p>
                </div>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
                className="data-[state=checked]:bg-[var(--button-color)]"
              />
            </div>

            <Separator className="bg-[var(--header-color)]" />

            <h4 className="text-sm font-medium text-[var(--font-color)]">
              Tipos de Notificação
            </h4>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="inventory-updates"
                    className="text-[var(--font-color)]"
                  >
                    Atualizações de Inventário
                  </Label>
                  <p className="text-xs text-[var(--font-color)] opacity-70">
                    Notificações sobre mudanças nos inventários das suas
                    comissões
                  </p>
                </div>
                <Switch
                  id="inventory-updates"
                  checked={inventoryUpdates}
                  onCheckedChange={setInventoryUpdates}
                  className="data-[state=checked]:bg-[var(--button-color)]"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="commission-updates"
                    className="text-[var(--font-color)]"
                  >
                    Atualizações de Comissão
                  </Label>
                  <p className="text-xs text-[var(--font-color)] opacity-70">
                    Notificações sobre mudanças na estrutura e membros das
                    comissões
                  </p>
                </div>
                <Switch
                  id="commission-updates"
                  checked={commissionUpdates}
                  onCheckedChange={setCommissionUpdates}
                  className="data-[state=checked]:bg-[var(--button-color)]"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="system-updates"
                    className="text-[var(--font-color)]"
                  >
                    Atualizações do Sistema
                  </Label>
                  <p className="text-xs text-[var(--font-color)] opacity-70">
                    Notificações sobre manutenções e novas funcionalidades
                  </p>
                </div>
                <Switch
                  id="system-updates"
                  checked={systemUpdates}
                  onCheckedChange={setSystemUpdates}
                  className="data-[state=checked]:bg-[var(--button-color)]"
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex flex-col gap-2 mt-6 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          onClick={() => {
            setEmailNotifications(true);
            setPushNotifications(false);
            setInventoryUpdates(true);
            setCommissionUpdates(true);
            setSystemUpdates(false);
          }}
          className="bg-[var(--button-color)] hover:bg-[var(--hover-2-color)] text-[var(--font-color2)] cursor-pointer"
        >
          Restaurar Padrões
        </Button>
        <Button
          onClick={handleSaveSettings}
          className="bg-[var(--button-color)] hover:bg-[var(--hover-2-color)] text-[var(--font-color2)] cursor-pointer"
        >
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
}
