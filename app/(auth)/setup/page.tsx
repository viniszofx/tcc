"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { processOnboarding } from "../auth/_action";

export default function OnboardingSetupPage() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    try {
      setError(null);
      setIsPending(true);
      await processOnboarding(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-color)] p-4">
      <Card className="w-full max-w-2xl bg-[var(--bg-simple)] shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[var(--font-color)]">
            Configuração Inicial do Sistema
          </CardTitle>
          <CardDescription className="text-[var(--font-color)]/70">
            Configure sua organização, campus e usuário administrador
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados da Organização */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--font-color)]">
                Dados da Organização
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="organizationName"
                    className="text-[var(--font-color)]"
                  >
                    Nome da Organização *
                  </Label>
                  <Input
                    id="organizationName"
                    name="organizationName"
                    required
                    placeholder="Ex: Universidade Federal de..."
                    className="bg-[var(--bg-simple)] border-[var(--border-input)] text-[var(--font-color)]"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="organizationShortName"
                    className="text-[var(--font-color)]"
                  >
                    Nome Abreviado *
                  </Label>
                  <Input
                    id="organizationShortName"
                    name="organizationShortName"
                    required
                    placeholder="Ex: UFMS"
                    className="bg-[var(--bg-simple)] border-[var(--border-input)] text-[var(--font-color)]"
                  />
                </div>
              </div>
            </div>

            {/* Dados do Campus */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--font-color)]">
                Dados do Campus Principal
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="campusName"
                    className="text-[var(--font-color)]"
                  >
                    Nome do Campus *
                  </Label>
                  <Input
                    id="campusName"
                    name="campusName"
                    required
                    placeholder="Ex: Campus Campo Grande"
                    className="bg-[var(--bg-simple)] border-[var(--border-input)] text-[var(--font-color)]"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="campusCode"
                    className="text-[var(--font-color)]"
                  >
                    Código do Campus *
                  </Label>
                  <Input
                    id="campusCode"
                    name="campusCode"
                    required
                    placeholder="Ex: UFMS-CG"
                    className="bg-[var(--bg-simple)] border-[var(--border-input)] text-[var(--font-color)]"
                  />
                </div>
              </div>
            </div>

            {/* Dados do Administrador */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--font-color)]">
                Usuário Administrador
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="adminName"
                    className="text-[var(--font-color)]"
                  >
                    Nome Completo *
                  </Label>
                  <Input
                    id="adminName"
                    name="adminName"
                    required
                    placeholder="Nome completo do administrador"
                    className="bg-[var(--bg-simple)] border-[var(--border-input)] text-[var(--font-color)]"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="adminEmail"
                    className="text-[var(--font-color)]"
                  >
                    Email *
                  </Label>
                  <Input
                    id="adminEmail"
                    name="adminEmail"
                    type="email"
                    required
                    placeholder="email@dominio.com"
                    className="bg-[var(--bg-simple)] border-[var(--border-input)] text-[var(--font-color)]"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white"
            >
              {isPending ? "Configurando Sistema..." : "Configurar Sistema"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
