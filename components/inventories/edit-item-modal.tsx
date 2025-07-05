"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { InventoryItemWithRelations } from '@/types';
import { useEffect, useState } from "react";

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: InventoryItemWithRelations) => void;
  item: InventoryItemWithRelations | null;
}

export default function EditItemModal({
  isOpen,
  onClose,
  onSave,
  item,
}: EditItemModalProps) {
  const [formData, setFormData] = useState<Partial<InventoryItemWithRelations>>(
    {}
  );
  const [campuses, setCampuses] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (item) {
      setFormData({ ...item });
    }
  }, [item]);

  useEffect(() => {
    if (!isOpen) return;

    // Buscar campuses da API
    async function loadCampuses() {
      try {
        const response = await fetch("/api/campus");
        if (response.ok) {
          const campusData = await response.json();
          setCampuses(campusData);
        }
      } catch (error) {
        console.error("Erro ao carregar campuses:", error);
      }
    }

    loadCampuses();
  }, [isOpen]);

  const handleChange = (
    field: keyof InventoryItemWithRelations,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.number) {
      newErrors.number = "Número é obrigatório";
    } else if (!/^\d+$/.test(formData.number)) {
      newErrors.number = "Número deve conter apenas dígitos";
    }

    if (!formData.description)
      newErrors.description = "Descrição é obrigatória";
    if (!formData.currentResponsibility)
      newErrors.currentResponsibility = "Responsável é obrigatório";
    if (!formData.sector) newErrors.sector = "Setor é obrigatório";
    if (!formData.location) newErrors.location = "Sala é obrigatória";
    if (!formData.ed) newErrors.ed = "ED é obrigatório";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !item) return;

    setIsSubmitting(true);

    try {
      const updatedItem = {
        ...item,
        ...formData,
        updatedAt: new Date(),
      };

      await onSave(updatedItem);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent
        className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-[var(--font-color)]">
            Editar Item
          </DialogTitle>
          <DialogDescription className="text-[var(--font-color)]/70">
            Atualize os detalhes do item de inventário.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 w-full">
              <Label htmlFor="numero" className="text-[var(--font-color)]">
                Número <span className="text-red-500">*</span>
              </Label>
              <Input
                id="numero"
                value={formData.number || ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  handleChange("number", value);
                }}
                className={`bg-[var(--bg-simple)] border-[var(--border-input)] text-[var(--font-color)] w-full ${
                  errors.number ? "border-red-500" : ""
                }`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
              />
              {errors.number && (
                <p className="text-xs text-red-500">{errors.number}</p>
              )}
            </div>

            <div className="space-y-2 w-full">
              <Label htmlFor="ed" className="text-[var(--font-color)]">
                ED <span className="text-red-500">*</span>
              </Label>
              <Input
                id="ed"
                value={formData.ed || ""}
                onChange={(e) => handleChange("ed", e.target.value)}
                className={`bg-[var(--bg-simple)] border-[var(--border-input)] text-[var(--font-color)] w-full ${
                  errors.ed ? "border-red-500" : ""
                }`}
              />
              {errors.ed && <p className="text-xs text-red-500">{errors.ed}</p>}
            </div>
          </div>

          <div className="space-y-2 w-full">
            <Label htmlFor="descricao" className="text-[var(--font-color)]">
              Descrição <span className="text-red-500">*</span>
            </Label>
            <Input
              id="descricao"
              value={formData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              className={`bg-[var(--bg-simple)] border-[var(--border-input)] text-[var(--font-color)] w-full ${
                errors.description ? "border-red-500" : ""
              }`}
            />
            {errors.description && (
              <p className="text-xs text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2 w-full">
            <Label htmlFor="marca-modelo" className="text-[var(--font-color)]">
              Marca/Modelo
            </Label>
            <Input
              id="marca-modelo"
              value={formData.brandModel || ""}
              onChange={(e) => handleChange("brandModel", e.target.value)}
              className="bg-[var(--bg-simple)] border-[var(--border-input)] text-[var(--font-color)] w-full"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 w-full">
              <Label htmlFor="responsavel" className="text-[var(--font-color)]">
                Responsável <span className="text-red-500">*</span>
              </Label>
              <Input
                id="responsavel"
                value={formData.currentResponsibility || ""}
                onChange={(e) =>
                  handleChange("currentResponsibility", e.target.value)
                }
                className={`bg-[var(--bg-simple)] border-[var(--border-input)] text-[var(--font-color)] w-full ${
                  errors.currentResponsibility ? "border-red-500" : ""
                }`}
              />
              {errors.currentResponsibility && (
                <p className="text-xs text-red-500">
                  {errors.currentResponsibility}
                </p>
              )}
            </div>

            <div className="space-y-2 w-full">
              <Label htmlFor="setor" className="text-[var(--font-color)]">
                Setor <span className="text-red-500">*</span>
              </Label>
              <Input
                id="setor"
                value={formData.sector || ""}
                onChange={(e) => handleChange("sector", e.target.value)}
                className={`bg-[var(--bg-simple)] border-[var(--border-input)] text-[var(--font-color)] w-full ${
                  errors.sector ? "border-red-500" : ""
                }`}
              />
              {errors.sector && (
                <p className="text-xs text-red-500">{errors.sector}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 w-full">
              <Label htmlFor="campus" className="text-[var(--font-color)]">
                Campus
              </Label>
              <Select
                value={formData.campusId || ""}
                onValueChange={(value) => {
                  // Atualizar o campusId
                  handleChange("campusId", value);

                  // Não é necessário atualizar um campo displayName pois o componente
                  // buscará o nome do campus através da relação campus quando necessário
                }}
              >
                <SelectTrigger className="bg-[var(--bg-simple)] border-[var(--border-input)] text-[var(--font-color)] w-full">
                  <SelectValue placeholder="Selecione o campus" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {campuses.map((campus) => (
                    <SelectItem key={campus.id} value={campus.id}>
                      {campus.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 w-full">
              <Label htmlFor="sala" className="text-[var(--font-color)]">
                Sala <span className="text-red-500">*</span>
              </Label>
              <Input
                id="sala"
                value={formData.location || ""}
                onChange={(e) => handleChange("location", e.target.value)}
                className={`bg-[var(--bg-simple)] border-[var(--border-input)] text-[var(--font-color)] w-full ${
                  errors.location ? "border-red-500" : ""
                }`}
              />
              {errors.location && (
                <p className="text-xs text-red-500">{errors.location}</p>
              )}
            </div>
          </div>

          <div className="space-y-2 w-full">
            <Label htmlFor="estado" className="text-[var(--font-color)]">
              Estado de Conservação
            </Label>
            <Select
              value={formData.conservationState || "bom"}
              onValueChange={(value) =>
                handleChange("conservationState", value)
              }
            >
              <SelectTrigger className="bg-[var(--bg-simple)] border-[var(--border-input)] text-[var(--font-color)] w-full">
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bom">Bom</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="ruim">Ruim</SelectItem>
                <SelectItem value="inservível">Inservível</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 w-full">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto border-[var(--border-input)] bg-[var(--card-color)] text-[var(--font-color)] hover:bg-[var(--hover-3-color)] hover:text-white"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white"
          >
            {isSubmitting ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
