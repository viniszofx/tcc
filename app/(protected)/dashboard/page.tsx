// Essa página somente sera acessada pelo Operador
"use client";

import LoadingScreen from "@/components/custom/loading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Landmark } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ProcessingPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }
  return (
    <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-lg transition-all duration-300 lg:max-w-5xl xl:max-w-6xl">
      <CardHeader className="pb-2 text-center">
        <CardTitle className="text-xl font-bold text-[var(--font-color)] md:text-2xl lg:text-3xl">
          Dashboard Operador
        </CardTitle>
        <CardDescription className="text-sm text-[var(--font-color)] md:text-base">
          Acesse as comissões para gerenciar o inventário
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col items-center justify-center py-8">
        <div className="grid grid-cols-1 gap-8 md:w-xs w-full">
          <Link
            href="/dashboard/comissions"
            className="flex flex-col w-full items-center justify-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-color)] px-6 py-12 shadow transition hover:shadow-lg hover:bg-[var(--hover-3-color)] group"
          >
            <Landmark
              size={28}
              className="text-[var(--font-color)] group-hover:text-white transition"
            />
            <span className="font-medium text-[var(--font-color)] group-hover:text-white transition">
              Acessar Comissões
            </span>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
