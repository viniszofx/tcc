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
import { Separator } from "@/components/ui/separator";
import type { Campus, Organization, UserProfile } from '@/types';
import {
  AlertCircle,
  CheckCircle,
  Crown,
  Key,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface OrganizationWithCampuses extends Organization {
  campuses?: Campus[];
}

interface EditUserFormData extends Partial<UserProfile> {
  organizationId?: string;
  campusId?: string;
  organizationRole?: string;
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditUser: (userData: Partial<UserProfile>) => void;
  user: UserProfile | null;
  canEditGlobalAdminRole?: boolean; // Novo prop para controlar se pode editar admin global
  currentUserIsGlobalAdmin?: boolean; // Novo prop para verificar se o usuário atual é admin global
}

export function EditUserModal({
  isOpen,
  onClose,
  onEditUser,
  user,
  canEditGlobalAdminRole = false,
  currentUserIsGlobalAdmin = false,
}: EditUserModalProps) {
  // Ocultar o drop de role do sistema caso um admin tente editar um admin global
  const isEditingAdminGlobal = user?.role === "admin global";
  const isCurrentUserGlobalAdmin = !!currentUserIsGlobalAdmin;

  const [formData, setFormData] = useState<
    EditUserFormData & { role?: "admin global" | "admin" | "member" }
  >({
    name: "",
    email: "",
    description: "",
    avatar: "",
    active: true,
    organizationId: "",
    campusId: "",
    organizationRole: "member",
    role: "member",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [organizations, setOrganizations] = useState<
    OrganizationWithCampuses[]
  >([]);
  const [availableCampuses, setAvailableCampuses] = useState<Campus[]>([]);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Carregar dados do usuário quando o modal abrir
  useEffect(() => {
    if (isOpen && user) {
      console.log("🔧 DEBUG EditUserModal:", {
        canEditGlobalAdminRole,
        currentUserIsGlobalAdmin,
        user: user,
        userOrganizationMembers: (user as any).organizationMembers,
      });

      fetchOrganizations();

      // Pegar dados do usuário atual
      const userWithRelations = user as any;
      const currentOrganization = userWithRelations.organizationMembers?.[0];
      const currentCampus = userWithRelations.campusMembers?.[0];

      setFormData({
        name: user.name,
        email: user.email,
        description: user.description || "",
        avatar: user.avatar || "",
        active: user.active,
        organizationId: currentOrganization?.organizationId || "",
        campusId: currentCampus?.campusId || "",
        organizationRole: currentOrganization?.role || "member",
        role: user.role || "member",
      });
    }
  }, [isOpen, user, canEditGlobalAdminRole, currentUserIsGlobalAdmin]);

  // Atualizar campus disponíveis quando a organização for selecionada
  useEffect(() => {
    if (formData.organizationId) {
      const selectedOrg = organizations.find(
        (org) => org.id === formData.organizationId
      );
      const campuses = selectedOrg?.campuses || [];
      setAvailableCampuses(campuses);

      // Se o campus atual não pertence à nova organização, limpar
      if (
        formData.campusId &&
        !campuses.find((c) => c.id === formData.campusId)
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const updateData = {
        name: formData.name,
        email: formData.email,
        description: formData.description,
        avatar: formData.avatar,
        active: formData.active,
        organizationId: formData.organizationId,
        campusId: formData.campusId,
        organizationRole: formData.organizationRole,
        role: formData.role, // papel do sistema
      };

      onEditUser(updateData);
      toast.success("Usuário atualizado com sucesso!");
      onClose();
    }
  };

  const handleChangePassword = async () => {
    if (!user?.id) return;

    setIsChangingPassword(true);
    try {
      const response = await fetch(`/api/user/${user.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(
          `Nova senha temporária gerada: ${result.tempPassword}`,
          {
            duration: 10000,
            description: "Envie esta senha para o usuário."
          }
        );
      } else {
        const error = await response.json();
        toast.error(`Erro ao trocar senha: ${error.error}`);
      }
    } catch (error) {
      console.error("Erro ao trocar senha:", error);
      toast.error("Erro inesperado ao trocar senha");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      email: "",
      description: "",
      avatar: "",
      active: true,
      organizationId: "",
      campusId: "",
      organizationRole: "member",
    });
    setErrors({});
    onClose();
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] w-full max-w-[95vw] bg-[var(--bg-simple)] max-h-[90vh] overflow-y-auto overflow-x-hidden p-2 sm:p-4">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-[var(--font-color)]">
              Editar Usuário
            </DialogTitle>
            <DialogDescription className="text-[var(--font-color)]">
              Altere os dados do usuário e suas permissões
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
              <Label htmlFor="description" className="text-[var(--font-color)]">
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
                <SelectContent className="bg-[var(--bg-simple)]">
                  {/* Não use value="" para SelectItem, apenas placeholder controla vazio */}
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
            {/* Campus/Unidade (Opcional) - agora acima do Papel do Sistema */}
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
                <SelectContent className="bg-[var(--bg-simple)]">
                  <SelectItem value="no-campus">
                    Nenhum campus específico
                  </SelectItem>
                  {availableCampuses.map((campus) => (
                    <SelectItem key={campus.id} value={campus.id}>
                      {campus.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Papel na Organização (único select, inclui admin global se permitido) */}
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
                <SelectContent className="bg-[var(--bg-simple)]">
                  {/* Não use value="" para SelectItem, apenas placeholder controla vazio */}
                  {canEditGlobalAdminRole && (
                    <SelectItem value="admin global">
                      <span className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-purple-600" />
                        Administrador Global
                      </span>
                    </SelectItem>
                  )}
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
              {formData.organizationRole === "admin global" && (
                <div className="flex items-start gap-2 p-3 rounded-md bg-purple-50 border border-purple-200">
                  <AlertCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-purple-800">
                    <p className="font-medium">Administrador Global</p>
                    <p>
                      Este usuário terá acesso total ao sistema, incluindo a
                      capacidade de gerenciar todos os usuários, organizações e
                      comissões.
                    </p>
                  </div>
                </div>
              )}
            </div>
            {/* Papel do sistema */}
            {!(isEditingAdminGlobal && !isCurrentUserGlobalAdmin) && (
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
                  <SelectContent className="bg-[var(--bg-simple)]">
                    {canEditGlobalAdminRole && (
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
            )}

            {/* Removido campo duplicado de Campus/Unidade */}

            {/* Removido segundo select de Papel na Organização para evitar duplicidade */}

            {/* Status ao final */}
            <div className="grid gap-2 mt-2">
              <Label className="text-[var(--font-color)]">Status</Label>
              <Select
                value={formData.active ? "true" : "false"}
                onValueChange={(value) => handleSelectChange("active", value)}
              >
                <SelectTrigger className="border-[var(--border-input)]">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--bg-simple)]">
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

            <Separator className="my-2" />

            <div className="grid gap-2">
              <Label className="text-[var(--font-color)] font-medium">
                Gerenciar Senha
              </Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                  className="flex-1 border-[var(--border-color)]"
                >
                  {isChangingPassword ? (
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-2" />
                  ) : (
                    <Key className="w-4 h-4 mr-2" />
                  )}
                  {isChangingPassword ? "Gerando..." : "Gerar Nova Senha"}
                </Button>
              </div>
              <p className="text-xs text-[var(--font-color)] opacity-60 flex items-start gap-1">
                <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                Gera uma nova senha temporária que deve ser enviada ao usuário
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-[var(--border-color)]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[var(--button-color)] text-[var(--font-color2)]"
            >
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
