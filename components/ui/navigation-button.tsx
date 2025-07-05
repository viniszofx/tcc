"use client";

import { Button } from "@/components/ui/button";
import { useButtonNavigation } from "@/hooks/use-navigation-loading";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";

interface NavigationButtonProps {
  /** URL para navegar */
  href: string;
  /** Conteúdo do botão */
  children: ReactNode;
  /** Chave única para o loading (opcional) */
  loadingKey?: string;
  /** Variante do botão */
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  /** Tamanho do botão */
  size?: "default" | "sm" | "lg" | "icon";
  /** Classes CSS adicionais */
  className?: string;
  /** Se o botão está desabilitado */
  disabled?: boolean;
  /** Callback adicional antes da navegação */
  onClick?: () => void;
  /** Título do botão (tooltip) */
  title?: string;
}

/**
 * Botão que navega para uma URL com spinner automático
 */
export function NavigationButton({
  href,
  children,
  loadingKey,
  variant = "default",
  size = "default",
  className,
  disabled = false,
  onClick,
  title,
}: NavigationButtonProps) {
  const { navigate, isLoading } = useButtonNavigation(href, loadingKey);

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    navigate();
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      disabled={disabled || isLoading}
      onClick={handleClick}
      title={title}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}

/**
 * Versão do NavigationButton como Link (para uso com Next.js Link)
 */
export function NavigationLink({
  href,
  children,
  loadingKey,
  variant = "default",
  size = "default",
  className,
  disabled = false,
  onClick,
  title,
}: NavigationButtonProps) {
  const { navigate, isLoading } = useButtonNavigation(href, loadingKey);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    }
    navigate();
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      disabled={disabled || isLoading}
      onClick={handleClick}
      title={title}
      asChild
    >
      <a href={href}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </a>
    </Button>
  );
}