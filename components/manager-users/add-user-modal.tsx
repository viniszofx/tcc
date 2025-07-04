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
import { useReferenceData } from "@/hooks/queries/use-page-data";
import type { Campus, UserProfile } from "@/interface";
import { CheckCircle, Copy, Crown, User, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
  role?: "admin global" | "admin" | "member";
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
  canCreateGlobalAdmin?: boolean; // Permite criar admin global
}

export function AddUserModal({
  isOpen,
  onClose,
  onAddUser,
  canCreateGlobalAdmin = false,
}: AddUserModalProps) {
  // Usar hook de dados de referência (cache otimizado)
  const {
    organizations,
    isLoading: isLoadingReference,
    error: referenceError,
  } = useReferenceData();
  const [formData, setFormData] = useState<AddUserFormData>({
    name: "",
    email: "",
    description: "",
    avatar: "/logo.svg",
    active: true,
    organizationId: "",
    campusId: "",
    organizationRole: "member",
    role: "member",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [createdUser, setCreatedUser] = useState<{
    name: string;
    email: string;
  } | null>(null);

  // Calcular campus disponíveis usando useMemo em vez de useEffect
  const availableCampuses = useMemo(() => {
    if (!formData.organizationId) return [];

    const selectedOrg = organizations.find(
      (org: any) => org.id === formData.organizationId
    );
    return selectedOrg?.campuses || [];
  }, [formData.organizationId, organizations]);

  // Limpar campus selecionado quando a organização muda
  useEffect(() => {
    if (
      formData.campusId &&
      !availableCampuses.find((c: any) => c.id === formData.campusId)
    ) {
      setFormData((prev) => ({ ...prev, campusId: "" }));
    }
  }, [formData.campusId, availableCampuses]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpar erro específico do campo
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "active") {
      setFormData((prev) => ({ ...prev, [name]: value === "true" }));
    } else if (name === "organizationRole") {
      setFormData((prev) => ({ ...prev, organizationRole: value }));
    } else if (name === "role") {
      setFormData((prev) => ({
        ...prev,
        role: value as "admin global" | "admin" | "member",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    // Limpar erro específico do campo
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = "Nome é obrigatório";
    if (!formData.email?.trim()) newErrors.email = "Email é obrigatório";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email inválido";
    // if (!formData.password) newErrors.password = "Senha é obrigatória"
    // else if (formData.password.length < 6) newErrors.password = "Senha deve ter pelo menos 6 caracteres"
    // Papel na organização só é obrigatório se organização for selecionada
    if (formData.organizationId && !formData.organizationRole)
      newErrors.organizationRole = "Papel na organização é obrigatório";
    // Organização agora é opcional
    // Campus é opcional - usuário pode ser apenas do sistema

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);
    setTempPassword(null);
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const userProfileData = {
        name: formData.name,
        email: formData.email,
        description: formData.description,
        avatar: formData.avatar,
        active: formData.active,
        organizationId: formData.organizationId,
        campusId: formData.campusId, // Pode ser vazio
        organizationRole: formData.organizationRole,
        role: formData.role, // Enviar papel do sistema
      };

      // Chamada direta para a API, igual ao onboarding
      const response = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userProfileData),
      });

      const result = await response.json();
      if (!response.ok) {
        setErrorMessage(result.error || "Erro ao criar usuário");
        return;
      }

      setSuccessMessage("Usuário criado com sucesso!");
      setTempPassword(result.tempPassword || null);
      setCreatedUser({
        name: result.user?.name || userProfileData.name,
        email: result.user?.email || userProfileData.email,
      });
      // Atualiza a listagem imediatamente, mas só se não houver erro
      if (result.user && !result.error) {
        onAddUser(result.user);
      }
      // Só limpa o formulário se não houver erro
      if (!result.error) {
        setFormData({
          name: "",
          email: "",
          description: "",
          avatar: "/logo.svg",
          active: true,
          organizationId: "",
          campusId: "",
          organizationRole: "member",
          role: "member",
        });
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] w-full max-w-[95vw] bg-[var(--bg-simple)] max-h-[90vh] overflow-y-auto overflow-x-hidden p-2 sm:p-4">
        {successMessage || errorMessage || tempPassword ? (
          <div className="space-y-6 py-6 text-center">
            {successMessage && (
              <div className="text-green-700 bg-green-100 p-3 rounded-md font-semibold">
                {successMessage}
              </div>
            )}
            {createdUser && (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-[var(--font-color)]">
                    Nome:
                  </span>
                  <span className="text-[var(--font-color)]">
                    {createdUser.name}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-[var(--font-color)]">
                    Email:
                  </span>
                  <span className="text-[var(--font-color)]">
                    {createdUser.email}
                  </span>
                </div>
              </div>
            )}
            {errorMessage && (
              <div className="text-red-700 bg-red-100 p-3 rounded-md font-semibold">
                {errorMessage}
              </div>
            )}
            {tempPassword && (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-[var(--font-color)]">
                    Senha temporária:
                  </span>
                  <span className="font-mono text-[var(--font-color)] bg-white dark:bg-gray-700 px-2 py-1 rounded flex items-center gap-2">
                    {tempPassword}
                    <button
                      type="button"
                      onClick={() =>
                        navigator.clipboard.writeText(tempPassword)
                      }
                      className="ml-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                      title="Copiar senha"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </span>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-2 rounded-lg mt-2">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    <strong>Importante:</strong> Anote essa senha temporária em
                    local seguro. Após o primeiro login, o usuário poderá
                    alterá-la nas configurações do perfil.
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                type="button"
                className="w-full bg-[var(--button-color)] text-[var(--font-color2)] mt-2"
                onClick={() => {
                  setSuccessMessage(null);
                  setErrorMessage(null);
                  setTempPassword(null);
                  setCreatedUser(null);
                  onClose();
                }}
              >
                Fechar
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-[var(--font-color)]">
                Adicionar Usuário
              </DialogTitle>
              <DialogDescription className="text-[var(--font-color)]">
                Preencha os dados do novo usuário
              </DialogDescription>
            </DialogHeader>
            <div
              className="grid gap-4 py-4 w-full box-border overflow-x-hidden"
              style={{ maxWidth: "100vw", minWidth: 0 }}
            >
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-[var(--font-color)]">
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
                <Label
                  htmlFor="description"
                  className="text-[var(--font-color)]"
                >
                  Descrição/Cargo
                </Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  className="border-[var(--border-input)]"
                  placeholder="Ex: Coordenador de TI"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-[var(--font-color)]">Organização</Label>
                <Select
                  value={formData.organizationId || ""}
                  onValueChange={(value) =>
                    handleSelectChange("organizationId", value)
                  }
                >
                  <SelectTrigger className="border-[var(--border-input)] max-w-full truncate">
                    <SelectValue placeholder="Selecione uma organização (opcional)" className="break-words"/>
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--bg-simple)] max-w-[90vw] w-full">
                    {/* Não use value="" para SelectItem, apenas placeholder controla vazio */}
                    {organizations.map((org: any) => (
                      <SelectItem key={org.id} value={org.id} className="break-words">
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.organizationId && (
                  <p className="text-xs text-red-500">
                    {errors.organizationId}
                  </p>
                )}
              </div>
              {/* Papel na Organização */}
              <div className="grid gap-2">
                <Label className="text-[var(--font-color)]">
                  Papel na Organização
                </Label>
                <Select
                  value={formData.organizationRole || ""}
                  onValueChange={(value) =>
                    handleSelectChange("organizationRole", value)
                  }
                  disabled={!formData.organizationId}
                >
                  <SelectTrigger className="border-[var(--border-input)]">
                    <SelectValue placeholder="Selecione o papel na organização (opcional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--bg-simple)] max-w-[90vw] w-full">
                    {/* Não use value="" para SelectItem, apenas placeholder controla vazio */}
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
              <div className="grid gap-2">
                <Label className="text-[var(--font-color)]">
                  Papel no Sistema
                </Label>
                <Select
                  value={formData.role || ""}
                  onValueChange={(value) => handleSelectChange("role", value)}
                >
                  <SelectTrigger className="border-[var(--border-input)]">
                    <SelectValue placeholder="Selecione o papel do sistema" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--bg-simple)] max-w-[90vw] w-full">
                    {canCreateGlobalAdmin && (
                      <SelectItem value="admin global">
                        <span className="flex items-center gap-2">
                          <Crown className="w-4 h-4 text-red-600" />
                          Administrador Global
                        </span>
                      </SelectItem>
                    )}
                    <SelectItem value="admin">
                      <span className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-yellow-600" />
                        Administrador do Sistema
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
                {errors.role && (
                  <p className="text-xs text-red-500">{errors.role}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label className="text-[var(--font-color)]">
                  Campus/Unidade (Opcional)
                </Label>
                <Select
                  value={formData.campusId || "no-campus"}
                  onValueChange={(value) =>
                    handleSelectChange(
                      "campusId",
                      value === "no-campus" ? "" : value
                    )
                  }
                  disabled={
                    !formData.organizationId || availableCampuses.length === 0
                  }
                >
                  <SelectTrigger className="border-[var(--border-input)]">
                    <SelectValue placeholder="Selecione um campus (opcional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--bg-simple)] max-w-[90vw] w-full">
                    <SelectItem value="no-campus">
                      Nenhum campus específico
                    </SelectItem>
                    {availableCampuses.map((campus: Campus) => (
                      <SelectItem key={campus.id} value={campus.id}>
                        {campus.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2 mt-2">
                <Label className="text-[var(--font-color)]">Status</Label>
                <Select
                  value={formData.active ? "true" : "false"}
                  onValueChange={(value) => handleSelectChange("active", value)}
                >
                  <SelectTrigger className="border-[var(--border-input)]">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--bg-simple)] max-w-[90vw] w-full">
                    <SelectItem value="true">
                      <span className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Ativo
                      </span>
                    </SelectItem>
                    <SelectItem value="false">
                      <span className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-600" />
                        Inativo
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
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
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adicionando..." : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
