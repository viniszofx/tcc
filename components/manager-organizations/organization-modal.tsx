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
import type { Organizacao } from "@/lib/interface";
import { useEffect, useState } from "react";

interface OrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (org: Organizacao) => void;
  organization: Organizacao | null;
  mode: "create" | "edit";
}

export default function OrganizationModal({
  isOpen,
  onClose,
  onSave,
  organization,
  mode,
}: OrganizationModalProps) {
  const [formData, setFormData] = useState<Organizacao>({
    organizacao_id: "",
    nome: "",
    nome_curto: "",
    ativo: true,
  });

  useEffect(() => {
    if (organization) {
      setFormData(organization);
    } else {
      setFormData({
        organizacao_id: "",
        nome: "",
        nome_curto: "",
        ativo: true,
      });
    }
  }, [organization, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Nova Organização" : "Editar Organização"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Preencha os campos para criar uma nova organização."
                : "Edite as informações da organização."}
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 space-y-4">
            <div>
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                name="nome" 
                value={formData.nome}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="nome_curto">Sigla</Label>
              <Input
                id="nome_curto"
                name="nome_curto"
                value={formData.nome_curto}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {mode === "create" ? "Criar" : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}