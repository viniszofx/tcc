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
import { Switch } from "@/components/ui/switch";
import type { Campus } from "@/interface";
import { AlertTriangle } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

interface Organization {
  id: string;
  name: string;
  shortName: string;
  active: boolean;
}

interface CampusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (campus: Campus) => void;
  onDelete: (campusId: string) => void;
  campus: Campus | null;
  mode: "create" | "edit" | "delete";
}

export default function CampusModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  campus,
  mode,
}: CampusModalProps) {
  const [formData, setFormData] = useState<Campus>({
    id: "",
    organizationId: "",
    name: "",
    code: "",
    active: false,
  });

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingOrganizations, setLoadingOrganizations] = useState(false);

  // Buscar organizações disponíveis para o usuário
  const fetchOrganizations = async () => {
    try {
      setLoadingOrganizations(true);
      const response = await fetch("/api/organization");
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data.filter((org: Organization) => org.active));
      }
    } catch (error) {
      console.error("Erro ao buscar organizações:", error);
    } finally {
      setLoadingOrganizations(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Buscar organizações quando o modal abrir
      fetchOrganizations();
    }

    if (campus) {
      setFormData(campus);
    } else {
      setFormData({
        id: "",
        organizationId: "",
        name: "",
        code: "",
        active: true,
      });
    }
  }, [campus, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      active: checked,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar se uma organização foi selecionada
    if (!formData.organizationId) {
      alert("Por favor, selecione uma organização.");
      return;
    }

    onSave(formData);
  };

  const handleDelete = () => {
    if (campus) {
      onDelete(campus.id);
    }
  };

  const renderContent = () => {
    if (mode === "delete") {
      return (
        <>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[var(--font-color)]">
              Excluir Campus
            </DialogTitle>
            <DialogDescription className="text-[var(--font-color)] opacity-70">
              Tem certeza que deseja excluir este campus? Esta ação não pode ser
              desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 sm:my-6 flex items-center justify-center">
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-8 w-8 sm:h-10 sm:w-10 text-red-500" />
            </div>
          </div>
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 sm:p-4 text-center">
            <p className="font-medium text-red-800 break-words">
              {campus?.name} ({campus?.code})
            </p>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-center mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto text-[var(--font-color)] transition-all"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="w-full sm:w-auto bg-red-500 text-white hover:bg-red-600 transition-all"
            >
              Excluir
            </Button>
          </DialogFooter>
        </>
      );
    }

    return (
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[var(--font-color)]">
            {mode === "create" ? "Novo Campus" : "Editar Campus"}
          </DialogTitle>
          <DialogDescription className="text-[var(--font-color)] opacity-70">
            {mode === "create"
              ? "Preencha os campos para criar um novo campus."
              : "Edite as informações do campus."}
          </DialogDescription>
        </DialogHeader>
        <div className="my-4 sm:my-6 space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="organizationId"
              className="text-[var(--font-color)]"
            >
              Organização <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.organizationId}
              onValueChange={(value) =>
                handleSelectChange("organizationId", value)
              }
              disabled={loadingOrganizations}
            >
              <SelectTrigger className="border-[var(--border-color)] bg-[var(--input-bg-color)] text-[var(--font-color)]">
                <SelectValue
                  placeholder={
                    loadingOrganizations
                      ? "Carregando..."
                      : "Selecione uma organização"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name} ({org.shortName})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-[var(--font-color)]">
              Nome
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nome do campus"
              required
              className="border-[var(--border-color)] bg-[var(--input-bg-color)] text-[var(--font-color)]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="campus_codigo" className="text-[var(--font-color)]">
              Código
            </Label>
            <Input
              id="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="Código do campus"
              required
              className="border-[var(--border-color)] bg-[var(--input-bg-color)] text-[var(--font-color)]"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="active" className="text-[var(--font-color)]">
              Campus Ativo
            </Label>
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={handleSwitchChange}
            />
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto text-[var(--font-color)] transition-all"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="w-full sm:w-auto bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white transition-all"
          >
            {mode === "create" ? "Criar" : "Salvar"}
          </Button>
        </DialogFooter>
      </form>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-w-[95vw] p-4 sm:p-6">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
