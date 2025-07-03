"use client";

import { Button } from "@/components/ui/button";
import { useSmartNavigation } from "@/hooks/use-smart-navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  /** URL personalizada para onde voltar */
  customHref?: string;
  /** Texto personalizado do botão (padrão: "Voltar") */
  text?: string;
  /** Classe CSS adicional */
  className?: string;
  /** Se deve usar navegação inteligente (padrão: true) */
  useSmartNavigation?: boolean;
  /** Se deve forçar router.back() mesmo se não for seguro */
  forceRouterBack?: boolean;
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
  useSmartNavigation: useSmartNav = true,
  forceRouterBack = false,
  variant = "outline",
}: BackButtonProps) {
  const { navigateTo, smartGoBack } = useSmartNavigation();

  const handleClick = () => {
    if (customHref) {
      navigateTo(customHref);
    } else if (forceRouterBack) {
      // Forçar router.back() mesmo se não for seguro (uso em casos específicos)
      if (typeof window !== "undefined") {
        window.history.back();
      }
    } else if (useSmartNav) {
      smartGoBack();
    } else {
      // Fallback para comportamento antigo
      navigateTo();
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
