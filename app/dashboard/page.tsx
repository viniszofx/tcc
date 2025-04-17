"use client";

import ErrorDisplay from "@/components/dashboard/error-display";
import FileUploadArea from "@/components/dashboard/file-update-area";
import HardwareAccelerationToggle from "@/components/dashboard/hardware-acceleration-toggle";
import ProcessButton from "@/components/dashboard/process-button";
import ProcessingIndicator from "@/components/dashboard/processing-indicator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFileProcessor } from "@/hooks/use-file-processor";
import { storeProcessedData } from "@/utils/data-storage";
import { createClient } from "@/utils/supabase/server";
import { redirect, useRouter } from "next/navigation";
import { useState } from "react";

export default function ProcessingPage() {
  const [file, setFile] = useState<File | null>(null);
  const [hardwareAcceleration, setHardwareAcceleration] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const router = useRouter();

  const { processFile, isProcessing, error, progress } = useFileProcessor();

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
        try {
          const metadata = {
            fileName: file.name,
            timestamp: new Date().toISOString(),
            recordCount: results.length,
            usedAcceleration: hardwareAcceleration,
          };

          await storeProcessedData(results, metadata);

          router.push("/dashboard/inventories");
        } catch (storageError) {
          console.error("Erro ao armazenar resultados:", storageError);
          setStorageError(
            "O conjunto de dados é muito grande para ser armazenado. Tente um arquivo menor ou filtre os dados antes de processar."
          );
        }
      }
    } catch (err) {
      console.error("Erro no processamento:", err);
    }
  };

  return (
    <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-lg transition-all duration-300 lg:max-w-5xl xl:max-w-6xl">
      <CardHeader className="pb-2 text-center">
        <CardTitle className="text-xl font-bold text-[var(--font-color)] md:text-2xl lg:text-3xl">
          Processamento de Arquivo
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-8">
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
      </CardContent>
    </Card>
  );
}
