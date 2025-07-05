"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCampus } from "@/hooks/queries/use-campus-query";
import { useInventoryWithSync } from "@/hooks/use-inventory-query";
import { Loader2, Plus, Wifi, WifiOff } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface AddInventoryItemFormProps {
  commissionId: string;
  campusId: string;
  onSuccess?: () => void;
}

export function AddInventoryItemForm({
  commissionId,
  campusId,
  onSuccess,
}: AddInventoryItemFormProps) {
  const { addItem, isCreating, isOnline, pendingItemsCount } =
    useInventoryWithSync(commissionId);

  // Buscar informações do campus para exibir o nome em vez do ID
  const { data: campus } = useCampus(campusId);

  const [formData, setFormData] = useState({
    number: "",
    description: "",
    brandModel: "",
    currentResponsibility: "",
    conservationState: "bom",
    location: "",
    tags: "",
    ed: "",
    sector: "",
  });

  const [uniqueValues, setUniqueValues] = useState<{
    responsibilities: string[];
    sectors: string[];
    locations: string[];
  }>({ responsibilities: [], sectors: [], locations: [] });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      toast.error("Descrição é obrigatória");
      return;
    }

    try {
      // Converter tags de string para array
      const tags = formData.tags
        ? formData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [];

      const itemData = {
        commissionId,
        campusId,
        number: formData.number.trim() || undefined,
        description: formData.description.trim(),
        brandModel: formData.brandModel.trim() || undefined,
        currentResponsibility:
          formData.currentResponsibility.trim() || undefined,
        conservationState: formData.conservationState,
        location: formData.location.trim() || undefined,
        tags,
        ed: formData.ed.trim() || undefined,
        sector: formData.sector.trim() || undefined,
      };

      await addItem(itemData);

      // Limpar formulário
      setFormData({
        number: "",
        description: "",
        brandModel: "",
        currentResponsibility: "",
        conservationState: "bom",
        location: "",
        tags: "",
        ed: "",
        sector: "",
      });

      if (isOnline) {
        toast.success("Item adicionado e sincronizado com sucesso!");
      } else {
        toast.success(
          "Item adicionado localmente. Será sincronizado quando voltar online."
        );
      }

      onSuccess?.();
    } catch (error) {
      console.error("Erro ao adicionar item:", error);
      toast.error("Erro ao adicionar item");
    }
  };

  useEffect(() => {
    // Buscar valores únicos
    async function loadUniqueValues() {
      try {
        const params = new URLSearchParams();
        params.append('commissionId', commissionId);
        params.append('campusId', campusId);
        
        const response = await fetch(`/api/inventory/unique-values?${params}`);
        if (response.ok) {
          const data = await response.json();
          setUniqueValues(data);
        }
      } catch (error) {
        console.error("Erro ao carregar valores únicos:", error);
      }
    }

    loadUniqueValues();
  }, [commissionId, campusId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
          commissionId,
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
        handleInputChange(fieldName, value);

        // Limpar o input e esconder
        setNewValueInputs(prev => ({ ...prev, [type]: '' }));
        setShowNewValueInputs(prev => ({ ...prev, [type]: false }));
      }
    } catch (error) {
      console.error(`Erro ao adicionar novo ${type}:`, error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Adicionar Item ao Inventário
          </span>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Badge variant="default" className="gap-1">
                <Wifi className="w-3 h-3" />
                Online
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <WifiOff className="w-3 h-3" />
                Offline
              </Badge>
            )}
            {pendingItemsCount > 0 && (
              <Badge variant="outline">
                {pendingItemsCount} pendente{pendingItemsCount > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informação do Campus */}
          <div className="mb-4">
            <Badge variant="outline" className="text-sm">
              Campus: {campus?.name || "Carregando..."}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Número */}
            <div className="space-y-2">
              <Label htmlFor="number">Número Patrimonial</Label>
              <Input
                id="number"
                value={formData.number}
                onChange={(e) => handleInputChange("number", e.target.value)}
                placeholder="Ex: 123456"
              />
            </div>

            {/* ED */}
            <div className="space-y-2">
              <Label htmlFor="ed">ED</Label>
              <Input
                id="ed"
                value={formData.ed}
                onChange={(e) => handleInputChange("ed", e.target.value)}
                placeholder="Ex: ED001"
              />
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Descreva o item..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Marca/Modelo */}
            <div className="space-y-2">
              <Label htmlFor="brandModel">Marca/Modelo</Label>
              <Input
                id="brandModel"
                value={formData.brandModel}
                onChange={(e) =>
                  handleInputChange("brandModel", e.target.value)
                }
                placeholder="Ex: Dell Inspiron 15"
              />
            </div>

            {/* Estado de Conservação */}
            <div className="space-y-2">
              <Label htmlFor="conservationState">Estado de Conservação</Label>
              <Select
                value={formData.conservationState}
                onValueChange={(value) =>
                  handleInputChange("conservationState", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="novo">Novo</SelectItem>
                  <SelectItem value="bom">Bom</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="ruim">Ruim</SelectItem>
                  <SelectItem value="inservivel">Inservível</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Responsabilidade Atual */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="currentResponsibility">
                  Responsabilidade Atual
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
                    className="flex-1"
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
                  value={formData.currentResponsibility}
                  onValueChange={(value) => handleInputChange("currentResponsibility", value)}
                >
                  <SelectTrigger>
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
            </div>

            {/* Setor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="sector">Setor</Label>
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
                    className="flex-1"
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
                  value={formData.sector}
                  onValueChange={(value) => handleInputChange("sector", value)}
                >
                  <SelectTrigger>
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
            </div>
          </div>

          {/* Localização */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="location">Localização/Sala</Label>
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
                  className="flex-1"
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
                value={formData.location}
                onValueChange={(value) => handleInputChange("location", value)}
              >
                <SelectTrigger>
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
          </div>

          {/* Tags/Rótulos */}
          <div className="space-y-2">
            <Label htmlFor="tags">Rótulos/Tags</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => handleInputChange("tags", e.target.value)}
              placeholder="Separe por vírgula: eletrônico, informática, móvel"
            />
            <p className="text-xs text-muted-foreground">
              Separe múltiplos rótulos com vírgula
            </p>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isCreating || !formData.description.trim()}
              className="min-w-32"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adicionando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Item
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
