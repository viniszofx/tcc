"use client";

import EmptyInventory from "@/components/dashboard/empty-inventory";
import InventoryActions from "@/components/inventories/inventory-actions";
import InventoryCard from "@/components/inventories/inventory-card";
import InventoryFilters from "@/components/inventories/inventory-filters";
import InventoryMetadata from "@/components/inventories/inventory-metadata";
import InventoryPagination from "@/components/inventories/inventory-pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getProcessedData } from "@/utils/data-storage";
import { Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import NewItemModal from "@/components/inventories/new-item-modal";
import { addInventoryItem } from "@/utils/data-storage";

import { BemCopia } from "@/lib/interface";

export default function InventoriesPage() {
  const router = useRouter();
  // Estados principais para controle de dados
  const [inventoryData, setInventoryData] = useState<any[]>([]); // Armazena itens do inventário
  const [metadata, setMetadata] = useState<any>(null); // Metadados do inventário
  const [isLoading, setIsLoading] = useState(true); // Controle de carregamento
  const [loadError, setLoadError] = useState<string | null>(null); // Controle de erros

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

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      console.log("🔄 Iniciando carregamento de dados..."); // Debug

      if (!isMounted) return;
      setIsLoading(true);
      setLoadError(null);

      try {
        const { data, metadata } = await getProcessedData();
        console.log("📦 Dados carregados:", {
          itemCount: data.length,
          metadata,
          sampleData: data.slice(0, 2), // Mostra primeiros 2 itens
        });

        if (!isMounted) return;

        setInventoryData(data);
        setMetadata(metadata);
      } catch (error) {
        console.error("❌ Erro no carregamento:", error);
        setLoadError("Erro ao carregar os dados. Tente novamente.");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

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
        if (item[field]) {
          uniqueSet.add(item[field]);
        }
      });

      values[field] = Array.from(uniqueSet).sort();
    });

    return values;
  }, [inventoryData]);

  // Debug da filtragem
  const filteredItems = useMemo(() => {
    console.log("🔍 Aplicando filtros:", {
      totalItems: inventoryData.length,
      searchTerm,
      selectedFilters,
    });

    if (inventoryData.length === 0) return [];

    const hasFilters = Object.values(selectedFilters).some(Boolean);
    const hasSearch = searchTerm.trim().length > 0;

    if (!hasFilters && !hasSearch) {
      return inventoryData;
    }

    const searchTermLower = searchTerm.toLowerCase();

    const result = inventoryData.filter((item) => {
      const matchesSearch =
        !hasSearch ||
        (item.DESCRICAO &&
          item.DESCRICAO.toLowerCase().includes(searchTermLower)) ||
        (item.NUMERO && item.NUMERO.toLowerCase().includes(searchTermLower)) ||
        (item.MARCA_MODELO &&
          item.MARCA_MODELO.toLowerCase().includes(searchTermLower)) ||
        (item.RESPONSABILIDADE_ATUAL &&
          item.RESPONSABILIDADE_ATUAL.toLowerCase().includes(
            searchTermLower
          )) ||
        (item.SETOR_DO_RESPONSAVEL &&
          item.SETOR_DO_RESPONSAVEL.toLowerCase().includes(searchTermLower));

      if (!matchesSearch) return false;

      if (!hasFilters) return true;

      return Object.entries(selectedFilters).every(([field, value]) => {
        return !value || value === "all" || item[field] === value;
      });
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
      await addInventoryItem(item);
      const { data, metadata } = await getProcessedData();
      setInventoryData(data);
      setMetadata(metadata);
    } catch (error) {
      console.error("Error saving new item:", error);
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

    if (format === "csv") {
      const headers = Object.keys(dataToExport[0] || {}).join(",");
      const rows = dataToExport.map((item) =>
        Object.values(item)
          .map((value) =>
            typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value
          )
          .join(",")
      );
      const csv = [headers, ...rows].join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `inventario_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === "json") {
      const json = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `inventario_${new Date().toISOString().split("T")[0]}.json`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === "pdf") {
      const pdfData =
        format === "pdf" && dataToExport.length > 20000
          ? dataToExport.slice(0, 20000)
          : dataToExport;

      // exportToPdfStyled(pdfData, `inventario_${new Date().toISOString().split("T")[0]}`)
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
              onClick={() => router.push("/dashboard")}
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

  return (
    <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-md lg:max-w-5xl xl:max-w-6xl">
      <CardContent className="flex flex-col gap-6 p-6">
        <InventoryMetadata metadata={metadata} />

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          <InventoryActions
            onExport={handleExport}
            onNewItem={handleNewItem}
            hasData={filteredItems.length > 0}
          />
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

        <InventoryPagination
          currentPage={currentPage}
          totalPages={totalPages}
          showAll={showAll}
          onPageChange={handlePageChange}
          onShowAllToggle={toggleShowAll}
          totalItems={filteredItems.length}
          itemsPerPage={itemsPerPage}
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {currentItems.map((item) => (
            <InventoryCard
              key={item.bem_id || item.NUMERO}
              item={item}
              displayFields={displayFields}
            />
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

        {filteredItems.length > itemsPerPage && (
          <InventoryPagination
            currentPage={currentPage}
            totalPages={totalPages}
            showAll={showAll}
            onPageChange={handlePageChange}
            onShowAllToggle={toggleShowAll}
            totalItems={filteredItems.length}
            itemsPerPage={itemsPerPage}
          />
        )}
        <NewItemModal
          isOpen={isNewItemModalOpen}
          onClose={() => setIsNewItemModalOpen(false)}
          onSave={handleSaveNewItem}
        />
      </CardContent>
    </Card>
  );
}
