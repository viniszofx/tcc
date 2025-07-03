"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Suprimir warnings de lifecycle methods deprecated
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0]?.includes?.("UNSAFE_componentWillReceiveProps")) {
    return;
  }
  originalWarn(...args);
};

// Importação dinâmica do SwaggerUI para evitar problemas de SSR
const SwaggerUI = dynamic(() => import("swagger-ui-react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando Swagger UI...</p>
      </div>
    </div>
  ),
});

import "swagger-ui-react/swagger-ui.css";

export default function ApiDocs() {
  const [spec, setSpec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/docs/swagger.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Falha ao carregar a especificação da API");
        }
        return response.json();
      })
      .then((data) => {
        setSpec(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao carregar spec:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando documentação da API...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Erro ao Carregar
          </h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header personalizado */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 shadow-lg">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-2">
            📚 API Documentation - Sistema de Inventário
          </h1>
          <p className="text-blue-100 text-lg">
            Documentação completa das APIs para gerenciamento de inventário
            multi-organizacional
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
              IFMS
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
              UFMS
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
              IFSP
            </span>
          </div>
        </div>
      </div>

      {/* Informações úteis */}
      <div className="bg-gray-50 border-b p-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center">
              <span className="text-green-600 mr-2">🟢</span>
              <span>
                <strong>Base URL:</strong> http://localhost:3000
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-blue-600 mr-2">📊</span>
              <span>
                <strong>Endpoints:</strong> 10 recursos disponíveis
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-purple-600 mr-2">🏢</span>
              <span>
                <strong>Organizações:</strong> IFMS, UFMS, IFSP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Aviso sobre warnings do React */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="container mx-auto">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Nota:</strong> Alguns warnings do React podem aparecer
                no console devido aos componentes internos do Swagger UI. Isso é
                normal e não afeta a funcionalidade da documentação.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SwaggerUI */}
      <div className="container mx-auto p-0">
        {spec && (
          <SwaggerUI
            spec={spec}
            docExpansion="list"
            defaultModelsExpandDepth={1}
            defaultModelExpandDepth={2}
            tryItOutEnabled={true}
            filter={true}
            displayRequestDuration={true}
            supportedSubmitMethods={["get", "post", "put", "delete", "patch"]}
            persistAuthorization={true}
            presets={
              [
                // Use built-in presets for better performance
              ]
            }
            plugins={
              [
                // Minimal plugins for faster loading
              ]
            }
            layout="BaseLayout"
            deepLinking={true}
            requestInterceptor={(request) => {
              // Add auth headers if available
              const token = localStorage.getItem("supabase.auth.token");
              if (token) {
                request.headers.Authorization = `Bearer ${token}`;
              }
              return request;
            }}
            responseInterceptor={(response) => {
              // Log responses in development
              if (process.env.NODE_ENV === "development") {
                console.log("API Response:", response);
              }
              return response;
            }}
            onComplete={(system) => {
              // SwaggerUI loaded successfully
              console.log("SwaggerUI loaded successfully");
            }}
          />
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-800 text-white p-6 mt-8">
        <div className="container mx-auto text-center">
          <p className="text-gray-300">
            Sistema de Inventário Multi-Organizacional - Desenvolvido para IFMS,
            UFMS e IFSP
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Documentação gerada automaticamente via Swagger/OpenAPI 3.0
          </p>
        </div>
      </div>
    </div>
  );
}
