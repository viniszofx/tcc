"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Check, Moon, Sun } from "lucide-react"
import { useState } from "react"

export function AppearanceSettings() {
  const [animationsEnabled, setAnimationsEnabled] = useState(true)
  const [theme, setTheme] = useState("system")

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-[var(--font-color)]">Aparência</h3>
        <p className="text-sm text-[var(--font-color)] opacity-70">
          Personalize a aparência da interface do usuário e preferências visuais.
        </p>
      </div>
      <Separator className="bg-[var(--header-color)]" />

      <div className="grid gap-6">
        <div className="grid gap-3">
          <h4 className="text-sm font-medium text-[var(--font-color)]">Tema</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card
              className="p-4 cursor-pointer border-2 border-transparent hover:border-[var(--button-color)] transition-all"
              onClick={() => setTheme("light")}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-[var(--font-color)]" />
                  <span className="text-sm font-medium text-[var(--font-color)]">Claro</span>
                </div>
                {theme === "light" && <Check className="h-4 w-4 text-[var(--button-color)]" />}
              </div>
              <div className="h-16 rounded-md bg-[#f8f9fa] border border-[#e9ecef]"></div>
            </Card>

            <Card
              className="p-4 cursor-pointer border-2 border-transparent hover:border-[var(--button-color)] transition-all"
              onClick={() => setTheme("dark")}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-[var(--font-color)]" />
                  <span className="text-sm font-medium text-[var(--font-color)]">Escuro</span>
                </div>
                {theme === "dark" && <Check className="h-4 w-4 text-[var(--button-color)]" />}
              </div>
              <div className="h-16 rounded-md bg-[#212529] border border-[#343a40]"></div>
            </Card>

            <Card
              className="p-4 cursor-pointer border-2 border-transparent hover:border-[var(--button-color)] transition-all"
              onClick={() => setTheme("system")}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[var(--font-color)]">Sistema</span>
                </div>
                {theme === "system" && <Check className="h-4 w-4 text-[var(--button-color)]" />}
              </div>
              <div className="h-16 rounded-md bg-gradient-to-r from-[#f8f9fa] to-[#212529] border border-[#e9ecef]"></div>
            </Card>
          </div>
        </div>

        <Separator className="bg-[var(--header-color)]" />

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-[var(--font-color)]">Opções de Interface</h4>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="animations" className="text-[var(--font-color)]">
                Animações
              </Label>
              <p className="text-xs text-[var(--font-color)] opacity-70">Ativa ou desativa animações na interface</p>
            </div>
            <Switch
              id="animations"
              checked={animationsEnabled}
              onCheckedChange={setAnimationsEnabled}
              className="data-[state=checked]:bg-[var(--button-color)]"
            />
          </div>
        </div>
      </div>

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