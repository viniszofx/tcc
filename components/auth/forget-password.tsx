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
import { useState } from "react";
import Back from "../custom/back";

export default function RecoverPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { resetPassword } = useAuth();

  const handleEmailChange = (e: any) => {
    setEmail(e.target.value);
    setError("");
    setMessage("");
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    if (!email) {
      setError("Por favor, digite seu e-mail");
      return;
    }

    if (!email.includes("@")) {
      setError("Por favor, digite um e-mail válido");
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      // 1. Primeiro, verificar se o usuário está na lista de permitidos
      const validateResponse = await fetch("/api/auth/validate-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!validateResponse.ok) {
        const errorData = await validateResponse.json();
        if (validateResponse.status === 403) {
          setError("Este e-mail não está autorizado no sistema. Entre em contato com o administrador.");
        } else {
          setError("Erro ao validar e-mail. Tente novamente.");
        }
        return;
      }

      // 2. Se o usuário está permitido, enviar o magic link
      const { data, error: resetError } = await resetPassword(email);
      
      if (resetError) {
        setError("Erro ao enviar e-mail de recuperação. Tente novamente.");
      } else {
        setMessage("E-mail de recuperação enviado! Verifique sua caixa de entrada e acesse o link para redefinir sua senha.");
        setEmail("");
      }
    } catch (err) {
      setError("Erro inesperado. Tente novamente mais tarde.");
    } finally {
      setIsLoading(false);
    }
  };

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
            Esqueceu a senha?
          </CardTitle>
          <CardDescription className="w-full md:w-112 mb-6 md:mb-4 text-[var(--font-color)]">
            Digite seu endereço de e-mail e enviaremos um link para redefinir a
            senha
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 flex flex-col items-center">
          <form onSubmit={handleSubmit} className="w-full md:w-112 space-y-3">
            <div className="flex flex-col space-y-1">
              <label className="text-md font-medium text-[var(--font-color)]">E-mail:</label>
            <Input
              className="border-[var(--border-input)]"
              placeholder="Email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              disabled={isLoading}
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
              {isLoading ? "Enviando..." : "Enviar link de redefinição"}
            </Button>
            <Back />
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-center mt-6">
          <p className="w-full md:w-112 text-sm mt-2 text-[var(--font-color)]">
            Você não recebeu o link no seu e-mail? Cheque seu spam ou tente{" "}
            <a href="/login" className="underline text-[var(--font-color)]">
              outro e-mail.
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
