"use client";

import { Button } from "@/components/ui/button";
import {
  Camera,
  FileJson,
  FilePlus,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { useState } from "react";
import { CameraModal } from "../camera/camera-modal";

interface InventoryActionsProps {
  onExport: (format: "csv" | "json" | "pdf") => void;
  onNewItem: () => void;
  hasData: boolean;
  onSearch?: (value: string) => void; // Add this prop
}

export default function InventoryActions({
  onExport,
  onNewItem,
  hasData,
  onSearch,
}: InventoryActionsProps) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const handleCameraClick = () => {
    if (typeof window !== "undefined" && window.navigator.mediaDevices) {
      setIsCameraOpen(true);
    } else {
      console.warn("Camera access is not supported in this browser.");
    }
  };

  const handleCapture = (imageData: string) => {
    // Handle the captured image data
    console.log("Image captured:", imageData);
    setIsCameraOpen(false);
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button
            onClick={() => onExport("csv")}
            variant="outline"
            disabled={!hasData}
            className="flex items-center gap-2 border-[var(--border-input)] bg-[var(--card-color)] text-[var(--font-color)] hover:bg-[var(--hover-3-color)] hover:text-white disabled:opacity-50"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar</span> CSV
          </Button>
          <Button
            onClick={() => onExport("json")}
            variant="outline"
            disabled={!hasData}
            className="flex items-center gap-2 border-[var(--border-input)] bg-[var(--card-color)] text-[var(--font-color)] hover:bg-[var(--hover-3-color)] hover:text-white disabled:opacity-50"
          >
            <FileJson className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar</span> JSON
          </Button>
          <Button
            onClick={() => onExport("pdf")}
            variant="outline"
            disabled={!hasData}
            className="flex items-center gap-2 border-[var(--border-input)] bg-[var(--card-color)] text-[var(--font-color)] hover:bg-[var(--hover-3-color)] hover:text-white disabled:opacity-50"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar</span> PDF
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleCameraClick}
            className="flex items-center gap-2 bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white"
          >
            <Camera className="h-4 w-4" />
            <span>Câmera</span>
          </Button>
          <Button
            onClick={onNewItem}
            className="flex items-center gap-2 bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white"
          >
            <FilePlus className="h-4 w-4" />
            <span>Novo Item</span>
          </Button>
        </div>
      </div>

      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCapture}
        onSearch={onSearch}
      />
    </>
  );
}
