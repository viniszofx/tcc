"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  /** URL personalizada para onde voltar */
  customHref?: string;
  /** Texto personalizado do botão (padrão: "Voltar") */
  text?: string;
  /** Classe CSS adicional */
  className?: string;
  /** Se deve usar router.back() quando não há customHref */
  useRouterBack?: boolean;
  /** Variante do botão */
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
}

export default function BackButton({
  customHref,
  text = "Voltar",
  className = "",
  useRouterBack = true,
  variant = "outline",
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (customHref) {
      router.push(customHref);
    } else if (useRouterBack) {
      router.back();
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      className={`flex items-center gap-2 ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {text}
    </Button>
  );
}
