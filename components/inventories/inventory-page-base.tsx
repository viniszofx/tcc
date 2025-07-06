"use client";

import EmptyInventory from "@/components/dashboard/empty-inventory";
// import InventoryActions from "@/components/inventories/inventory-actions"; // Carregamento dinâmico
import InventoryCard from "@/components/inventories/inventory-card";
import InventoryFilters from "@/components/inventories/inventory-filters";
import InventoryMetadata from "@/components/inventories/inventory-metadata";
import InventoryPagination from "@/components/inventories/inventory-pagination";
import NewItemModal from "@/components/inventories/new-item-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useInventorySync } from "@/hooks/use-inventory-sync";
import { useSmartNavigation } from "@/hooks/use-smart-navigation";
import { useUserPermissions } from "@/hooks/use-user-permissions";
import type { BemCopia } from '@/types/legacy';
import { exportToPdfStyled } from "@/utils/pdf-export";
import { Filter, RefreshCw } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState, lazy, Suspense } from "react";
import { toast } from "sonner";

// Carregamento dinâmico do InventoryActions para evitar carregamento desnecessário do CameraModal
const InventoryActions = lazy(() => import("@/components/inventories/inventory-actions"));

interface InventoryPageBaseProps {
  backRoute: string;
  errorRoute: string;
  commissionId?: string;
}

export default function InventoryPageBase({
  backRoute,
  errorRoute,
  commissionId: propCommissionId,
}: InventoryPageBaseProps) {
  const router = useRouter();
  const { navigateTo } = useSmartNavigation();
  const { user } = useUserPermissions();
  const params = useParams();
  const commissionId = propCommissionId || (params?.commission_id as string);

  // Usar o hook de sincronização
  const {
    localData: inventoryData,
    metadata,
    isLoading,
    isSyncing,
    lastSync,
    syncStatus,
    forceSync,
    loadAndSync,
    addItemWithAutoSync,
  } = useInventorySync(commissionId);

  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string>
  >({});
  const [displayFields, setDisplayFields] = useState<string[]>([
    "NUMERO",
    "MARCA_MODELO",
    "RESPONSABILIDADE_ATUAL",
    "ESTADO_DE_CONSERVACAO",
  ]);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  // Remover o useEffect antigo, agora o hook cuida do carregamento

  const uniqueValues = useMemo(() => {
    const maxItemsToCheck =
      inventoryData.length > 10000 ? 5000 : inventoryData.length;
    const sampleData = inventoryData.slice(0, maxItemsToCheck);

    const values: Record<string, string[]> = {};

    const fields = [
      "SALA",
      "CAMPUS_DA_LOTACAO_DO_BEM",
      "SETOR_DO_RESPONSAVEL",
      "ESTADO_DE_CONSERVACAO",
    ];

    fields.forEach((field) => {
      const uniqueSet = new Set<string>();
      sampleData.forEach((item) => {
        const value = (item as any)[field];
        if (value) {
          uniqueSet.add(value);
        }
      });
      values[field] = Array.from(uniqueSet).sort();
    });

    return values;
  }, [inventoryData]);

  // Add helper function to remove leading zeros
  const removeLeadingZeros = (str: string) => str.replace(/^0+/, "") || "0";

  const filteredItems = useMemo(() => {
    const hasFilters = Object.keys(selectedFilters).length > 0;
    const hasSearch = searchTerm.trim().length > 0;

    if (!hasFilters && !hasSearch) {
      return inventoryData;
    }

    const searchTermLower = removeLeadingZeros(searchTerm.toLowerCase());

    const result = inventoryData.filter((item) => {
      // Check filters first
      if (hasFilters) {
        const matchesFilters = Object.entries(selectedFilters).every(
          ([field, value]) => (item as any)[field] === value
        );
        if (!matchesFilters) return false;
      }

      // Then check search term
      if (hasSearch) {
        return Object.entries(item).some(([key, value]) => {
          if (!value) return false;
          const valueStr = String(value).toLowerCase();
          // Remove leading zeros from numeric values before comparison
          const normalizedValue = /^\d+$/.test(valueStr)
            ? removeLeadingZeros(valueStr)
            : valueStr;
          return normalizedValue.includes(searchTermLower);
        });
      }

      return true;
    });

    console.log("✅ Itens filtrados:", result.length);
    return result;
  }, [inventoryData, searchTerm, selectedFilters]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const currentItems = useMemo(() => {
    if (showAll) {
      const maxItemsToShow = 500;
      if (filteredItems.length > maxItemsToShow) {
        return filteredItems.slice(0, maxItemsToShow);
      }
      return filteredItems;
    }

    return filteredItems.slice(
      currentPage * itemsPerPage,
      (currentPage + 1) * itemsPerPage
    );
  }, [filteredItems, currentPage, itemsPerPage, showAll]);

  const handleFilterChange = (field: string, value: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
    setCurrentPage(0);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(0);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleShowAll = () => {
    if (!showAll && filteredItems.length > 500) {
      if (
        !window.confirm(
          `Mostrar todos os ${filteredItems.length.toLocaleString()} itens pode deixar a página lenta. Deseja continuar?`
        )
      ) {
        return;
      }
    }

    setShowAll((prev) => !prev);
    setCurrentPage(0);
  };

  const handleSaveNewItem = async (item: BemCopia) => {
    try {
      console.log("Iniciando criação de item...");

      // Primeiro, buscar dados da comissão para obter o campusId
      const commissionResponse = await fetch(
        `/api/commission?id=${commissionId}`
      );
      let campusId = "default-campus-id";

      if (commissionResponse.ok) {
        const commission = await commissionResponse.json();
        campusId = commission.campusId;
        console.log("Campus ID obtido:", campusId);
      } else {
        console.warn("Não foi possível obter dados da comissão");
      }

      // Enviar direto para o servidor
      console.log("Enviando item para o servidor...");

      // Converter de BemCopia para o formato esperado pela API
      const apiItem = {
        number: item.NUMERO || `ITEM-${Date.now()}`,
        description: item.DESCRICAO || "Novo item",
        conservationState: convertEstadoConservacao(item.ESTADO_DE_CONSERVACAO),
        brandModel: item.MARCA_MODELO || "",
        currentResponsibility: item.RESPONSABILIDADE_ATUAL || "",
        location: item.SALA || "",
        sector: item.SETOR_DO_RESPONSAVEL || "",
        ed: item.ED || "",
        tags: item.ROTULOS
          ? item.ROTULOS.split(",").map((tag) => tag.trim())
          : [],
        campusId: item.campus_id || campusId,
      };

      // Verificar se campos obrigatórios estão presentes
      if (!apiItem.campusId) {
        throw new Error("O ID do campus é obrigatório");
      }

      if (!apiItem.number) {
        throw new Error("O número do item é obrigatório");
      }

      if (!apiItem.description) {
        throw new Error("A descrição do item é obrigatória");
      }

      // Função auxiliar para converter o estado de conservação para o formato esperado pela API
      function convertEstadoConservacao(estado?: string) {
        if (!estado) return "bom";

        switch (estado.toUpperCase()) {
          case "NOVO":
            return "bom";
          case "BOM":
            return "bom";
          case "REGULAR":
            return "regular";
          case "RUIM":
            return "ruim";
          case "INSERVIVEL":
            return "inservível";
          default:
            return "bom";
        }
      }

      console.log("Item convertido para formato da API:", apiItem);

      try {
        const response = await fetch("/api/inventory", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            commissionId,
            item: apiItem,
          }),
        });

        const responseData = await response.json();

        if (!response.ok) {
          console.error("❌ Erro da API:", responseData);
          throw new Error(responseData.error || "Erro ao salvar item");
        }

        console.log("✅ Item salvo com sucesso:", responseData);

        // Fechar o modal
        setIsNewItemModalOpen(false);

        // Não precisa mais recarregar dados pois o hook já atualiza o estado local
      } catch (error) {
        console.error("❌ Erro ao salvar item:", error);
        throw error; // Propagar o erro para o modal tratar
      }
    } catch (error) {
      console.error("❌ Erro ao salvar item:", error);
      throw error; // Propagar o erro para o modal tratar
    }
  };

  const handleNewItem = () => {
    setIsNewItemModalOpen(true);
  };

  const handleExport = (format: "csv" | "json" | "pdf") => {
    let dataToExport = filteredItems;

    if (filteredItems.length > 5000) {
      if (format === "pdf") {
        const confirmExport = window.confirm(
          `Exportar ${filteredItems.length.toLocaleString()} itens para PDF pode ser lento e consumir muita memória. ` +
            `Apenas os primeiros 15000 itens serão exportados. Deseja continuar?`
        );

        if (!confirmExport) return;
        dataToExport = filteredItems.slice(0, 20000);
      } else {
        const confirmExport = window.confirm(
          `Exportar ${filteredItems.length.toLocaleString()} itens pode ser lento e consumir muita memória. Deseja continuar?`
        );

        if (!confirmExport) return;
      }
    }

    const safeDate = (date: any): Date => {
      if (date instanceof Date) return date;
      if (typeof date === "string" || typeof date === "number")
        return new Date(date);
      return new Date();
    };

    if (format === "csv") {
      exportToCsv(dataToExport);
    } else if (format === "json") {
      exportToJson(dataToExport);
    } else if (format === "pdf") {
      const pdfData =
        dataToExport.length > 20000
          ? dataToExport.slice(0, 20000)
          : dataToExport;

      exportToPdfStyled(
        pdfData,
        `inventario_${new Date().toISOString().split("T")[0]}`,
        {
          comissao_id: commissionId || "0",
          nome: "Comissão Desconhecida",
          tipo: "Desconhecida",
          campus_id: "",
        },
        {
          campus_id: "",
          nome: "Campus Desconhecido",
          campus_codigo: "",
          campus_ativo: true,
        },
        {
          usuario_id: "",
          nome: "Presidente Desconhecido",
          papel: "",
          email: "",
          habilitado: true,
          organizacao_id: "",
        },
        {
          usuario_id: "",
          nome: "Inventariante Desconhecido",
          papel: "",
          email: "",
          habilitado: true,
          organizacao_id: "",
        },
        new Date(),
        new Date(),
        displayFields,
        commissionId,
        user ? {
          id: user.id,
          name: user.name,
          email: user.email
        } : undefined
      );
    }
  };

  const exportToCsv = (data: BemCopia[]) => {
    try {
      const headers = displayFields.join(",") + "\n";

      const rows = data
        .map((item) => {
          return displayFields
            .map((field) => {
              if (field === "data_ultima_atualizacao" && item[field]) {
                return `"${new Date(item[field]).toLocaleDateString("pt-BR")}"`;
              }
              const value = item[field as keyof BemCopia] ?? "";
              return `"${String(value).replace(/"/g, '""')}"`;
            })
            .join(",");
        })
        .join("\n");

      const csvContent = headers + rows;
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `inventario_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erro ao exportar CSV:", error);
      toast.error("Ocorreu um erro ao exportar para CSV");
    }
  };

  const exportToJson = (data: BemCopia[]) => {
    try {
      const filteredData = data.map((item) => {
        const filteredItem: any = {};
        displayFields.forEach((field) => {
          filteredItem[field] = item[field as keyof BemCopia];
        });
        return filteredItem;
      });

      const jsonStr = JSON.stringify(filteredData, null, 2);
      const blob = new Blob([jsonStr], {
        type: "application/json;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `inventario_${new Date().toISOString().split("T")[0]}.json`
      );
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erro ao exportar JSON:", error);
      toast.error("Ocorreu um erro ao exportar para JSON");
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-md lg:max-w-5xl xl:max-w-6xl">
        <CardContent className="flex flex-col gap-6 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-[var(--card-color)] rounded"></div>
            <div className="h-8 bg-[var(--card-color)] rounded w-2/3"></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-40 bg-[var(--card-color)] rounded"></div>
              <div className="h-40 bg-[var(--card-color)] rounded"></div>
              <div className="h-40 bg-[var(--card-color)] rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loadError) {
    return (
      <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-md lg:max-w-5xl xl:max-w-6xl">
        <CardContent className="flex flex-col gap-6 items-center justify-center py-12 p-6">
          <div className="text-center">
            <Filter className="h-12 w-12 text-red-500/70 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[var(--font-color)]">
              Erro ao carregar dados
            </h3>
            <p className="text-sm text-[var(--font-color)]/70 mt-2 mb-6 max-w-md">
              {loadError}
            </p>
            <Button
              onClick={() => navigateTo(errorRoute)}
              className="bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white"
            >
              Processar Novo Arquivo
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!inventoryData.length) {
    return <EmptyInventory />;
  }

  // Add this new handler for camera search
  const handleCameraSearch = (value: string) => {
    setSearchTerm(value);
    // Scroll to search input and results
    setTimeout(() => {
      const searchInput = document.querySelector(
        'input[placeholder="Buscar itens..."]'
      );
      if (searchInput instanceof HTMLElement) {
        searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  return (
    <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-md lg:max-w-5xl xl:max-w-6xl">
      <CardContent className="flex flex-col gap-6 p-6">
        <InventoryMetadata metadata={metadata} />

        <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
          <div className="flex flex-col gap-2">
            <Suspense fallback={
              <div className="flex gap-2">
                <div className="h-10 w-24 bg-[var(--card-color)] rounded animate-pulse"></div>
                <div className="h-10 w-24 bg-[var(--card-color)] rounded animate-pulse"></div>
                <div className="h-10 w-24 bg-[var(--card-color)] rounded animate-pulse"></div>
              </div>
            }>
              <InventoryActions
                onExport={handleExport}
                onNewItem={handleNewItem}
                hasData={filteredItems.length > 0}
                onSearch={handleCameraSearch} // Updated to use new handler
              />
            </Suspense>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={forceSync}
                disabled={isSyncing}
                className="flex items-center gap-2 border-[var(--border-input)] bg-[var(--card-color)] text-[var(--font-color)] hover:bg-[var(--hover-3-color)] hover:text-white"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
                />
                {isSyncing ? "Sincronizando..." : "Sincronizar"}
              </Button>
              {lastSync && (
                <span className="text-xs text-[var(--font-color)]/70">
                  Última sync: {lastSync.toLocaleTimeString()}
                </span>
              )}
              {syncStatus === "pending" && (
                <span className="text-xs text-orange-500 font-medium">
                  ⏳ Sincronização pendente
                </span>
              )}
              {syncStatus === "synced" && (
                <span className="text-xs text-green-500 font-medium">
                  ✅ Sincronizado
                </span>
              )}
            </div>
            <InventoryFilters
              onFilterChange={handleFilterChange}
              selectedFilters={selectedFilters}
              onDisplayFieldsChange={setDisplayFields}
              displayFields={displayFields}
              onSearchChange={handleSearchChange}
              searchTerm={searchTerm}
              uniqueValues={uniqueValues}
            />
          </div>
        </div>

        <InventoryPagination
          currentPage={currentPage}
          totalPages={totalPages}
          showAll={showAll}
          onPageChange={handlePageChange}
          onShowAllToggle={toggleShowAll}
          totalItems={filteredItems.length}
          itemsPerPage={itemsPerPage}
        />

        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 overflow-hidden">
          {currentItems.map((item) => (
            <div key={item.bem_id || item.NUMERO} className="min-w-0 overflow-hidden">
              <InventoryCard
                item={item}
                displayFields={displayFields}
              />
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Filter className="h-12 w-12 text-[var(--font-color)]/30 mb-4" />
            <h3 className="text-lg font-medium text-[var(--font-color)]">
              Nenhum item encontrado
            </h3>
            <p className="text-sm text-[var(--font-color)]/70 mt-1">
              Tente ajustar sua busca ou os filtros aplicados
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedFilters({});
              }}
              className="mt-4 border-[var(--border-input)] bg-[var(--card-color)] text-[var(--font-color)] hover:bg-[var(--hover-3-color)] hover:text-white"
            >
              Limpar Filtros
            </Button>
          </div>
        )}

        <div className="flex justify-end mt-4">
          <Button
            variant="outline"
            className="w-36 flex items-center gap-2 border-[var(--border-input)] bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-3-color)] hover:text-white"
            onClick={() => navigateTo(backRoute)}
          >
            <span>Voltar</span>
          </Button>
        </div>

        <NewItemModal
          isOpen={isNewItemModalOpen}
          onClose={() => setIsNewItemModalOpen(false)}
          onSave={handleSaveNewItem}
          inventoryData={inventoryData}
          campusId={metadata?.campusId || ""}
        />
      </CardContent>
    </Card>
  );
}
