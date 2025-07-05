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

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: string, role: string) => void;
  commissionId: string;
  currentMembers: string[];
  campusId?: string; // Para filtrar usuários do mesmo campus
}

export default function AddMemberModal({
  isOpen,
  onClose,
  onSave,
  commissionId,
  currentMembers,
  campusId,
}: AddMemberModalProps) {
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("Membro");
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    const fetchAvailableUsers = async () => {
      try {
        const response = await fetch("/api/user");
        const users = await response.json();

        if (response.ok) {
          let filteredUsers = users.filter(
            (u: UserProfile) => !currentMembers.includes(u.id) && u.active
          );

          // Se campusId foi fornecido, filtrar apenas usuários do mesmo campus
          if (campusId) {
            // Buscar todos os membros do campus
            const campusMembersResponse = await fetch(
              `/api/campus-member?campusId=${campusId}`
            );

            if (campusMembersResponse.ok) {
              const campusMembers = await campusMembersResponse.json();
              const campusUserIds = campusMembers.map(
                (member: any) => member.userId
              );

              // Filtrar apenas usuários que são membros do campus
              filteredUsers = filteredUsers.filter((user: UserProfile) =>
                campusUserIds.includes(user.id)
              );
            }
          }

          setAvailableUsers(filteredUsers);
        }
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      }
    };

    if (isOpen) {
      fetchAvailableUsers();
    }
  }, [commissionId, currentMembers, isOpen, campusId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser && selectedRole) {
      onSave(selectedUser, selectedRole);
      setSelectedUser("");
      setSelectedRole("Membro");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-w-[95vw] p-4 sm:p-6">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[var(--font-color)]">
              Adicionar Membro
            </DialogTitle>
            <DialogDescription className="text-[var(--font-color)] opacity-70">
              Selecione um usuário para adicionar à comissão.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 sm:my-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-[var(--font-color)]">Usuário</Label>
              <Select
                value={selectedUser}
                onValueChange={setSelectedUser}
                required
              >
                <SelectTrigger className="border-[var(--border-color)] bg-[var(--bg-color)] text-[var(--font-color)]">
                  <SelectValue placeholder="Selecione um usuário" />
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
                      Nenhum usuário disponível
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[var(--font-color)]">
                Função na Comissão
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
                    value="Presidente"
                    className="hover:bg-[var(--hover-color)]"
                  >
                    <span className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-yellow-600" />
                      Presidente
                    </span>
                  </SelectItem>
                  <SelectItem
                    value="Membro"
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
              onClick={onClose}
              className="w-full sm:w-auto text-[var(--font-color)] transition-all"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white transition-all"
              disabled={!selectedUser || !selectedRole}
            >
              Adicionar{" "}
              {selectedRole === "Presidente" ? "Presidente" : "Membro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
