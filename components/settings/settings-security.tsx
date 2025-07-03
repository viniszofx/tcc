"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useUserPermissions } from "@/hooks/use-user-permissions";
import { AlertCircle, Lock } from "lucide-react";
import { useState } from "react";

export function SecuritySettings() {
  const { user } = useUserPermissions();
  const [passwordLastChanged] = useState("12/03/2024");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    // Validações
    if (!newPassword || !confirmPassword) {
      setPasswordError("Nova senha e confirmação são obrigatórias");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("As senhas não coincidem");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("A nova senha deve ter pelo menos 6 caracteres");
      return;
    }

    setIsChangingPassword(true);

    try {
      const requestBody: any = {
        newPassword,
      };

      // Só incluir currentPassword se foi fornecida
      if (currentPassword.trim()) {
        requestBody.currentPassword = currentPassword;
      }

      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordSuccess("Senha alterada com sucesso!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        // Mostrar feedback global
        const event = new CustomEvent("settings-saved", {
          detail: { message: "Senha alterada com sucesso!" },
        });
        window.dispatchEvent(event);
      } else {
        setPasswordError(data.error || "Erro ao alterar senha");
      }
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      setPasswordError("Erro de conexão. Tente novamente.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-[var(--font-color)]">
          Segurança
        </h3>
        <p className="text-sm text-[var(--font-color)] opacity-70">
          Gerencie suas configurações de segurança e proteção da conta.
        </p>
      </div>
      <Separator className="bg-[var(--header-color)]" />

      <Alert className="bg-[var(--card-color)] border-[var(--button-color)]">
        <AlertCircle className="h-4 w-4 text-[var(--button-color)]" />
        <AlertTitle className="text-[var(--font-color)]">
          Segurança da Conta
        </AlertTitle>
        <AlertDescription className="text-[var(--font-color)] opacity-70">
          Recomendamos alterar sua senha regularmente para manter sua conta
          segura.
        </AlertDescription>
      </Alert>

      {passwordError && (
        <Alert variant="destructive" className="bg-red-50 border-red-300">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800">
            {passwordError}
          </AlertDescription>
        </Alert>
      )}

      {passwordSuccess && (
        <Alert className="bg-green-50 border-green-300">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {passwordSuccess}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        <div className="space-y-4">
          <h4 className="flex items-center gap-2 text-sm font-medium text-[var(--font-color)]">
            <Lock className="h-4 w-4" /> Senha
          </h4>

          <div className="grid gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-end">
                <p className="text-xs text-[var(--font-color)] opacity-70">
                  Última alteração: {passwordLastChanged}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="new-password"
                  className="text-[var(--font-color)]"
                >
                  Nova Senha
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-[var(--bg-simple)] text-[var(--font-color)] border-[var(--header-color)]"
                  placeholder="Digite sua nova senha"
                />
              </div>
              <div>
                <Label
                  htmlFor="confirm-password"
                  className="text-[var(--font-color)]"
                >
                  Confirmar Nova Senha
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-[var(--bg-simple)] text-[var(--font-color)] border-[var(--header-color)]"
                  placeholder="Confirme sua nova senha"
                />
              </div>
            </div>

            <Button
              onClick={handleChangePassword}
              disabled={isChangingPassword}
              className="w-full sm:w-auto bg-[var(--button-color)] hover:bg-[var(--hover-2-color)] text-[var(--font-color2)] cursor-pointer disabled:opacity-50"
            >
              {isChangingPassword ? "Alterando..." : "Alterar Senha"}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-6 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          onClick={() => {
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setPasswordError("");
            setPasswordSuccess("");
          }}
          className="bg-[var(--button-color)] hover:bg-[var(--hover-2-color)] text-[var(--font-color2)] cursor-pointer"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleChangePassword}
          disabled={isChangingPassword}
          className="bg-[var(--button-color)] hover:bg-[var(--hover-2-color)] text-[var(--font-color2)] cursor-pointer disabled:opacity-50"
        >
          {isChangingPassword ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>
    </div>
  );
}
