"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { AlertTriangle, Monitor } from "lucide-react"
import { useState } from "react"

export function AdvancedSettings() {
  const [debugMode, setDebugMode] = useState(false)
  const [hardwareAcceleration, setHardwareAcceleration] = useState(true)
  const [language] = useState("pt-BR")

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-[var(--font-color)]">Configurações Avançadas</h3>
        <p className="text-sm text-[var(--font-color)] opacity-70">
          Gerencie configurações avançadas do sistema e dados da conta.
        </p>
      </div>
      <Separator className="bg-[var(--header-color)]" />

      <Alert variant="destructive" className="bg-red-50 border-red-300 text-red-800">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Atenção</AlertTitle>
        <AlertDescription>
          Estas configurações são destinadas a usuários avançados. Alterações incorretas podem afetar o funcionamento do
          sistema.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        <div className="space-y-4">
          <h4 className="flex items-center gap-2 text-sm font-medium text-[var(--font-color)]">
            <Monitor className="h-4 w-4" /> Desempenho
          </h4>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="hardware-acceleration" className="text-[var(--font-color)]">
                Sempre habilitar aceleração de hardware
              </Label>
              <p className="text-xs text-[var(--font-color)] opacity-70">
                Utiliza recursos de GPU para melhorar o desempenho da aplicação
              </p>
            </div>
            <Switch
              id="hardware-acceleration"
              checked={hardwareAcceleration}
              onCheckedChange={setHardwareAcceleration}
              className="data-[state=checked]:bg-[var(--button-color)]"
            />
          </div>
        </div>

        <Separator className="bg-[var(--header-color)]" />

        <div className="space-y-4">
          <h4 className="flex items-center gap-2 text-sm font-medium text-[var(--font-color)]">Idioma e Região</h4>

          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="language" className="text-[var(--font-color)]">
                Idioma do Sistema
              </Label>
              <Select value={language} disabled>
                <SelectTrigger className="w-40 bg-[var(--bg-simple)] text-[var(--font-color)] border-[var(--header-color)]">
                  <SelectValue placeholder="Português (Brasil)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-[var(--font-color)] opacity-70">Outros idiomas estarão disponíveis em breve.</p>
          </div>
        </div>

        <Separator className="bg-[var(--header-color)]" />

        <div className="space-y-4">
          <h4 className="flex items-center gap-2 text-sm font-medium text-[var(--font-color)]">
            Desenvolvimento e Depuração
          </h4>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="debug-mode" className="text-[var(--font-color)]">
                Modo de Depuração
              </Label>
              <p className="text-xs text-[var(--font-color)] opacity-70">
                Ativa logs detalhados e ferramentas de desenvolvimento
              </p>
            </div>
            <Switch
              id="debug-mode"
              checked={debugMode}
              onCheckedChange={setDebugMode}
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