"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Lock } from "lucide-react"
import { useState } from "react"

export function SecuritySettings() {
  const [passwordLastChanged] = useState("12/03/2024")

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-[var(--font-color)]">Segurança</h3>
        <p className="text-sm text-[var(--font-color)] opacity-70">
          Gerencie suas configurações de segurança e proteção da conta.
        </p>
      </div>
      <Separator className="bg-[var(--header-color)]" />

      <Alert className="bg-[var(--card-color)] border-[var(--button-color)]">
        <AlertCircle className="h-4 w-4 text-[var(--button-color)]" />
        <AlertTitle className="text-[var(--font-color)]">Segurança da Conta</AlertTitle>
        <AlertDescription className="text-[var(--font-color)] opacity-70">
          Recomendamos alterar sua senha regularmente para manter sua conta segura.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        <div className="space-y-4">
          <h4 className="flex items-center gap-2 text-sm font-medium text-[var(--font-color)]">
            <Lock className="h-4 w-4" /> Senha
          </h4>

          <div className="grid gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="current-password" className="text-[var(--font-color)]">
                  Senha Atual
                </Label>
                <Input
                  id="current-password"
                  type="password"
                  className="bg-[var(--bg-simple)] text-[var(--font-color)] border-[var(--header-color)]"
                />
              </div>
              <div className="flex items-end">
                <p className="text-xs text-[var(--font-color)] opacity-70">Última alteração: {passwordLastChanged}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-password" className="text-[var(--font-color)]">
                  Nova Senha
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  className="bg-[var(--bg-simple)] text-[var(--font-color)] border-[var(--header-color)]"
                />
              </div>
              <div>
                <Label htmlFor="confirm-password" className="text-[var(--font-color)]">
                  Confirmar Nova Senha
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  className="bg-[var(--bg-simple)] text-[var(--font-color)] border-[var(--header-color)]"
                />
              </div>
            </div>

            <Button className="w-full sm:w-auto bg-[var(--button-color)] hover:bg-[var(--hover-2-color)] text-[var(--font-color2)] cursor-pointer">
              Alterar Senha
            </Button>
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