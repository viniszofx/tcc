"use client";

import LoadingScreen from "@/components/custom/loading";
import ErrorDisplay from "@/components/dashboard/error-display";
import FileUploadArea from "@/components/dashboard/file-update-area";
import HardwareAccelerationToggle from "@/components/dashboard/hardware-acceleration-toggle";
import ProcessButton from "@/components/dashboard/process-button";
import ProcessingIndicator from "@/components/dashboard/processing-indicator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFileProcessor } from "@/hooks/use-file-processor";
import { useSettings } from "@/hooks/use-settings";
import { storeProcessedData } from "@/utils/data-storage";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProcessingPage() {
  const isPresident = true;
  const [file, setFile] = useState<File | null>(null);
  const { hardwareAcceleration: globalAcceleration } = useSettings();
  const [hardwareAcceleration, setHardwareAcceleration] =
    useState(globalAcceleration);
  const [storageError, setStorageError] = useState<string | null>(null);
  const params = useParams();
  const comissionId = params.commission_id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [commission, setCommission] = useState<any>(null);
  const router = useRouter();

  const { processFile, isProcessing, error, progress } = useFileProcessor();

  useEffect(() => {
    setHardwareAcceleration(globalAcceleration);
  }, [globalAcceleration]);

  useEffect(() => {
    const fetchCommission = async () => {
      try {
        const response = await fetch(`/api/commission?id=${comissionId}`);
        if (response.ok) {
          const commissionData = await response.json();
          setCommission(commissionData);
        }
      } catch (error) {
        console.error("Erro ao buscar comissão:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommission();
  }, [comissionId]);

  const handleFileChange = (file: File) => {
    setFile(file);
  };

  const handleProcess = async () => {
    if (!file) {
      alert("Por favor, selecione um arquivo primeiro.");
      return;
    }

    setStorageError(null);

    try {
      const results = await processFile(file, hardwareAcceleration);

      if (results && results.length > 0) {
        // 1. Salvar primeiro localmente no IndexedDB
        try {
          const metadata = {
            recordCount: results.length,
            timestamp: new Date().toISOString(),
            fileName: file.name,
            usedAcceleration: hardwareAcceleration,
            syncStatus: "pending", // Marca como pendente de sincronização
          };

          await storeProcessedData(results, metadata);
          console.log("Dados salvos localmente no IndexedDB");

          alert(
            `Sucesso! ${results.length} itens foram processados e salvos localmente. A sincronização com o servidor está sendo feita em segundo plano.`
          );

          // Redirecionar imediatamente para a página de inventários
          router.push(`/admin/comissions/${comissionId}/inventories`);

          // 2. Fazer upload em background
          uploadToServerInBackground(results);
        } catch (localError) {
          console.error("Erro ao salvar localmente:", localError);
          setStorageError(
            "Erro ao salvar os dados localmente. Tente novamente."
          );
        }
      }
    } catch (err) {
      console.error("Erro no processamento:", err);
    }
  };

  // Função para fazer upload em background
  const uploadToServerInBackground = async (results: any[]) => {
    try {
      console.log("Iniciando upload em background...");

      const response = await fetch("/api/inventory/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: results,
          commissionId: comissionId,
          campusId: commission?.campusId || "campus-uuid-1",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(
          `✅ Upload concluído: ${data.itemsCreated} itens sincronizados com o servidor`
        );

        // Atualizar o status de sincronização no IndexedDB
        try {
          const updatedMetadata = {
            recordCount: results.length,
            timestamp: new Date().toISOString(),
            fileName: file?.name || "unknown",
            usedAcceleration: hardwareAcceleration,
            syncStatus: "synced",
            syncedAt: new Date().toISOString(),
          };

          await storeProcessedData(results, updatedMetadata);
          console.log("Status de sincronização atualizado");
        } catch (updateError) {
          console.warn(
            "Erro ao atualizar status de sincronização:",
            updateError
          );
        }
      } else {
        const errorData = await response.json();
        console.error("❌ Erro no upload em background:", errorData.message);

        // Manter os dados locais marcados como pendentes
        console.log(
          "Os dados permanecem salvos localmente para sincronização posterior"
        );
      }
    } catch (uploadError) {
      console.error("❌ Falha no upload em background:", uploadError);
      console.log(
        "Os dados permanecem salvos localmente para sincronização posterior"
      );
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-lg transition-all duration-300 lg:max-w-5xl xl:max-w-6xl">
      <CardHeader className="pb-2 text-center">
        <CardTitle className="text-xl font-bold text-[var(--font-color)] md:text-2xl lg:text-3xl">
          Processamento de Arquivo
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-8">
        {isPresident ? (
          <>
            <FileUploadArea file={file} onFileChange={handleFileChange} />

            <HardwareAccelerationToggle
              enabled={hardwareAcceleration}
              onToggle={setHardwareAcceleration}
              description="Acelera o processamento usando algoritmos otimizados e processamento em lotes"
            />

            <div className="flex justify-end border-t pt-4 lg:pt-6">
              <ProcessButton
                onClick={handleProcess}
                disabled={!file || isProcessing}
                isProcessing={isProcessing}
              />
            </div>

            {isProcessing && (
              <ProcessingIndicator
                progress={progress}
                hardwareAcceleration={hardwareAcceleration}
                fileName={file?.name}
              />
            )}

            {error && (
              <ErrorDisplay
                type="error"
                title="Erro no processamento"
                message={error}
                suggestion="Tente novamente ou entre em contato com o suporte se o problema persistir."
              />
            )}

            {storageError && (
              <ErrorDisplay
                type="warning"
                title="Aviso de armazenamento"
                message={storageError}
                suggestion="Tente processar um arquivo menor ou com menos colunas."
              />
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold text-[var(--font-color)]">
              Olá Mundo!
            </h2>
            <p className="text-muted-foreground mt-2">
              Você não tem permissão para acessar esta página.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
