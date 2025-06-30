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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserProfile } from "@/interface";
import { useEffect, useState } from "react";

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: string, newRole: string) => void;
  member: (UserProfile & { roleInCommission?: string }) | null;
}

export default function EditMemberModal({
  isOpen,
  onClose,
  onSave,
  member,
}: EditMemberModalProps) {
  const [selectedRole, setSelectedRole] = useState<string>("");

  useEffect(() => {
    if (member && isOpen) {
      setSelectedRole(member.roleInCommission || "Membro");
    }
  }, [member, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (member && selectedRole && selectedRole !== member.roleInCommission) {
      onSave(member.id, selectedRole);
    }
    onClose();
  };

  const handleClose = () => {
    setSelectedRole("");
    onClose();
  };

  if (!member) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md max-w-[95vw] p-4 sm:p-6">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[var(--font-color)]">
              Editar Função do Membro
            </DialogTitle>
            <DialogDescription className="text-[var(--font-color)] opacity-70">
              Altere a função de <strong>{member.name}</strong> na comissão.
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 sm:my-6 space-y-4">
            {/* Informações do Usuário (readonly) */}
            <div className="space-y-2">
              <Label className="text-[var(--font-color)]">Usuário</Label>
              <div className="p-3 border border-[var(--border-color)] rounded-md bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[var(--button-color)] rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-[var(--font-color)]">
                      {member.name}
                    </p>
                    <p className="text-sm text-gray-600">{member.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Seleção de Nova Função */}
            <div className="space-y-2">
              <Label className="text-[var(--font-color)]">
                Nova Função na Comissão
              </Label>
              <Select
                value={selectedRole}
                onValueChange={setSelectedRole}
                required
              >
                <SelectTrigger className="border-[var(--border-color)] bg-[var(--bg-color)] text-[var(--font-color)]">
                  <SelectValue placeholder="Selecione a nova função" />
                </SelectTrigger>
                <SelectContent className="border-[var(--border-color)]">
                  <SelectItem
                    value="Presidente"
                    className="hover:bg-[var(--hover-color)]"
                  >
                    👑 Presidente
                  </SelectItem>
                  <SelectItem
                    value="Secretario"
                    className="hover:bg-[var(--hover-color)]"
                  >
                    📝 Secretário
                  </SelectItem>
                  <SelectItem
                    value="Membro"
                    className="hover:bg-[var(--hover-color)]"
                  >
                    👤 Membro
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Mostrar função atual */}
              <p className="text-xs text-gray-500">
                Função atual:{" "}
                <strong>{member.roleInCommission || "Membro"}</strong>
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="w-full sm:w-auto text-[var(--font-color)] transition-all"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white transition-all"
              disabled={
                !selectedRole || selectedRole === member.roleInCommission
              }
            >
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
