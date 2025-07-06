"use client";

import DarkModeToggle from "@/components/custom/dark-mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isValidSession, setIsValidSession] = useState(false);
  const { updatePassword } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Verificar se há parâmetros de erro na URL
    const errorParam = searchParams.get('error');
    const errorCode = searchParams.get('error_code');
    const errorDescription = searchParams.get('error_description');
    
    if (errorParam === 'access_denied' && errorCode === 'otp_expired') {
      setError("Link de redefinição expirado ou inválido. Solicite um novo link de redefinição de senha.");
      return;
    }
    
    if (errorParam) {
      setError("Erro ao processar link de redefinição. Solicite um novo link.");
      return;
    }

    // Verificar se há uma sessão válida de reset de senha
    const checkSession = async () => {
      try {
        const { supabase } = await import("@/lib/supabase");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setIsValidSession(true);
        } else {
          setError("Link de redefinição inválido ou expirado. Solicite um novo link.");
        }
      } catch (err) {
        setError("Erro ao verificar sessão. Tente novamente.");
      }
    };

    checkSession();
  }, [searchParams]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError("");
    setMessage("");
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setError("");
    setMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      setError("Por favor, digite sua nova senha");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const { data, error: updateError } = await updatePassword(password);
      
      if (updateError) {
        setError("Erro ao redefinir senha. Tente novamente.");
      } else {
        setMessage("Senha redefinida com sucesso! Redirecionando para o sistema...");
        setPassword("");
        setConfirmPassword("");
        
        // Redirecionar para as configurações após 2 segundos
        setTimeout(() => {
          router.push("/application/settings?tab=security");
        }, 2000);
      }
    } catch (err) {
      setError("Erro inesperado. Tente novamente mais tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestNewLink = () => {
    router.push("/forget-password");
  };

  if (!isValidSession && !error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <div className="text-center">
          <p className="text-[var(--font-color)] opacity-70">Verificando link de redefinição...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <div className="absolute top-2 left-2 md:bottom-4 md:right-4 md:top-auto">
        <DarkModeToggle />
      </div>
      <img
        className="mx-auto w-72 h-auto md:hidden"
        src="/logotipo.svg"
        alt="logo"
      />
      <Card className="mx-auto max-w-3xl w-full mt-4 max-h-full md:p-8 border-[var(--border-color)] bg-[var(--bg-simple)]">
        <CardHeader className="flex flex-col items-start md:items-center text-left md:text-center">
          <img
            className="w-88 h-auto hidden md:block mb-6"
            src="/logotipo.svg"
            alt="logo"
          />
          <CardTitle className="text-4xl font-bold mb-6 md:mb-2 text-[var(--font-color)]">
            Redefinir Senha
          </CardTitle>
          <CardDescription className="w-full md:w-112 mb-6 md:mb-4 text-[var(--font-color)]">
            Digite sua nova senha para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 flex flex-col items-center">
          {isValidSession ? (
            <form onSubmit={handleSubmit} className="w-full md:w-112 space-y-3">
              <div className="flex flex-col space-y-1">
                <label className="text-md font-medium text-[var(--font-color)]">Nova Senha:</label>
                <Input
                  className="border-[var(--border-input)]"
                  placeholder="Digite sua nova senha"
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  disabled={isLoading}
                  minLength={6}
                />
              </div>
              
              <div className="flex flex-col space-y-1">
                <label className="text-md font-medium text-[var(--font-color)]">Confirmar Senha:</label>
                <Input
                  className="border-[var(--border-input)]"
                  placeholder="Confirme sua nova senha"
                  type="password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  disabled={isLoading}
                  minLength={6}
                />
              </div>
              
              {/* Mensagens de erro e sucesso */}
              {error && (
                <div className="w-full p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}
              
              {message && (
                <div className="w-full p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                  {message}
                </div>
              )}
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full border-[var(--border-color)] bg-[var(--bg-simple)] cursor-pointer hover:!bg-[var(--hover-color)] hover:!text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                variant={"outline"}
              >
                {isLoading ? "Redefinindo..." : "Redefinir Senha"}
              </Button>
            </form>
          ) : (
            <div className="w-full md:w-112 space-y-4 text-center">
              {error && (
                <div className="w-full p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}
              
              <Button
                onClick={handleRequestNewLink}
                className="w-full border-[var(--border-color)] bg-[var(--bg-simple)] cursor-pointer hover:!bg-[var(--hover-color)] hover:!text-white transition-all"
                variant={"outline"}
              >
                Solicitar Novo Link
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center text-center mt-6">
          <p className="w-full md:w-112 text-sm mt-2 text-[var(--font-color)]">
            Lembrou da sua senha?{" "}
            <a href="/login" className="underline text-[var(--font-color)]">
              Fazer login
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

function ResetPasswordLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <div className="text-center">
        <p className="text-[var(--font-color)] opacity-70">Carregando...</p>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordForm />
    </Suspense>
  );
}