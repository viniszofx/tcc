"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useUserPermissions } from "@/hooks/use-consolidated-user";
import { AlertCircle, Lock } from "lucide-react";
import { useEffect, useState } from "react";

export function SecuritySettings() {
  const { user } = useUserPermissions();
  const [passwordLastChanged] = useState("12/03/2024");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isPasswordReset, setIsPasswordReset] = useState(false);

  useEffect(() => {
    // Verificar se o usuário chegou através de um magic link de reset de senha
    const checkPasswordReset = async () => {
      try {
        const { supabase } = await import("@/lib/supabase");
        const { data: { session } } = await supabase.auth.getSession();
        
        // Se há uma sessão e o usuário veio de um reset de senha
        if (session && session.user?.app_metadata?.provider === 'email') {
          // Verificar se é um reset de senha baseado nos parâmetros da URL ou metadata
          const urlParams = new URLSearchParams(window.location.search);
          const isReset = urlParams.get('type') === 'recovery' || 
                         session.user?.user_metadata?.email_confirmed_at;
          
          setIsPasswordReset(isReset);
        }
      } catch (error) {
        console.error('Erro ao verificar reset de senha:', error);
      }
    };

    checkPasswordReset();
  }, []);

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    // Validações
    if (!newPassword || !confirmPassword) {
      setPasswordError("Nova senha e confirmação são obrigatórias");
      return;
    }

    // Se não é um reset de senha e não foi fornecida a senha atual
    if (!isPasswordReset && !currentPassword.trim()) {
      setPasswordError("Senha atual é obrigatória");
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
        isPasswordReset, // Informar se é um reset de senha
      };

      // Só incluir currentPassword se não for um reset e foi fornecida
      if (!isPasswordReset && currentPassword.trim()) {
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
          {isPasswordReset ? "Redefinir Senha" : "Segurança da Conta"}
        </AlertTitle>
        <AlertDescription className="text-[var(--font-color)] opacity-70">
          {isPasswordReset 
            ? "Defina uma nova senha para sua conta. Você não precisa informar a senha atual."
            : "Recomendamos alterar sua senha regularmente para manter sua conta segura."
          }
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

            {!isPasswordReset && (
              <div>
                <Label
                  htmlFor="current-password"
                  className="text-[var(--font-color)]"
                >
                  Senha Atual
                </Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-[var(--bg-simple)] text-[var(--font-color)] border-[var(--header-color)]"
                  placeholder="Digite sua senha atual"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="new-password"
                  className="text-[var(--font-color)]"
                >
                  {isPasswordReset ? "Nova Senha" : "Nova Senha"}
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-[var(--bg-simple)] text-[var(--font-color)] border-[var(--header-color)]"
                  placeholder={isPasswordReset ? "Digite sua nova senha" : "Digite sua nova senha"}
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
              {isChangingPassword 
                ? (isPasswordReset ? "Definindo..." : "Alterando...") 
                : (isPasswordReset ? "Definir Nova Senha" : "Alterar Senha")
              }
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
