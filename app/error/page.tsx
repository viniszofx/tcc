'use client';

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function PageError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro detectado:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--card-color)] p-6 text-center">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-8xl" aria-hidden="true">
          😵‍💫
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-[var(--font-color)] sm:text-5xl">
          Algo deu errado
        </h1>

        <p className="text-lg text-[var(--font-color)]">
          Ocorreu um erro inesperado. Tente novamente ou volte para a página inicial.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="default"
            className="gap-2 bg-[var(--button-color)] px-8 py-6 text-[var(--font-color2)] transition-all hover:bg-[var(--hover-3-color)] hover:text-white"
            onClick={() => reset()}
          >
            Tentar novamente
          </Button>

          <Button asChild variant="outline" className="gap-2 px-8 py-6 text-[var(--font-color)]">
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4" />
              Voltar para a página inicial
            </Link>
          </Button>
        </div>

        <p className="text-sm text-[var(--font-color)] mt-8">
          Detalhes do erro: <span className="font-mono">{error.message}</span>
        </p>
      </div>
    </div>
  );
}