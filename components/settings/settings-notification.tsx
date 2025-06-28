"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Mail } from "lucide-react"
import { useState } from "react"

export function NotificationSettings() {
  const [emailNotifications, setEmailNotifications] = useState(true)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-[var(--font-color)]">Notificações</h3>
        <p className="text-sm text-[var(--font-color)] opacity-70">Gerencie como e quando você recebe notificações.</p>
      </div>
      <Separator className="bg-[var(--header-color)]" />

      <Tabs defaultValue="channels" className="w-full">

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