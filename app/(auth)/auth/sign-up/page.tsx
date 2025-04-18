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
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL || "",
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
// );

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !password) {
      alert("Preencha todos os campos.");
      setIsLoading(false);
      return;
    }

    const data = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <div className="absolute top-2 left-2 md:bottom-4 md:right-4 md:top-auto">
        <DarkModeToggle />
      </div>
      <Image
        className="mx-auto w-72 h-auto md:hidden"
        src="/logotipo.svg"
        alt="logo"
        width={288}
        height={100}
      />
      <Card className="mx-auto max-w-3xl w-full mt-4 max-h-full md:p-8 border-[var(--border-color)] bg-[var(--bg-simple)]">
        <CardHeader className="w-full flex flex-col items-start md:items-center text-left md:text-center">
          <Image
            className="w-88 h-auto hidden md:block mb-6"
            src="/logotipo.svg"
            alt="logo"
            width={352}
            height={100}
          />
          <CardTitle className="text-4xl font-bold text-[var(--font-color)]">
            Criar Conta
          </CardTitle>
          <CardDescription className="mt-2 text-[var(--font-color)]">
            Cadastre-se para acessar o sistema de inventário
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 flex flex-col items-center">
            <div className="w-full md:w-112 space-y-3">
              <Input
                className="border-[var(--border-input)]"
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                className="border-[var(--border-input)]"
                placeholder="Senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                className="w-full border-[var(--border-color)] bg-[var(--bg-simple)] cursor-pointer hover:!bg-[var(--hover-color)] hover:!text-white transition-all"
                variant={"outline"}
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Criando conta..." : "Criar conta"}
              </Button>
              <a
                className="block w-full text-sm text-end text-[var(--font-color)] hover:underline"
                href="/auth/login"
              >
                Já tem conta? Entrar
              </a>
            </div>
          </CardContent>

          <div className="relative text-center text-sm after:absolute after:left-8 after:right-8 md:after:left-0 md:after:right-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-[var(--border-color)] w-full md:w-112 mx-auto mt-6">
            <span className="relative z-10 bg-[var(--bg-simple)] px-2 text-[var(--font-color)]">
              ou
            </span>
          </div>

          <CardFooter className="mt-6 flex flex-col items-center">
            <p className="text-sm mt-2 text-center text-[var(--font-color)]">
              Entre em contato com o campus para acesso ao sistema
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
