"use client"

import { AdvancedSettings } from "@/components/settings/settings-advanced"
import { AppearanceSettings } from "@/components/settings/settings-apaerence"
import { NotificationSettings } from "@/components/settings/settings-notification"
import { SecuritySettings } from "@/components/settings/settings-security"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("appearance")

  return (
    <div className="flex-1 w-full p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 flex items-center justify-center">
      <Card className="bg-[var(--bg-simple)] w-full max-w-[98%] xs:max-w-[95%] sm:max-w-[90%] md:max-w-[85%] lg:max-w-[calc(100%-var(--sidebar-width)-2rem)] mx-auto p-4 sm:p-6 lg:p-8 shadow-md rounded-lg flex flex-col min-h-[85vh] xs:min-h-[80vh] sm:min-h-[75vh] md:min-h-[70vh]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="px-1 pb-2">
            <TabsList className="w-full grid grid-cols-4 bg-[var(--card-color)] p-1">
              <TabsTrigger
                value="appearance"
                className="data-[state=active]:bg-[var(--button-color)] data-[state=active]:text-[var(--font-color2)] cursor-pointer text-[10px] xs:text-xs sm:text-sm py-1.5 px-0.5 xs:px-2"
              >
                Aparência
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="data-[state=active]:bg-[var(--button-color)] data-[state=active]:text-[var(--font-color2)] cursor-pointer text-[10px] xs:text-xs sm:text-sm py-1.5 px-0.5 xs:px-2"
              >
                Segurança
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="data-[state=active]:bg-[var(--button-color)] data-[state=active]:text-[var(--font-color2)] cursor-pointer text-[10px] xs:text-xs sm:text-sm py-1.5 px-0.5 xs:px-2"
              >
                Notificações
              </TabsTrigger>
              <TabsTrigger
                value="advanced"
                className="data-[state=active]:bg-[var(--button-color)] data-[state=active]:text-[var(--font-color2)] cursor-pointer text-[10px] xs:text-xs sm:text-sm py-1.5 px-0.5 xs:px-2"
              >
                Avançado
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 mt-2">
            <TabsContent value="appearance" className="h-full">
              <AppearanceSettings />
            </TabsContent>
            <TabsContent value="security" className="h-full">
              <SecuritySettings />
            </TabsContent>
            <TabsContent value="notifications" className="h-full">
              <NotificationSettings />
            </TabsContent>
            <TabsContent value="advanced" className="h-full">
              <AdvancedSettings />
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  )
}