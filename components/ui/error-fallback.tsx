"use client";

import { AlertCircle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";

interface ErrorFallbackProps {
  error?: Error | null;
  errorType?: 'network' | 'server' | null;
  isOnline?: boolean;
  onRetry?: () => void;
  title?: string;
  description?: string;
}

export function ErrorFallback({
  error,
  errorType,
  isOnline = true,
  onRetry,
  title,
  description,
}: ErrorFallbackProps) {
  const getErrorInfo = () => {
    if (!error && !errorType) {
      return {
        title: title || "Erro desconhecido",
        description: description || "Ocorreu um erro inesperado.",
        icon: AlertCircle,
        color: "text-red-500",
        suggestions: ["Tente recarregar a página"],
      };
    }

    switch (errorType) {
      case 'network':
        return {
          title: "Erro de Conexão",
          description: "Não foi possível conectar ao servidor. Verifique sua conexão com a internet.",
          icon: isOnline ? Wifi : WifiOff,
          color: isOnline ? "text-orange-500" : "text-red-500",
          suggestions: [
            "Verifique sua conexão com a internet",
            "Tente novamente em alguns segundos",
            "Se o problema persistir, contate o suporte",
          ],
        };
      

      
      case 'server':
        return {
          title: "Erro do Servidor",
          description: "Ocorreu um erro interno no servidor. Nossa equipe foi notificada.",
          icon: AlertCircle,
          color: "text-red-500",
          suggestions: [
            "Tente novamente em alguns minutos",
            "Se o problema persistir, contate o suporte",
            "Verifique se você tem as permissões necessárias",
          ],
        };
      
      default:
        return {
          title: title || "Erro",
          description: description || error?.message || "Ocorreu um erro inesperado.",
          icon: AlertCircle,
          color: "text-red-500",
          suggestions: ["Tente recarregar a página"],
        };
    }
  };

  const errorInfo = getErrorInfo();
  const Icon = errorInfo.icon;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Icon className={`w-12 h-12 ${errorInfo.color}`} />
        </div>
        <CardTitle className="text-lg">{errorInfo.title}</CardTitle>
        <CardDescription className="text-sm">
          {errorInfo.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Sugestões */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">O que você pode fazer:</h4>
          <ul className="text-sm space-y-1">
            {errorInfo.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Status de conectividade */}
        <div className="flex items-center gap-2 text-sm">
          {isOnline ? (
            <>
              <Wifi className="w-4 h-4 text-green-500" />
              <span className="text-green-600">Conectado à internet</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-red-500" />
              <span className="text-red-600">Sem conexão com a internet</span>
            </>
          )}
        </div>

        {/* Botão de retry */}
        {onRetry && (
          <Button 
            onClick={onRetry} 
            className="w-full"
            variant="outline"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        )}

        {/* Detalhes técnicos (apenas em desenvolvimento) */}
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-4">
            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
              Detalhes técnicos (desenvolvimento)
            </summary>
            <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-32">
              {error.stack || error.message}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
}

// Componente específico para erros de inventário
export function InventoryErrorFallback({
  error,
  errorType,
  isOnline,
  onRetry,
  commissionName,
}: ErrorFallbackProps & { commissionName?: string }) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">
          {commissionName ? `Inventário - ${commissionName}` : 'Inventário'}
        </h2>
        <p className="text-muted-foreground text-sm">
          Não foi possível carregar os dados do inventário
        </p>
      </div>
      
      <ErrorFallback
        error={error}
        errorType={errorType}
        isOnline={isOnline}
        onRetry={onRetry}
        title="Erro ao Carregar Inventário"
        description="Não foi possível carregar os itens do inventário desta comissão."
      />
    </div>
  );
}