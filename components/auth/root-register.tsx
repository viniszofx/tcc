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
import { supabaseClient } from "@/utils/supabase/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RootRegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !password || !name) {
      alert("Preencha todos os campos.");
      setIsLoading(false);
      return;
    }

    try {
      const supabase = supabaseClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            role: "admin",
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        alert(
          "Usuário criado com sucesso!"
        );
        router.push("/setup-settings");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Erro ao criar usuário. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
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
            Registro Administrativo
          </CardTitle>
          <CardDescription className="mt-2 text-[var(--font-color)]">
            Você é o primeiro usuário do sistema, crie sua conta de
            administrador.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 flex flex-col items-center">
            <div className="w-full md:w-112 space-y-3">
              <div className="flex flex-col space-y-1">
                <label className="text-md font-medium text-[var(--font-color)]">
                  Nome:
                </label>
                <Input
                  className="border-[var(--border-input)]"
                  placeholder="Nome"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-md font-medium text-[var(--font-color)]">
                  E-mail:
                </label>
                <Input
                  className="border-[var(--border-input)]"
                  placeholder="E-mail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-md font-medium text-[var(--font-color)]">
                  Senha:
                </label>
                <Input
                  className="border-[var(--border-input)]"
                  placeholder="Senha"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                className="w-full border-[var(--border-color)] bg-[var(--bg-simple)] cursor-pointer hover:!bg-[var(--hover-color)] hover:!text-white transition-all"
                variant={"outline"}
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Carregando..." : "Continuar"}
              </Button>
            </div>
          </CardContent>

          <CardFooter className="mt-6 flex flex-col items-center">
            <p className="text-sm mt-2 text-center text-[var(--font-color)]">
              O controle do inventário na palma das suas mãos.
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
