"use client";

import { useEffect, useState } from "react";
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

interface Organization {
  id: string;
  name: string;
  shortName: string;
  active?: boolean;
}

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
    active: true,
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
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
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