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

export default function SetupSettingsPage() {
  const [orgs, setOrgs] = useState("");
  const [campus, setCampus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!orgs || !campus) {
      alert("Preencha todos os campos.");
      setIsLoading(false);
      return;
    }

    const data = await fetch("/api/v1/setup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orgs, campus }),
    });

    console.log("Response:", data);
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
            Configurações Iniciais
          </CardTitle>
          <div className="w-full md:w-112">
            <CardDescription className="mt-2 text-[var(--font-color)]">
              Agora vamos configurar o sistema, adicione abaixo a organização e
              o campus que você deseja.
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 flex flex-col items-center">
            <div className="w-full md:w-112 space-y-3">
              <div className="flex flex-col space-y-1">
                <label className="text-md font-medium text-[var(--font-color)]">
                  Nome da organização:
                </label>
                <Input
                  className="border-[var(--border-input)]"
                  placeholder="Ex: IFMS"
                  type="text"
                  value={orgs}
                  onChange={(e) => setOrgs(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-md font-medium text-[var(--font-color)]">
                  Nome do Campus:
                </label>
                <Input
                  className="border-[var(--border-input)]"
                  placeholder="Ex: Campo Grande"
                  type="text"
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
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
