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
    setFormData((prev) => ({
      ...prev,
      active: checked,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-w-[95vw] p-4 sm:p-6">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[var(--font-color)]">
              {mode === "create" ? "Nova Organização" : "Editar Organização"}
            </DialogTitle>
            <DialogDescription className="text-[var(--font-color)] opacity-70">
              {mode === "create"
                ? "Preencha os campos para criar uma nova organização."
                : "Edite as informações da organização."}
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 sm:my-6 space-y-4">
            <div>
              <Label htmlFor="name" className="text-[var(--font-color)]">
                Nome
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="border-[var(--border-color)] bg-[var(--input-bg-color)] text-[var(--font-color)]"
              />
            </div>
            <div>
              <Label htmlFor="shortName" className="text-[var(--font-color)]">
                Sigla
              </Label>
              <Input
                id="shortName"
                name="shortName"
                value={formData.shortName}
                onChange={handleChange}
                required
                className="border-[var(--border-color)] bg-[var(--input-bg-color)] text-[var(--font-color)]"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="active" className="text-[var(--font-color)]">
                Organização Ativa
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
      </DialogContent>
    </Dialog>
  );
}
