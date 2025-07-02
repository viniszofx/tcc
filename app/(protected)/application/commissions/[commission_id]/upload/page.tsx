"use client";

import LoadingScreen from "@/components/custom/loading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCommissionPermissions } from "@/hooks/use-commission-permissions";
import { useInventorySync } from "@/hooks/use-inventory-sync";
import { useUserPermissions } from "@/hooks/use-user-permissions";
import type { CommissionWithRelations } from "@/interface";
import { uploadFileToSupabase } from "@/utils/file-upload";
import {
  AlertCircle,
  CheckCircle,
  File,
  FileText,
  Upload,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Funções auxiliares para processamento dos dados
const extractBrandModel = (description: string): string => {
  if (!description) return "";

  // Extrair marca/modelo da descrição usando regex
  const brandModelMatch = description.match(/\[Marca\/Modelo:([^\]]+)\]/);
  if (brandModelMatch) {
    return brandModelMatch[1].trim();
  }

  // Se não encontrar padrão específico, tentar extrair da descrição
  return "";
};

const normalizeConservationState = (state: string): string => {
  if (!state) return "bom";

  const normalized = state.toLowerCase().trim();

  if (normalized.includes("novo") || normalized.includes("bom")) return "bom";
  if (normalized.includes("regular") || normalized.includes("médio"))
    return "regular";
  if (normalized.includes("ruim") || normalized.includes("mal")) return "ruim";
  if (normalized.includes("inservível") || normalized.includes("irreversível"))
    return "inservível";

  return "bom"; // padrão
};

export default function CommissionUploadPage() {
  const { user, loading } = useUserPermissions();
  const router = useRouter();
  const params = useParams();
  const commissionId = params.commission_id as string;

  const {
    canAccessCommission,
    canUploadToCommission,
    loading: permissionsLoading,
  } = useCommissionPermissions(commissionId);

  const {
    localData,
    metadata,
    isLoading: syncLoading,
    isSyncing,
    syncStatus: currentSyncStatus,
  } = useInventorySync(commissionId);

  // Estados originais mantidos
  const [commission, setCommission] = useState<CommissionWithRelations | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [description, setDescription] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (
      !loading &&
      !permissionsLoading &&
      (!canAccessCommission || !canUploadToCommission)
    ) {
      router.push("/application");
    }
  }, [
    loading,
    permissionsLoading,
    canAccessCommission,
    canUploadToCommission,
    router,
  ]);

  useEffect(() => {
    const fetchCommission = async () => {
      try {
        const response = await fetch(`/api/commission/${commissionId}`);
        if (!response.ok) {
          throw new Error("Comissão não encontrada");
        }
        const data = await response.json();
        setCommission(data);
      } catch (error) {
        console.error("Erro ao buscar comissão:", error);
        setError("Erro ao carregar dados da comissão");
      } finally {
        setIsLoading(false);
      }
    };

    if (commissionId && canAccessCommission && canUploadToCommission) {
      fetchCommission();
    }
  }, [commissionId, canAccessCommission, canUploadToCommission]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
    setUploadError(null);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setUploadError("Selecione um arquivo");
      return;
    }

    if (selectedFiles.length > 1) {
      setUploadError("Selecione apenas um arquivo por vez");
      return;
    }

    const file = selectedFiles[0];

    // Validar tipo de arquivo
    if (!file.name.match(/\.(csv|xlsx|xls)$/i)) {
      setUploadError("Apenas arquivos CSV e Excel são permitidos");
      return;
    }

    // Validar tamanho (agora mais flexível, pois o arquivo vai direto para Supabase)
    if (file.size > 50 * 1024 * 1024) {
      // 50MB limite do Supabase
      setUploadError("Arquivo muito grande. O limite é de 50MB.");
      return;
    }

    setIsUploading(true);
    setIsProcessing(false);
    setUploadError(null);

    try {
      // 1. Processar dados da planilha localmente primeiro
      setIsProcessing(true);
      const processedData = await processSpreadsheetData(file, commission);

      if (!processedData || processedData.length === 0) {
        throw new Error("Nenhum dado válido encontrado no arquivo");
      }

      console.log(`📊 Processados ${processedData.length} itens do arquivo`);

      // 2. Salvar dados processados no IndexedDB primeiro (para funcionamento offline)
      const { storeProcessedData } = await import("@/utils/data-storage");
      await storeProcessedData(processedData, {
        fileName: file.name,
        timestamp: new Date().toISOString(),
        recordCount: processedData.length,
        usedAcceleration: false,
        commissionId,
        syncStatus: isOnline ? "pending" : "unknown",
      });

      console.log("💾 Dados salvos localmente (IndexedDB)");

      if (isOnline) {
        try {
          // 3. Tentar fazer backup do arquivo bruto diretamente no Supabase (client-side)
          console.log("📁 Fazendo backup do arquivo original...");
          let fileUrl = null;

          try {
            fileUrl = await uploadFileToSupabase(
              file,
              "inventory-files",
              `commissions/${commissionId}`
            );
            console.log("✅ Arquivo salvo no Supabase:", fileUrl);
          } catch (uploadError) {
            console.warn("⚠️ Falha no upload para Supabase:", uploadError);
            // Continuar sem o backup do arquivo - os dados processados ainda serão salvos
          }

          // 4. Enviar dados processados + URL do arquivo (se disponível) para a API
          const processResponse = await fetch("/api/inventory", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              commissionId,
              items: processedData,
              metadata: {
                fileName: file.name,
                fileSize: file.size,
                fileUrl: fileUrl || null, // Pode ser null se o upload falhou
                description,
                timestamp: new Date().toISOString(),
                recordCount: processedData.length,
                uploadedBy: user?.name || "Sistema",
              },
            }),
          });

          if (!processResponse.ok) {
            const errorData = await processResponse.json();
            throw new Error(errorData.error || "Erro ao salvar dados no banco");
          }

          const processResult = await processResponse.json();
          console.log("✅ Dados salvos no banco:", processResult);

          // 5. Atualizar URL da planilha na comissão (se tiver fileUrl)
          if (fileUrl) {
            const updateCommissionResponse = await fetch(
              `/api/commission/${commissionId}`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  spreadsheetUrl: fileUrl,
                }),
              }
            );

            if (updateCommissionResponse.ok) {
              console.log("📊 URL da planilha atualizada na comissão");
            }
          }

          // 6. Atualizar status no IndexedDB para "synced"
          await storeProcessedData(processedData, {
            fileName: file.name,
            timestamp: new Date().toISOString(),
            recordCount: processedData.length,
            usedAcceleration: false,
            commissionId,
            syncStatus: "synced",
          });
        } catch (syncError) {
          console.warn("⚠️ Erro na sincronização online:", syncError);
          // Se a sincronização falhar, manter dados locais com status "pending"
          await storeProcessedData(processedData, {
            fileName: file.name,
            timestamp: new Date().toISOString(),
            recordCount: processedData.length,
            usedAcceleration: false,
            commissionId,
            syncStatus: "pending",
          });

          // Mostrar que foi salvo localmente mas precisará sincronizar depois
          setUploadError(
            "Dados salvos localmente. Sincronização pendente (verifique sua conexão)."
          );
        }
      } else {
        console.log("📱 Modo offline: dados salvos apenas localmente");
      }

      setUploadSuccess(true);

      // Limpar formulário
      setSelectedFiles([]);
      setDescription("");

      // Redirecionar para a página de inventários após 2 segundos
      setTimeout(() => {
        router.push(`/application/commissions/${commissionId}/inventories`);
      }, 2000);
    } catch (error) {
      console.error("❌ Erro no processamento:", error);
      setUploadError(
        error instanceof Error
          ? error.message
          : "Erro desconhecido no processamento"
      );
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  const processSpreadsheetData = async (
    file: File,
    commission: CommissionWithRelations | null
  ): Promise<any[]> => {
    if (!commission) throw new Error("Dados da comissão não disponíveis");

    return new Promise<any[]>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          let rows: string[][] = [];

          if (file.name.endsWith(".csv")) {
            // Processar CSV
            const text = data as string;
            rows = text
              .split("\n")
              .map((row) =>
                row.split(",").map((cell) => cell.trim().replace(/^"|"$/g, ""))
              );
          } else if (file.name.match(/\.(xlsx|xls)$/i)) {
            // Processar Excel
            try {
              const XLSX = await import("xlsx");
              const workbook = XLSX.read(data, { type: "array" });
              const sheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[sheetName];
              const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
              });
              rows = jsonData as string[][];
            } catch (xlsxError) {
              console.error("Erro ao processar Excel:", xlsxError);
              reject(
                new Error(
                  "Erro ao processar arquivo Excel. Verifique se o arquivo não está corrompido."
                )
              );
              return;
            }
          } else {
            reject(
              new Error(
                "Formato de arquivo não suportado. Use CSV ou Excel (.xlsx, .xls)."
              )
            );
            return;
          }

          // Assumir que a primeira linha é o cabeçalho
          const headers = rows[0];
          const dataRows = rows
            .slice(1)
            .filter((row) => row.some((cell) => cell.trim()));

          const inventoryItems = dataRows.map((row, index) => {
            const item: any = {};

            // Mapear cada coluna pela posição/índice (mais confiável para planilhas estruturadas)
            headers.forEach((header, headerIndex) => {
              const normalizedHeader = header.toLowerCase().trim();
              const value = row[headerIndex]?.trim() || "";

              // Mapeamento baseado na estrutura original da tabela
              switch (normalizedHeader) {
                case "#":
                case "id":
                case "index":
                  item.INDEX = value;
                  break;
                case "numero":
                case "number":
                  item.NUMERO = value;
                  break;
                case "status":
                case "estado":
                  item.STATUS = value || "Ativo";
                  break;
                case "ed":
                case "edificio":
                case "edifício":
                  item.ED = value;
                  break;
                case "descricao":
                case "descrição":
                case "description":
                  item.DESCRICAO = value;
                  break;
                case "rótulos":
                case "rotulos":
                case "tags":
                  item.ROTULOS = value;
                  break;
                case "responsabilidade atual":
                case "responsabilidade_atual":
                case "responsavel":
                case "responsável":
                  item.RESPONSABILIDADE_ATUAL = value;
                  break;
                case "setor do responsável":
                case "setor_do_responsavel":
                case "setor":
                  item.SETOR_DO_RESPONSAVEL = value;
                  break;
                case "campus da lotação do bem":
                case "campus_da_lotacao_do_bem":
                case "campus":
                  item.CAMPUS_DA_LOTACAO_DO_BEM = value;
                  break;
                case "valor aquisição":
                case "valor_aquisicao":
                case "valor":
                  item.VALOR_AQUISICAO = value
                    ? parseFloat(
                        value.replace(/[^\d.,]/g, "").replace(",", ".")
                      )
                    : null;
                  break;
                case "valor depreciado":
                case "valor_depreciado":
                  item.VALOR_DEPRECIADO = value
                    ? parseFloat(
                        value.replace(/[^\d.,]/g, "").replace(",", ".")
                      )
                    : null;
                  break;
                case "numero nota fiscal":
                case "numero_nota_fiscal":
                case "nota_fiscal":
                case "nf":
                  item.NUMERO_NOTA_FISCAL = value;
                  break;
                case "número de série":
                case "numero_de_serie":
                case "serie":
                  item.NUMERO_DE_SERIE = value;
                  break;
                case "data da entrada":
                case "data_da_entrada":
                case "data_entrada":
                  item.DATA_DA_ENTRADA = value;
                  break;
                case "data da responsabilidade":
                case "data_da_responsabilidade":
                case "data_responsabilidade":
                  item.DATA_DA_RESPONSABILIDADE = value;
                  break;
                case "fornecedor":
                  item.FORNECEDOR = value;
                  break;
                case "sala":
                case "localizacao":
                case "localização":
                  item.SALA = value;
                  break;
                case "estado de conservação":
                case "estado_de_conservacao":
                case "conservacao":
                case "conservação":
                  item.ESTADO_DE_CONSERVACAO = value;
                  break;
                case "campus da responsabilidade contábil":
                case "campus_da_responsabilidade_contabil":
                  item.CAMPUS_DA_RESPONSABILIDADE_CONTABIL = value;
                  break;
                case "ug emitente empenho":
                case "ug_emitente_empenho":
                  item.UG_EMITENTE_EMPENHO = value;
                  break;
                case "número de empenho":
                case "numero_de_empenho":
                case "empenho":
                  item.NUMERO_DE_EMPENHO = value;
                  break;
                case "fornecedor empenho":
                case "fornecedor_empenho":
                  item.FORNECEDOR_EMPENHO = value;
                  break;
                case "processo empenho":
                case "processo_empenho":
                  item.PROCESSO_EMPENHO = value;
                  break;
                case "tipo entrada":
                case "tipo_entrada":
                  item.TIPO_ENTRADA = value;
                  break;
                case "cod entrada":
                case "cod_entrada":
                  item.COD_ENTRADA = value;
                  break;
                case "cod empenho":
                case "cod_empenho":
                  item.COD_EMPENHO = value;
                  break;
              }
            });

            // Retornar no formato BemCopia conforme a interface
            return {
              bem_id: `${commissionId}-${item.NUMERO || `ITEM-${index + 1}`}`,
              inventario_id: commissionId,
              grupo_id: commission?.campusId || `grupo-${commissionId}`,
              campus_id: commission?.campusId || "",
              NUMERO: item.NUMERO || `ITEM-${index + 1}`,
              STATUS: (item.STATUS as any) || "ATIVO",
              ED: item.ED || "",
              DESCRICAO: item.DESCRICAO || `Item ${index + 1}`,
              ROTULOS: item.ROTULOS || "",
              RESPONSABILIDADE_ATUAL: item.RESPONSABILIDADE_ATUAL || "",
              SETOR_DO_RESPONSAVEL: item.SETOR_DO_RESPONSAVEL || "",
              CAMPUS_DA_LOTACAO_DO_BEM:
                item.CAMPUS_DA_LOTACAO_DO_BEM || commission?.campus?.name || "",
              SALA: item.SALA || "",
              ESTADO_DE_CONSERVACAO:
                (normalizeConservationState(
                  item.ESTADO_DE_CONSERVACAO
                ) as any) || "BOM",
              DESCRICAO_PRINCIPAL:
                extractBrandModel(item.DESCRICAO) || item.DESCRICAO || "",
              MARCA_MODELO: extractBrandModel(item.DESCRICAO) || "",
              ultimo_atualizado_por: user?.name || "Sistema",
              data_ultima_atualizacao: new Date(),
              observacoes: [
                `Importado de ${file.name}`,
                item.RESPONSABILIDADE_ATUAL
                  ? `Responsável: ${item.RESPONSABILIDADE_ATUAL}`
                  : "",
                item.ROTULOS ? `Tags: ${item.ROTULOS}` : "",
                item.NUMERO_NOTA_FISCAL ? `NF: ${item.NUMERO_NOTA_FISCAL}` : "",
                item.NUMERO_DE_SERIE ? `Série: ${item.NUMERO_DE_SERIE}` : "",
                item.VALOR_AQUISICAO ? `Valor: R$ ${item.VALOR_AQUISICAO}` : "",
              ]
                .filter(Boolean)
                .join(" | "),

              // Metadados extras (preservados para compatibilidade)
              originalData: {
                index: item.INDEX,
                campus_da_lotacao_do_bem: item.CAMPUS_DA_LOTACAO_DO_BEM,
                valor_aquisicao: item.VALOR_AQUISICAO,
                valor_depreciado: item.VALOR_DEPRECIADO,
                numero_nota_fiscal: item.NUMERO_NOTA_FISCAL,
                numero_de_serie: item.NUMERO_DE_SERIE,
                data_da_entrada: item.DATA_DA_ENTRADA,
                data_da_responsabilidade: item.DATA_DA_RESPONSABILIDADE,
                fornecedor: item.FORNECEDOR,
                campus_da_responsabilidade_contabil:
                  item.CAMPUS_DA_RESPONSABILIDADE_CONTABIL,
                ug_emitente_empenho: item.UG_EMITENTE_EMPENHO,
                numero_de_empenho: item.NUMERO_DE_EMPENHO,
                fornecedor_empenho: item.FORNECEDOR_EMPENHO,
                processo_empenho: item.PROCESSO_EMPENHO,
                tipo_entrada: item.TIPO_ENTRADA,
                cod_entrada: item.COD_ENTRADA,
                cod_empenho: item.COD_EMPENHO,
                imported_from: file.name,
                imported_at: new Date().toISOString(),
                commission_id: commissionId,
              },
            };
          });

          resolve(inventoryItems);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(reader.error);

      // Usar método de leitura apropriado baseado no tipo de arquivo
      if (file.name.endsWith(".csv")) {
        reader.readAsText(file);
      } else if (file.name.match(/\.(xlsx|xls)$/i)) {
        reader.readAsArrayBuffer(file);
      } else {
        reject(new Error("Formato de arquivo não suportado"));
      }
    });
  };

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.includes("csv")) return FileText;
    if (type.includes("sheet") || type.includes("excel")) return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading || permissionsLoading || isLoading) {
    return <LoadingScreen />;
  }

  if (!canAccessCommission || !canUploadToCommission) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">
            {!canAccessCommission
              ? "Acesso negado a esta comissão"
              : "Você não tem permissão para fazer upload nesta comissão"}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error || !commission) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">{error || "Comissão não encontrada"}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-[var(--bg-simple)] shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-[var(--font-color)]">
                Upload de Planilhas - {commission.name}
              </CardTitle>
              <CardDescription className="text-[var(--font-color)] opacity-70">
                Faça upload de planilhas CSV ou Excel com dados de inventário
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <div className="flex items-center gap-1 text-green-600">
                  <Wifi className="w-4 h-4" />
                  <span className="text-sm">Online</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600">
                  <WifiOff className="w-4 h-4" />
                  <span className="text-sm">Offline</span>
                </div>
              )}
              {currentSyncStatus === "pending" && (
                <div className="flex items-center gap-1 text-orange-600">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Sync Pendente</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Formulário de Upload */}
      <Card className="bg-[var(--card-color)]">
        <CardHeader>
          <CardTitle className="text-[var(--font-color)]">
            Novo Upload
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seleção de Arquivos */}
          <div className="space-y-2">
            <Label htmlFor="files" className="text-[var(--font-color)]">
              Selecionar Arquivo
            </Label>
            <div className="border-2 border-dashed border-[var(--border-color)] rounded-lg p-8 text-center hover:border-[var(--button-color)] transition-colors">
              <Upload className="w-12 h-12 text-[var(--font-color)] opacity-50 mx-auto mb-4" />
              <Input
                id="files"
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept=".csv,.xlsx,.xls"
              />
              <Label
                htmlFor="files"
                className="cursor-pointer text-[var(--font-color)] hover:text-[var(--button-color)]"
              >
                <span className="font-medium">Clique para selecionar</span> ou
                arraste um arquivo aqui
              </Label>
              <p className="text-sm text-[var(--font-color)] opacity-70 mt-2">
                CSV, Excel (máx. 50MB por arquivo)
              </p>
            </div>
          </div>

          {/* Arquivos Selecionados */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <Label className="text-[var(--font-color)]">
                Arquivos Selecionados
              </Label>
              <div className="space-y-2">
                {selectedFiles.map((file, index) => {
                  const IconComponent = getFileIcon(file);
                  return (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 bg-[var(--bg-simple)] rounded-lg border border-[var(--border-color)]"
                    >
                      <IconComponent className="w-5 h-5 text-[var(--font-color)] opacity-70" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--font-color)] truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-[var(--font-color)] opacity-70">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFiles((files) =>
                            files.filter((_, i) => i !== index)
                          );
                        }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        ×
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-[var(--font-color)]">
              Descrição (opcional)
            </Label>
            <Textarea
              id="description"
              placeholder="Descreva o conteúdo dos arquivos..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-[var(--bg-simple)] border-[var(--border-color)] text-[var(--font-color)]"
              rows={3}
            />
          </div>

          {/* Mensagem de Sucesso */}
          {uploadSuccess && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-green-700">
                  Upload realizado com sucesso!
                </p>
                <p className="text-xs text-green-600">
                  Dados processados e salvos. Redirecionando para inventories...
                </p>
              </div>
            </div>
          )}

          {/* Erro de Upload */}
          {uploadError && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-sm text-red-700">{uploadError}</p>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-4">
            <Button
              onClick={handleUpload}
              disabled={
                selectedFiles.length === 0 || isUploading || isProcessing
              }
              className="bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] disabled:opacity-50"
            >
              {isUploading
                ? "Enviando..."
                : isProcessing
                ? "Processando..."
                : "Fazer Upload"}
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                router.push(`/application/commissions/${commissionId}`)
              }
              className="border-[var(--border-color)] text-[var(--font-color)] hover:bg-[var(--hover-color)]"
            >
              Voltar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Informações Adicionais */}
      <Card className="bg-[var(--card-color)]">
        <CardHeader>
          <CardTitle className="text-[var(--font-color)]">
            Tipos de Arquivo Aceitos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-1">
            <div>
              <h4 className="font-medium text-[var(--font-color)] mb-2">
                Planilhas de Inventário
              </h4>
              <ul className="text-sm text-[var(--font-color)] opacity-70 space-y-1">
                <li>• CSV (.csv) - Recomendado</li>
                <li>• Microsoft Excel (.xls, .xlsx)</li>
              </ul>

              <h4 className="font-medium text-[var(--font-color)] mb-2 mt-4">
                Colunas Esperadas (opcionais)
              </h4>
              <ul className="text-sm text-[var(--font-color)] opacity-70 space-y-1">
                <li>
                  • numero/patrimonio, descricao/item, marca/especificacao
                </li>
                <li>• responsavel, estado/conservacao, quantidade, valor</li>
                <li>• sala/subsecao, ed/edificio, setor/departamento</li>
                <li>• rotulos/tags, campus, data_aquisicao, observacoes</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-700">
                <strong>Upload Direto:</strong> Os arquivos são enviados
                diretamente para o armazenamento em nuvem, contornando
                limitações de upload da hospedagem.
              </p>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                <strong>Funcionalidade Offline:</strong> Os dados são
                processados e salvos localmente para funcionamento offline.
                Quando online, os dados são sincronizados automaticamente.
              </p>
            </div>

            <div className="p-3 bg-[var(--bg-simple)] rounded-lg border border-[var(--border-color)]">
              <p className="text-sm text-[var(--font-color)] opacity-70">
                <strong>Limite:</strong> Máximo 50MB por arquivo. Para arquivos
                maiores, considere dividir em partes menores ou usar CSV para
                melhor performance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
