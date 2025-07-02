"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, Copy, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface UserCreatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  tempPassword: string;
  userName: string;
}

export function UserCreatedModal({
  isOpen,
  onClose,
  userEmail,
  tempPassword,
  userName,
}: UserCreatedModalProps) {
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Erro ao copiar senha:", error);
    }
  };

  const handleCopyCredentials = async () => {
    const credentials = `Email: ${userEmail}\nSenha: ${tempPassword}`;
    try {
      await navigator.clipboard.writeText(credentials);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Erro ao copiar credenciais:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-[var(--bg-simple)]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <DialogTitle className="text-[var(--font-color)]">
                Usuário Criado com Sucesso!
              </DialogTitle>
              <DialogDescription className="text-[var(--font-color)] opacity-70">
                O usuário {userName} foi criado no sistema
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 text-yellow-600 mt-0.5">⚠️</div>
              <div className="flex-1">
                <h4 className="font-medium text-yellow-800 mb-1">
                  Importante: Salve essas credenciais
                </h4>
                <p className="text-sm text-yellow-700">
                  Esta é a única vez que a senha temporária será exibida.
                  Certifique-se de salvar essas informações antes de fechar esta
                  janela.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--font-color)]">
                Email de Acesso
              </label>
              <div className="flex items-center gap-2 p-3 bg-[var(--card-color)] border border-[var(--border-color)] rounded-lg">
                <span className="flex-1 font-mono text-[var(--font-color)]">
                  {userEmail}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--font-color)]">
                Senha Temporária
              </label>
              <div className="flex items-center gap-2 p-3 bg-[var(--card-color)] border border-[var(--border-color)] rounded-lg">
                <span className="flex-1 font-mono text-[var(--font-color)]">
                  {showPassword ? tempPassword : "••••••••••••"}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 h-8 w-8"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyPassword}
                  className="p-2 h-8 w-8"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 text-blue-600 mt-0.5">ℹ️</div>
              <div className="flex-1">
                <h4 className="font-medium text-blue-800 mb-1">
                  Próximos Passos
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• O usuário deve fazer login com essas credenciais</li>
                  <li>• É recomendado alterar a senha no primeiro acesso</li>
                  <li>
                    • O usuário pode acessar o sistema através da página de
                    login
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {copied && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="w-4 h-4" />
              Credenciais copiadas para a área de transferência!
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCopyCredentials}
            className="border-[var(--border-input)]"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copiar Credenciais
          </Button>
          <Button
            type="button"
            onClick={onClose}
            className="bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)]"
          >
            Entendi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
