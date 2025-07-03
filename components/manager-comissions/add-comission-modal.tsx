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
import type { Campus } from "@/interface";
import { useState } from "react";

export interface AddComissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddComission: (newComission: {
    name: string;
    description: string;
    type: string;
    campusId: string;
    year: number;
  }) => void;
  campuses: Campus[];
}

export function AddComissionModal({
  isOpen,
  onClose,
  onAddComission,
  campuses,
}: AddComissionModalProps) {
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    tipo: "Permanente",
    campusId: "",
    ano: new Date().getFullYear(),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const tiposComissao = [
    { value: "Permanente", label: "Permanente" },
    { value: "Temporária", label: "Temporária" },
    { value: "Especial", label: "Especial" },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleTipoChange = (value: string) => {
    handleSelectChange("tipo", value);
  };

  const handleCampusChange = (value: string) => {
    handleSelectChange("campusId", value);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = "Nome da comissão é obrigatório";
    }

    if (!formData.campusId) {
      newErrors.campusId = "Campus é obrigatório";
    }

    if (!formData.ano || formData.ano < 2000 || formData.ano > 2100) {
      newErrors.ano = "Ano deve estar entre 2000 e 2100";
    }

    if (!formData.tipo) {
      newErrors.tipo = "Tipo de comissão é obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const submissionData = {
        name: formData.nome,
        description: formData.descricao,
        type: formData.tipo,
        campusId: formData.campusId,
        year: formData.ano,
      };

      onAddComission(submissionData);

      setFormData({
        nome: "",
        descricao: "",
        tipo: "Permanente",
        campusId: "",
        ano: new Date().getFullYear(),
      });

      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-[var(--bg-simple)]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-[var(--font-color)]">
              Nova Comissão
            </DialogTitle>
            <DialogDescription className="text-[var(--font-color)]">
              Preencha os dados para criar uma nova comissão
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nome" className="text-[var(--font-color)]">
                Nome*
              </Label>
              <Input
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className="border-[var(--border-input)]"
                placeholder="Ex: Comissão de Inventário 2024"
              />
              {errors.nome && (
                <p className="text-xs text-red-500">{errors.nome}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tipo" className="text-[var(--font-color)]">
                Tipo*
              </Label>
              <Select value={formData.tipo} onValueChange={handleTipoChange}>
                <SelectTrigger className="border-[var(--border-input)]">
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

            <div className="grid gap-2">
              <Label htmlFor="campusId" className="text-[var(--font-color)]">
                Campus*
              </Label>
              <Select
                value={formData.campusId}
                onValueChange={handleCampusChange}
              >
                <SelectTrigger className="border-[var(--border-input)]">
                  <SelectValue
                    placeholder={
                      campuses.length === 0
                        ? "Nenhum campus disponível"
                        : "Selecione o campus"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="bg-[var(--bg-simple)] border-[var(--border-input)]">
                  {campuses.length === 0 ? (
                    <SelectItem value="" disabled className="text-gray-500">
                      Nenhum campus encontrado
                    </SelectItem>
                  ) : (
                    campuses.map((campus) => (
                      <SelectItem
                        key={campus.id}
                        value={campus.id}
                        className="hover:bg-[var(--hover-color)]"
                      >
                        {campus.name} ({campus.code})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.campusId && (
                <p className="text-xs text-red-500">{errors.campusId}</p>
              )}
              {campuses.length === 0 && (
                <p className="text-xs text-yellow-600">
                  Nenhum campus disponível. Verifique se há campus cadastrados.
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ano" className="text-[var(--font-color)]">
                Ano*
              </Label>
              <Input
                id="ano"
                name="ano"
                type="number"
                min="2000"
                max="2100"
                value={formData.ano}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    ano: parseInt(e.target.value) || new Date().getFullYear(),
                  }))
                }
                className="border-[var(--border-input)]"
                placeholder="Ex: 2024"
              />
              {errors.ano && (
                <p className="text-xs text-red-500">{errors.ano}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="descricao" className="text-[var(--font-color)]">
                Descrição
              </Label>
              <Input
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                className="border-[var(--border-input)]"
                placeholder="Descreva a finalidade da comissão"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-[var(--border-color)] bg-[var(--bg-simple)] hover:bg-[var(--hover-color)] hover:text-white w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white w-full sm:w-auto"
            >
              Criar Comissão
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
