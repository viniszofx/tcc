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
import { Switch } from "@/components/ui/switch";
import type { Organization } from "@/lib/new-interface";
import { useEffect, useState } from "react";

interface OrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (org: Organization) => void;
  organization: Organization | null;
  mode: "create" | "edit";
}

export default function OrganizationModal({
  isOpen,
  onClose,
  onSave,
  organization,
  mode,
}: OrganizationModalProps) {
  const [formData, setFormData] = useState<Organization>({
    id: "",
    name: "",
    shortName: "",
    active: false,
  });

  useEffect(() => {
    if (organization) {
      setFormData(organization);
    } else {
      setFormData({
        id: "",
        name: "",
        shortName: "",
        active: true,
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

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      active: checked
    }))
  }

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
          <div className="my-4 sm:my-6 space-y-4">
            <div>
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="shortName">Sigla</Label>
              <Input
                id="shortName"
                name="shortName"
                value={formData.shortName}
                onChange={handleChange}
                required
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