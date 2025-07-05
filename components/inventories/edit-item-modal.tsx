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
import { Plus } from "lucide-react";
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
  const [uniqueValues, setUniqueValues] = useState<{
    responsibilities: string[];
    sectors: string[];
    locations: string[];
  }>({ responsibilities: [], sectors: [], locations: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newValueInputs, setNewValueInputs] = useState<{
    responsibility: string;
    sector: string;
    location: string;
  }>({ responsibility: '', sector: '', location: '' });
  const [showNewValueInputs, setShowNewValueInputs] = useState<{
    responsibility: boolean;
    sector: boolean;
    location: boolean;
  }>({ responsibility: false, sector: false, location: false });

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

    // Buscar valores únicos
    async function loadUniqueValues() {
      try {
        const params = new URLSearchParams();
        if (item?.commissionId) {
          params.append('commissionId', item.commissionId);
        }
        if (item?.campusId) {
          params.append('campusId', item.campusId);
        }
        
        const response = await fetch(`/api/inventory/unique-values?${params}`);
        if (response.ok) {
          const data = await response.json();
          setUniqueValues(data);
        }
      } catch (error) {
        console.error("Erro ao carregar valores únicos:", error);
      }
    }

    loadCampuses();
    loadUniqueValues();
  }, [isOpen, item?.commissionId, item?.campusId]);

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

  const handleAddNewValue = async (type: 'responsibility' | 'sector' | 'location') => {
    const value = newValueInputs[type].trim();
    if (!value) return;

    try {
      const response = await fetch('/api/inventory/unique-values', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          value,
          commissionId: item?.commissionId,
        }),
      });

      if (response.ok) {
        // Adicionar o novo valor à lista local
        setUniqueValues(prev => ({
          ...prev,
          [type === 'responsibility' ? 'responsibilities' : type === 'sector' ? 'sectors' : 'locations']: [
            ...prev[type === 'responsibility' ? 'responsibilities' : type === 'sector' ? 'sectors' : 'locations'],
            value
          ].sort()
        }));

        // Definir o novo valor no formulário
        const fieldName = type === 'responsibility' ? 'currentResponsibility' : type === 'sector' ? 'sector' : 'location';
        handleChange(fieldName as keyof InventoryItemWithRelations, value);

        // Limpar o input e esconder
        setNewValueInputs(prev => ({ ...prev, [type]: '' }));
        setShowNewValueInputs(prev => ({ ...prev, [type]: false }));
      }
    } catch (error) {
      console.error(`Erro ao adicionar novo ${type}:`, error);
    }
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
                onChange={(e) => handleChange("number", e.target.value)}
                className={`bg-[var(--bg-simple)] border-[var(--border-input)] text-[var(--font-color)] w-full ${
                  errors.number ? "border-red-500" : ""
                }`}
                type="text"
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
              <div className="flex items-center justify-between">
                <Label htmlFor="responsavel" className="text-[var(--font-color)]">
                  Responsável <span className="text-red-500">*</span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewValueInputs(prev => ({ ...prev, responsibility: !prev.responsibility }))}
                  className="h-6 px-2 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Novo
                </Button>
              </div>
              
              {showNewValueInputs.responsibility ? (
                <div className="flex gap-2">
                  <Input
                    value={newValueInputs.responsibility}
                    onChange={(e) => setNewValueInputs(prev => ({ ...prev, responsibility: e.target.value }))}
                    placeholder="Digite o novo responsável"
                    className="bg-[var(--bg-simple)] border-[var(--border-input)] text-[var(--font-color)] flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleAddNewValue('responsibility')}
                    className="px-3"
                  >
                    +
                  </Button>
                </div>
              ) : (
                <Select
                  value={formData.currentResponsibility || ""}
                  onValueChange={(value) => handleChange("currentResponsibility", value)}
                >
                  <SelectTrigger className={`bg-[var(--bg-simple)] border-[var(--border-input)] text-[var(--font-color)] w-full ${
                    errors.currentResponsibility ? "border-red-500" : ""
                  }`}>
                    <SelectValue placeholder="Selecione o responsável" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {uniqueValues.responsibilities.map((responsibility) => (
                      <SelectItem key={responsibility} value={responsibility}>
                        {responsibility}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.currentResponsibility && (
                <p className="text-xs text-red-500">
                  {errors.currentResponsibility}
                </p>
              )}
            </div>

            <div className="space-y-2 w-full">
              <div className="flex items-center justify-between">
                <Label htmlFor="setor" className="text-[var(--font-color)]">
                  Setor <span className="text-red-500">*</span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewValueInputs(prev => ({ ...prev, sector: !prev.sector }))}
                  className="h-6 px-2 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Novo
                </Button>
              </div>
              
              {showNewValueInputs.sector ? (
                <div className="flex gap-2">
                  <Input
                    value={newValueInputs.sector}
                    onChange={(e) => setNewValueInputs(prev => ({ ...prev, sector: e.target.value }))}
                    placeholder="Digite o novo setor"
                    className="bg-[var(--bg-simple)] border-[var(--border-input)] text-[var(--font-color)] flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleAddNewValue('sector')}
                    className="px-3"
                  >
                    +
                  </Button>
                </div>
              ) : (
                <Select
                  value={formData.sector || ""}
                  onValueChange={(value) => handleChange("sector", value)}
                >
                  <SelectTrigger className={`bg-[var(--bg-simple)] border-[var(--border-input)] text-[var(--font-color)] w-full ${
                    errors.sector ? "border-red-500" : ""
                  }`}>
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {uniqueValues.sectors.map((sector) => (
                      <SelectItem key={sector} value={sector}>
                        {sector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
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
              <div className="flex items-center justify-between">
                <Label htmlFor="sala" className="text-[var(--font-color)]">
                  Sala <span className="text-red-500">*</span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewValueInputs(prev => ({ ...prev, location: !prev.location }))}
                  className="h-6 px-2 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Novo
                </Button>
              </div>
              
              {showNewValueInputs.location ? (
                <div className="flex gap-2">
                  <Input
                    value={newValueInputs.location}
                    onChange={(e) => setNewValueInputs(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Digite a nova sala"
                    className="bg-[var(--bg-simple)] border-[var(--border-input)] text-[var(--font-color)] flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleAddNewValue('location')}
                    className="px-3"
                  >
                    +
                  </Button>
                </div>
              ) : (
                <Select
                  value={formData.location || ""}
                  onValueChange={(value) => handleChange("location", value)}
                >
                  <SelectTrigger className={`bg-[var(--bg-simple)] border-[var(--border-input)] text-[var(--font-color)] w-full ${
                     errors.location ? "border-red-500" : ""
                   }`}>
                    <SelectValue placeholder="Selecione a sala" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {uniqueValues.locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
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
