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
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useState } from "react";

export default function OnboardingSetupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setupComplete, setSetupComplete] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    organizationName: "",
    organizationShortName: "",
    campusName: "",
    campusCode: "",
    adminName: "",
    adminEmail: "",
  });

  const handleNext = () => {
    // Validar campos do passo 1
    if (
      !formData.organizationName ||
      !formData.organizationShortName ||
      !formData.campusName ||
      !formData.campusCode
    ) {
      setError("Todos os campos são obrigatórios");
      return;
    }
    setError(null);
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
    setError(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validar campos do passo 2
    if (!formData.adminName || !formData.adminEmail) {
      setError("Todos os campos são obrigatórios");
      return;
    }

    try {
      setError(null);
      setIsPending(true);

      const response = await fetch("/api/onboarding/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organization: {
            name: formData.organizationName,
            shortName: formData.organizationShortName,
          },
          campus: {
            name: formData.campusName,
            code: formData.campusCode,
          },
          admin: {
            name: formData.adminName,
            email: formData.adminEmail,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao configurar sistema");
      }

      const result = await response.json();
      setTempPassword(result.data.tempPassword);
      setSetupComplete(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-color)] p-4">
      <div className="absolute top-2 left-2 md:bottom-4 md:right-4 md:top-auto">
        <DarkModeToggle />
      </div>

      <Image
        className="mx-auto w-72 h-auto md:hidden mb-4"
        src="/logotipo.svg"
        alt="logo"
        width={288}
        height={100}
      />

      <Card className="w-full max-w-2xl bg-[var(--bg-simple)] shadow-lg border-[var(--border-color)] md:p-8">
        <CardHeader className="text-center">
          <Image
            className="w-88 h-auto hidden md:block mb-6 mx-auto"
            src="/logotipo.svg"
            alt="logo"
            width={352}
            height={100}
          />
          <CardTitle className="text-2xl md:text-4xl font-bold text-[var(--font-color)]">
            Configuração Inicial do Sistema
          </CardTitle>
          <CardDescription className="text-[var(--font-color)]/70 mt-2">
            {currentStep === 1
              ? "Passo 1 de 2: Configure os dados da sua instituição"
              : "Passo 2 de 2: Configure o usuário administrador"}
          </CardDescription>

          {/* Indicador de progresso */}
          <div className="flex justify-center mt-4 space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                currentStep === 1 ? "bg-[var(--button-color)]" : "bg-gray-300"
              }`}
            ></div>
            <div
              className={`w-3 h-3 rounded-full ${
                currentStep === 2 ? "bg-[var(--button-color)]" : "bg-gray-300"
              }`}
            ></div>
          </div>
        </CardHeader>

        <CardContent>
          {setupComplete ? (
            // Tela de sucesso
            <div className="space-y-6 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[var(--font-color)]">
                  Sistema configurado com sucesso!
                </h3>
                <p className="text-[var(--font-color)]/70">
                  O administrador foi criado com as seguintes credenciais:
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-[var(--font-color)]">
                    Email:
                  </span>
                  <span className="text-[var(--font-color)]">
                    {formData.adminEmail}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-[var(--font-color)]">
                    Senha temporária:
                  </span>
                  <span className="font-mono text-[var(--font-color)] bg-white dark:bg-gray-700 px-2 py-1 rounded">
                    {tempPassword}
                  </span>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Importante:</strong> Anote essa senha temporária em
                  local seguro. Após o primeiro login, você poderá alterá-la nas
                  configurações do perfil.
                </p>
              </div>

              <Button
                onClick={() => (window.location.href = "/login")}
                className="w-full bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white transition-all"
              >
                Ir para Login
              </Button>
            </div>
          ) : currentStep === 1 ? (
            // Passo 1: Dados Institucionais
            <div className="space-y-6">
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
                      value={formData.organizationName}
                      onChange={(e) =>
                        handleInputChange("organizationName", e.target.value)
                      }
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
                      value={formData.organizationShortName}
                      onChange={(e) =>
                        handleInputChange(
                          "organizationShortName",
                          e.target.value
                        )
                      }
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
                      value={formData.campusName}
                      onChange={(e) =>
                        handleInputChange("campusName", e.target.value)
                      }
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
                      value={formData.campusCode}
                      onChange={(e) =>
                        handleInputChange("campusCode", e.target.value)
                      }
                      placeholder="Ex: UFMS-CG"
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
                type="button"
                onClick={handleNext}
                className="w-full bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white transition-all"
              >
                Próximo
              </Button>
            </div>
          ) : (
            // Passo 2: Dados do Usuário
            <form onSubmit={handleSubmit} className="space-y-6">
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
                      value={formData.adminName}
                      onChange={(e) =>
                        handleInputChange("adminName", e.target.value)
                      }
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
                      value={formData.adminEmail}
                      onChange={(e) =>
                        handleInputChange("adminEmail", e.target.value)
                      }
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

              <div className="flex gap-4">
                <Button
                  type="button"
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1 border-[var(--border-color)] text-[var(--font-color)] hover:bg-[var(--hover-color)]"
                >
                  Voltar
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white transition-all"
                >
                  {isPending ? "Configurando Sistema..." : "Configurar Sistema"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex flex-col items-center">
          <p className="text-sm text-center text-[var(--font-color)]">
            O controle do inventário na palma das suas mãos.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
