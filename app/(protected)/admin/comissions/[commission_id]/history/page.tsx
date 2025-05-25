"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState } from "react";

const historicoMock = [
  "Mesa superfaturada foi movida para casa do Vinicius",
  "Monitor de Françozo foi removido pelo Joaquim",
];

export default function Page() {
  const [historico] = useState(historicoMock);
  const router = useRouter();

  return (
    <Card className="w-full max-w-6xl min-h-[300px] bg-[var(--bg-simple)] shadow-xl transition-all duration-300 p-8">
      <CardContent className="p-6 flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold mb-2 text-[var(--font-color)]">
            Tabela do histórico
          </h2>
          <p className="text-[var(--font-color)] opacity-70 mb-4">
            Histórico do sistema
          </p>
          <div className="flex flex-col gap-2">
            {historico.length === 0 ? (
              <div className="text-center text-[var(--font-color)] opacity-60 py-8">
                Nenhum evento registrado.
              </div>
            ) : (
              historico.map((evento, index) => (
                <div
                  key={index}
                  className="border text-sm bg-[var(--card-color)] border-[var(--border-color)] rounded-md min-h-[36px] flex items-center px-4 py-2 text-[var(--font-color)]"
                >
                  {evento}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="w-full flex justify-end">
          <Button
            type="button"
            onClick={() => router.back()}
            className="bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white transition-all w-full sm:w-auto cursor-pointer"
          >
            Voltar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
