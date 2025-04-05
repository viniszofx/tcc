"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Mail, MessageSquare } from "lucide-react"
import { useState } from "react"

export function NotificationSettings() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [notificationFrequency, setNotificationFrequency] = useState("immediate")

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-[var(--font-color)]">Notificações</h3>
        <p className="text-sm text-[var(--font-color)] opacity-70">Gerencie como e quando você recebe notificações.</p>
      </div>
      <Separator className="bg-[var(--header-color)]" />

      <Tabs defaultValue="channels" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-[var(--card-color)]">
          <TabsTrigger
            value="channels"
            className="data-[state=active]:bg-[var(--button-color)] data-[state=active]:text-[var(--font-color2)] cursor-pointer"
          >
            Canais
          </TabsTrigger>
          <TabsTrigger
            value="preferences"
            className="data-[state=active]:bg-[var(--button-color)] data-[state=active]:text-[var(--font-color2)] cursor-pointer"
          >
            Preferências
          </TabsTrigger>
        </TabsList>

        <TabsContent value="channels" className="mt-4 space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[var(--font-color)]" />
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications" className="text-[var(--font-color)]">
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

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-[var(--font-color)]" />
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications" className="text-[var(--font-color)]">
                    Notificações Push
                  </Label>
                  <p className="text-xs text-[var(--font-color)] opacity-70">
                    Receba notificações em tempo real no navegador
                  </p>
                </div>
              </div>
              <Switch
                id="push-notifications"
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
                className="data-[state=checked]:bg-[var(--button-color)]"
              />
            </div>

            <Separator className="bg-[var(--header-color)]" />
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="mt-4 space-y-4">
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-[var(--font-color)]">Frequência de Notificações</h4>
            <RadioGroup value={notificationFrequency} onValueChange={setNotificationFrequency} className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="immediate"
                  id="immediate"
                  className="border-[var(--header-color)] text-[var(--button-color)]"
                />
                <Label htmlFor="immediate" className="text-[var(--font-color)]">
                  Imediata
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="daily"
                  id="daily"
                  className="border-[var(--header-color)] text-[var(--button-color)]"
                />
                <Label htmlFor="daily" className="text-[var(--font-color)]">
                  Resumo Diário
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="weekly"
                  id="weekly"
                  className="border-[var(--header-color)] text-[var(--button-color)]"
                />
                <Label htmlFor="weekly" className="text-[var(--font-color)]">
                  Resumo Semanal
                </Label>
              </div>
            </RadioGroup>

            <Separator className="bg-[var(--header-color)]" />

            <h4 className="text-sm font-medium text-[var(--font-color)]">Tipos de Notificações</h4>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-[var(--font-color)]" />
                  <Label htmlFor="message-notifications" className="text-[var(--font-color)]">
                    Mensagens
                  </Label>
                </div>
                <Switch
                  id="message-notifications"
                  defaultChecked={true}
                  className="data-[state=checked]:bg-[var(--button-color)]"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-[var(--font-color)]" />
                  <Label htmlFor="system-notifications" className="text-[var(--font-color)]">
                    Atualizações do Sistema
                  </Label>
                </div>
                <Switch
                  id="system-notifications"
                  defaultChecked={true}
                  className="data-[state=checked]:bg-[var(--button-color)]"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[var(--font-color)]" />
                  <Label htmlFor="marketing-notifications" className="text-[var(--font-color)]">
                    Marketing e Novidades
                  </Label>
                </div>
                <Switch
                  id="marketing-notifications"
                  defaultChecked={false}
                  className="data-[state=checked]:bg-[var(--button-color)]"
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" className="bg-[var(--button-color)] hover:bg-[var(--hover-2-color)] text-[var(--font-color2)] cursor-pointer">
          Cancelar
        </Button>
        <Button className="bg-[var(--button-color)] hover:bg-[var(--hover-2-color)] text-[var(--font-color2)] cursor-pointer">
          Salvar Alterações
        </Button>
      </div>
    </div>
  )
}