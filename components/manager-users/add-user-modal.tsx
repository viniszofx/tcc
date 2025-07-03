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
import type { Campus, UserProfile } from "@/interface";
import { Crown, User } from "lucide-react";
import { useEffect, useState } from "react";

interface Organization {
  id: string;
  name: string;
  shortName: string;
  campuses: Campus[];
}

interface AddUserFormData extends Partial<UserProfile> {
  organizationId?: string;
  campusId?: string;
  organizationRole?: string; // "admin" ou "member"
}

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (
    user: Partial<UserProfile> & {
      organizationId?: string;
      campusId?: string;
      organizationRole?: string;
    }
  ) => void;
}

export function AddUserModal({
  isOpen,
  onClose,
  onAddUser,
}: AddUserModalProps) {
  const [formData, setFormData] = useState<AddUserFormData>({
    name: "",
    email: "",
    description: "",
    avatar: "/logo.svg",
    active: true,
    organizationId: "",
    campusId: "",
    organizationRole: "member",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [availableCampuses, setAvailableCampuses] = useState<Campus[]>([]);

  // Buscar organizações quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      fetchOrganizations();
    }
  }, [isOpen]);

  // Atualizar campus disponíveis quando a organização for selecionada
  useEffect(() => {
    if (formData.organizationId) {
      const selectedOrg = organizations.find(
        (org) => org.id === formData.organizationId
      );
      setAvailableCampuses(selectedOrg?.campuses || []);
      // Limpar campus selecionado se não for da organização atual
      if (
        formData.campusId &&
        !selectedOrg?.campuses.find((c) => c.id === formData.campusId)
      ) {
        setFormData((prev) => ({ ...prev, campusId: "" }));
      }
    } else {
      setAvailableCampuses([]);
      setFormData((prev) => ({ ...prev, campusId: "" }));
    }
  }, [formData.organizationId, organizations]);

  const fetchOrganizations = async () => {
    try {
      const response = await fetch("/api/organization");
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data);
      }
    } catch (error) {
      console.error("Erro ao buscar organizações:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "active") {
      setFormData((prev) => ({ ...prev, [name]: value === "true" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = "Nome é obrigatório";
    if (!formData.email?.trim()) newErrors.email = "Email é obrigatório";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email inválido";
    // if (!formData.password) newErrors.password = "Senha é obrigatória"
    // else if (formData.password.length < 6) newErrors.password = "Senha deve ter pelo menos 6 caracteres"
    if (!formData.organizationRole)
      newErrors.organizationRole = "Papel na organização é obrigatório";
    if (!formData.organizationId)
      newErrors.organizationId = "Organização é obrigatória";
    // Campus é opcional - usuário pode ser apenas da organização

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Enviar dados do UserProfile com informações adicionais
      const userProfileData = {
        name: formData.name,
        email: formData.email,
        description: formData.description,
        avatar: formData.avatar,
        active: formData.active,
        organizationId: formData.organizationId,
        campusId: formData.campusId, // Pode ser vazio
        organizationRole: formData.organizationRole,
      };

      onAddUser(userProfileData);
      setFormData({
        name: "",
        email: "",
        description: "",
        avatar: "/logo.svg",
        active: true,
        organizationId: "",
        campusId: "",
        organizationRole: "member",
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
              Adicionar Usuário
            </DialogTitle>
            <DialogDescription className="text-[var(--font-color)]">
              Preencha os dados do novo usuário
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

            {/* <div className="grid gap-2">
              <Label htmlFor="senha_hash" className="text-[var(--font-color)]">Senha</Label>
              <Input
                id="senha_hash"
                name="senha_hash"
                type="password"
                value={formData.senha_hash || ""}
                onChange={handleChange}
                className="border-[var(--border-input)]"
              />
              {errors.senha_hash && <p className="text-xs text-red-500">{errors.senha_hash}</p>}
            </div> */}

            <div className="grid gap-2">
              <Label className="text-[var(--font-color)]">Organização *</Label>
              <Select
                value={formData.organizationId || ""}
                onValueChange={(value) =>
                  handleSelectChange("organizationId", value)
                }
              >
                <SelectTrigger className="border-[var(--border-input)]">
                  <SelectValue placeholder="Selecione a organização" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--bg-simple)]">
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.organizationId && (
                <p className="text-xs text-red-500">{errors.organizationId}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label className="text-[var(--font-color)]">
                Campus/Unidade (Opcional)
              </Label>
              <Select
                value={formData.campusId || ""}
                onValueChange={(value) => handleSelectChange("campusId", value)}
                disabled={!formData.organizationId}
              >
                <SelectTrigger className="border-[var(--border-input)]">
                  <SelectValue
                    placeholder={
                      formData.organizationId
                        ? "Selecione o campus (opcional)"
                        : "Primeiro selecione uma organização"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="bg-[var(--bg-simple)]">
                  {availableCampuses.map((campus) => (
                    <SelectItem key={campus.id} value={campus.id}>
                      {campus.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.campusId && (
                <p className="text-xs text-red-500">{errors.campusId}</p>
              )}
              <p className="text-xs text-[var(--font-color)] opacity-60">
                O campus é opcional. Se não selecionado, o usuário será apenas
                membro da organização.
              </p>
            </div>

            <div className="grid gap-2">
              <Label className="text-[var(--font-color)]">Status</Label>
              <Select
                value={formData.active ? "true" : "false"}
                onValueChange={(value) =>
                  handleSelectChange(
                    "active",
                    value === "true" ? "true" : "false"
                  )
                }
              >
                <SelectTrigger className="border-[var(--border-input)]">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--bg-simple)]">
                  <SelectItem value="true">Ativo</SelectItem>
                  <SelectItem value="false">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="text-[var(--font-color)]">
                Papel na Organização
              </Label>
              <Select
                value={formData.organizationRole || ""}
                onValueChange={(value) =>
                  handleSelectChange("organizationRole", value)
                }
              >
                <SelectTrigger className="border-[var(--border-input)]">
                  <SelectValue placeholder="Selecione o papel na organização" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--bg-simple)]">
                  <SelectItem value="admin">
                    <span className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-yellow-600" />
                      Administrador da Organização
                    </span>
                  </SelectItem>
                  <SelectItem value="member">
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      Membro
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.organizationRole && (
                <p className="text-xs text-red-500">
                  {errors.organizationRole}
                </p>
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
              Adicionar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
