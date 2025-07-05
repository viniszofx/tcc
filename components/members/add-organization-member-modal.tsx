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
import type { UserProfile } from '@/types';
import { Crown, User } from "lucide-react";
import { useEffect, useState } from "react";

interface AddOrganizationMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: string, role: string) => void;
  organizationId: string;
  currentMembers: string[];
}

export default function AddOrganizationMemberModal({
  isOpen,
  onClose,
  onSave,
  organizationId,
  currentMembers,
}: AddOrganizationMemberModalProps) {
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("member");
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAvailableUsers = async () => {
      if (!isOpen) return;
      
      setLoading(true);
      try {
        const response = await fetch("/api/user");
        const users = await response.json();

        if (response.ok) {
          // Filtrar usuários que não são membros da organização e estão ativos
          // Também filtrar usuários que não têm organização (sem organizationMembers)
          const filteredUsers = users.filter(
            (u: any) => 
              !currentMembers.includes(u.id) && 
              u.active &&
              (!u.organizationMembers || u.organizationMembers.length === 0) // Usuários sem organização
          );

          setAvailableUsers(filteredUsers);
        }
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableUsers();
  }, [organizationId, currentMembers, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser && selectedRole) {
      onSave(selectedUser, selectedRole);
      setSelectedUser("");
      setSelectedRole("member");
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedUser("");
    setSelectedRole("member");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md max-w-[95vw] p-4 sm:p-6">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[var(--font-color)]">
              Adicionar Membro à Organização
            </DialogTitle>
            <DialogDescription className="text-[var(--font-color)] opacity-70">
              Selecione um usuário sem organização para adicionar a esta organização.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 sm:my-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-[var(--font-color)]">Usuário</Label>
              <Select
                value={selectedUser}
                onValueChange={setSelectedUser}
                required
                disabled={loading}
              >
                <SelectTrigger className="border-[var(--border-color)] bg-[var(--bg-color)] text-[var(--font-color)]">
                  <SelectValue placeholder={loading ? "Carregando usuários..." : "Selecione um usuário"} />
                </SelectTrigger>
                <SelectContent className="border-[var(--border-color)]">
                  {availableUsers.length > 0 ? (
                    availableUsers.map((user) => (
                      <SelectItem
                        key={user.id}
                        value={user.id}
                        className="hover:bg-[var(--hover-color)]"
                      >
                        {user.name} ({user.email})
                      </SelectItem>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground mt-2 px-2">
                      {loading ? "Carregando..." : "Nenhum usuário sem organização disponível"}
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[var(--font-color)]">
                Função na Organização
              </Label>
              <Select
                value={selectedRole}
                onValueChange={setSelectedRole}
                required
              >
                <SelectTrigger className="border-[var(--border-color)] bg-[var(--bg-color)] text-[var(--font-color)]">
                  <SelectValue placeholder="Selecione a função" />
                </SelectTrigger>
                <SelectContent className="border-[var(--border-color)]">
                  <SelectItem
                    value="admin"
                    className="hover:bg-[var(--hover-color)]"
                  >
                    <span className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-yellow-600" />
                      Administrador
                    </span>
                  </SelectItem>
                  <SelectItem
                    value="member"
                    className="hover:bg-[var(--hover-color)]"
                  >
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      Membro
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
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
              disabled={!selectedUser || !selectedRole || loading}
            >
              Adicionar{" "}
              {selectedRole === "admin" ? "Administrador" : "Membro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}