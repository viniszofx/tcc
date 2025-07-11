"use client";

import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import Back from "../custom/back";
import { Button } from "../ui/button";
import { CardContent, CardFooter } from "../ui/card";
import { Input } from "../ui/input";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signInWithValidation, loading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      return;
    }

    await signInWithValidation(email, password);
  };

  return (
    <div className="w-full flex justify-start md:justify-center">
      <div className="w-full md:max-w-[28rem]">
        <CardContent className="space-y-4 text-center p-0">
          <form onSubmit={handleSubmit} className="w-full space-y-3 text-left">
            <div className="flex flex-col space-y-1">
              <label className="text-md font-medium text-[var(--font-color)]">
                E-mail:
              </label>
              <Input
                className="border-[var(--border-input)]"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                disabled={loading}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-md font-medium text-[var(--font-color)]">
                Senha:
              </label>
              <Input
                className="border-[var(--border-input)]"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                disabled={loading}
              />
            </div>
            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-2 rounded border">
                {error}
              </div>
            )}
            
            <Button
              className="w-full border-[var(--border-color)] bg-[var(--bg-simple)] cursor-pointer hover:!bg-[var(--hover-color)] hover:!text-white transition-all"
              variant={"outline"}
              type="submit"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
            <Back />
            <p className="block w-full text-xs md:text-sm text-end text-[var(--font-color)]">
              <a href="/forget-password" className="hover:underline">
                Esqueci minha senha
              </a>
            </p>
          </form>
        </CardContent>

        <CardFooter className="mt-12 flex flex-col items-center text-center">
          <p className="text-xs md:text-sm text-[var(--font-color)]">
            Não possui uma conta? Entre em contato com o administrador do
            sistema para solicitar acesso
          </p>
        </CardFooter>
      </div>
    </div>
  );
}
