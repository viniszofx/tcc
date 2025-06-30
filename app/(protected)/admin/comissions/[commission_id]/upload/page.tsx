"use client";

import LoadingScreen from "@/components/custom/loading";
import ErrorDisplay from "@/components/dashboard/error-display";
import FileUploadArea from "@/components/dashboard/file-update-area";
import HardwareAccelerationToggle from "@/components/dashboard/hardware-acceleration-toggle";
import ProcessButton from "@/components/dashboard/process-button";
import ProcessingIndicator from "@/components/dashboard/processing-indicator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFileProcessor } from "@/hooks/use-file-processor";
import { usePermissions } from "@/hooks/use-permissions";
import { useSettings } from "@/hooks/use-settings";
import type { InventoryMetadata } from "@/lib/interface";
import { storeProcessedData } from "@/utils/data-storage";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProcessingPage() {
  const permissions = usePermissions();
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

  // Função para fazer upload do arquivo para o Supabase Storage
  const uploadFileToStorage = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("commissionId", comissionId);

      const response = await fetch("/api/commission/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro no upload do arquivo");
      }

      const data = await response.json();
      console.log("✅ Arquivo enviado para o storage:", data.fileUrl);

      // Atualizar os dados da comissão com a nova URL
      setCommission((prev: any) => ({
        ...prev,
        spreadsheetUrl: data.fileUrl,
      }));

      return data;
    } catch (error) {
      console.error("❌ Erro no upload do arquivo:", error);
      throw error;
    }
  };

  const handleProcess = async () => {
    if (!file) {
      alert("Por favor, selecione um arquivo primeiro.");
      return;
    }

    setStorageError(null);

    try {
      // 1. Primeiro fazer upload do arquivo para o Supabase Storage
      console.log("📤 Fazendo upload do arquivo para o storage...");
      await uploadFileToStorage(file);
      console.log("✅ Arquivo enviado para o storage com sucesso");

      // 2. Processar o arquivo localmente
      console.log("⚙️ Processando dados do arquivo...");
      const results = await processFile(file, hardwareAcceleration);

      if (results && results.length > 0) {
        // 3. Salvar dados processados localmente no IndexedDB
        try {
          const metadata: InventoryMetadata = {
            recordCount: results.length,
            timestamp: new Date().toISOString(),
            fileName: file.name,
            usedAcceleration: hardwareAcceleration,
            syncStatus: "pending" as const, // Marca como pendente de sincronização
            commissionId: comissionId,
            lastSyncUpdate: new Date().toISOString(),
          };

          await storeProcessedData(results, metadata);
          console.log("💾 Dados salvos localmente no IndexedDB");

          alert(
            `🎉 Sucesso! ${results.length} itens foram processados e salvos.\n\n` +
              `📊 Planilha: Armazenada no sistema\n` +
              `💾 Dados: Salvos localmente\n` +
              `🔄 Sincronização: Em andamento...\n\n` +
              `Você será redirecionado para a página de inventários.`
          );

          // Redirecionar imediatamente para a página de inventários
          router.push(`/admin/comissions/${comissionId}/inventories`);

          // 4. Fazer sincronização dos dados em background
          uploadToServerInBackground(results);
        } catch (localError) {
          console.error("❌ Erro ao salvar localmente:", localError);
          setStorageError(
            "Erro ao salvar os dados localmente. Tente novamente."
          );
        }
      } else {
        console.warn("⚠️ Nenhum dado foi processado do arquivo");
        alert(
          "Nenhum dado válido foi encontrado no arquivo. Verifique o formato da planilha."
        );
      }
    } catch (err) {
      console.error("❌ Erro no processamento:", err);
      alert(
        `Erro durante o processamento: ${
          err instanceof Error ? err.message : "Erro desconhecido"
        }`
      );
    }
  };

  // Função para fazer upload em background
  const uploadToServerInBackground = async (results: any[]) => {
    try {
      console.log("🚀 Iniciando sincronização em background...");

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
          `✅ Sincronização concluída: ${data.itemsCreated} itens sincronizados com o servidor`
        );

        // Atualizar o status de sincronização no IndexedDB
        try {
          const updatedMetadata: InventoryMetadata = {
            recordCount: results.length,
            timestamp: new Date().toISOString(),
            fileName: file?.name || "unknown",
            usedAcceleration: hardwareAcceleration,
            syncStatus: "synced" as const,
            lastSyncUpdate: new Date().toISOString(),
            commissionId: comissionId,
          };

          await storeProcessedData(results, updatedMetadata);
          console.log("📦 Status de sincronização atualizado no storage local");

          // Verificar status final da comissão
          const statusResponse = await fetch(
            `/api/commission/sync-status?commissionId=${comissionId}`
          );
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            console.log("📊 Status da comissão:", statusData.status);
          }
        } catch (updateError) {
          console.warn(
            "⚠️ Erro ao atualizar status de sincronização:",
            updateError
          );
        }
      } else {
        const errorData = await response.json();
        console.error(
          "❌ Erro na sincronização em background:",
          errorData.message
        );

        // Manter os dados locais marcados como pendentes
        console.log(
          "💾 Os dados permanecem salvos localmente para sincronização posterior"
        );
      }
    } catch (uploadError) {
      console.error("❌ Falha na sincronização em background:", uploadError);
      console.log(
        "💾 Os dados permanecem salvos localmente para sincronização posterior"
      );
    }
  };

  if (isLoading || permissions.loading) {
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
        {permissions.canUploadSpreadsheets ? (
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
              Acesso Negado
            </h2>
            <p className="text-muted-foreground mt-2">
              Você não tem permissão para fazer upload de planilhas.
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              Somente administradores e presidentes podem acessar esta
              funcionalidade.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
