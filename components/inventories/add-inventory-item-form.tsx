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
import { useInventoryWithSync } from "@/hooks/use-inventory-query";
import { Loader2, Plus, Wifi, WifiOff } from "lucide-react";
import { useState } from "react";
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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
              <Label htmlFor="currentResponsibility">
                Responsabilidade Atual
              </Label>
              <Input
                id="currentResponsibility"
                value={formData.currentResponsibility}
                onChange={(e) =>
                  handleInputChange("currentResponsibility", e.target.value)
                }
                placeholder="Nome do responsável"
              />
            </div>

            {/* Setor */}
            <div className="space-y-2">
              <Label htmlFor="sector">Setor</Label>
              <Input
                id="sector"
                value={formData.sector}
                onChange={(e) => handleInputChange("sector", e.target.value)}
                placeholder="Ex: TI, Administração"
              />
            </div>
          </div>

          {/* Localização */}
          <div className="space-y-2">
            <Label htmlFor="location">Localização/Sala</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="Ex: Sala 101, Laboratório A"
            />
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
