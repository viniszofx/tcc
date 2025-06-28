"use client";

import type React from "react";

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
import { Switch } from "@/components/ui/switch";
import type { Commission } from "@/lib/new-interface";
import { useState } from "react";

interface EditComissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (comissao: Commission) => void;
  onDelete: () => void;
  comissao: Commission;
}

export function EditComissionModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  comissao,
}: EditComissionModalProps) {
  const [formData, setFormData] = useState<Commission>(comissao);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const tiposComissao = [
    { value: "inventário", label: "Inventário" },
    { value: "desfazimento", label: "Desfazimento" },
    { value: "outra", label: "Outra" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setErrors({ name: "Nome é obrigatório" });
      return;
    }

    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-[var(--bg-simple)] border-[var(--border-color)]">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-xl text-[var(--font-color)]">
              Editar Comissão
            </DialogTitle>
            <DialogDescription className="text-[var(--font-color)]">
              Atualize os dados da comissão
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="space-y-3">
              <Label htmlFor="nome" className="text-[var(--font-color)] block">
                Nome*
              </Label>
              <Input
                id="nome"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border-[var(--border-input)]"
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="tipo" className="text-[var(--font-color)] block">
                Tipo
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger className="w-full border-[var(--border-input)]">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--bg-simple)] border-[var(--border-input)]">
                  {tiposComissao.map((tipo) => (
                    <SelectItem
                      key={tipo.value}
                      value={tipo.value}
                      className="hover:bg-[var(--hover-color)]"
                    >
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="descricao"
                className="text-[var(--font-color)] block"
              >
                Descrição
              </Label>
              <Input
                id="descricao"
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                className="w-full border-[var(--border-input)]"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Label htmlFor="ativo" className="text-[var(--font-color)]">
                Comissão ativa
              </Label>
              <Switch
                id="ativo"
                checked={formData.active ?? true}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, active: checked })
                }
                className="data-[state=checked]:bg-[var(--button-color)]"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
              className="w-full sm:w-auto order-last sm:order-first"
            >
              Excluir Comissão
            </Button>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 sm:w-auto border-[var(--border-color)]"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 sm:w-auto bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)]"
              >
                Salvar
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
