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
import type { Campus, CampusMember, UserProfile } from "@/interface";
import { useEffect, useState } from "react";

interface EditUserFormData extends Partial<UserProfile> {
  campusId?: string;
  papel?: string;
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  userMembers?: CampusMember[];
  onEditUser: (user: Partial<UserProfile>) => void;
  campusList: Campus[];
}

export function EditUserModal({
  isOpen,
  onClose,
  user,
  onEditUser,
  campusList,
}: EditUserModalProps) {
  const [formData, setFormData] = useState<EditUserFormData>({
    id: "",
    name: "",
    email: "",
    description: "",
    avatar: "/logo.svg",
    active: false,
    campusId: "",
    papel: "usuario",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        id: user.id,
        name: user.name,
        email: user.email,
        description: user.description,
        avatar: user.avatar,
        active: user.active,
        campusId: "",
        papel: "usuario",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = "Nome é obrigatório";
    if (!formData.email?.trim()) newErrors.email = "Email é obrigatório";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email inválido";
    if (!formData.campusId) newErrors.campusId = "Campus é obrigatório";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Enviar apenas os dados do UserProfile (sem campusId e papel)
      const userProfileData: Partial<UserProfile> = {
        id: formData.id,
        name: formData.name,
        email: formData.email,
        description: formData.description,
        avatar: formData.avatar,
        active: formData.active,
      };

      onEditUser(userProfileData);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-[var(--bg-simple)]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-[var(--font-color)]">
              Editar Usuário
            </DialogTitle>
            <DialogDescription className="text-[var(--font-color)]">
              Atualize os dados do usuário
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nome" className="text-[var(--font-color)]">
                Nome
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                className="border-[var(--border-input)]"
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email" className="text-[var(--font-color)]">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email || ""}
                onChange={handleChange}
                className="border-[var(--border-input)]"
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label className="text-[var(--font-color)]">Campus</Label>
              <Select
                value={formData.campusId || ""}
                onValueChange={(value) => handleSelectChange("campusId", value)}
              >
                <SelectTrigger className="border-[var(--border-input)]">
                  <SelectValue placeholder="Selecione um campus" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--bg-simple)]">
                  {campusList.map((campus) => (
                    <SelectItem key={campus.id} value={campus.id}>
                      {campus.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.campusId && (
                <p className="text-xs text-red-500">{errors.campusId}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label className="text-[var(--font-color)]">Papel</Label>
              <Select
                value={formData.papel || ""}
                onValueChange={(value) => handleSelectChange("papel", value)}
              >
                <SelectTrigger className="border-[var(--border-input)]">
                  <SelectValue placeholder="Selecione um papel" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--bg-simple)]">
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="presidente">Presidente</SelectItem>
                  <SelectItem value="operador">Operador</SelectItem>
                </SelectContent>
              </Select>
              {errors.papel && (
                <p className="text-xs text-red-500">{errors.papel}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-[var(--border-color)]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[var(--button-color)] text-[var(--font-color2)]"
            >
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
