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
import data from "@/data/new-db.json";
import type { UserProfile } from "@/lib/new-interface";
import { useEffect, useState } from "react";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: string, role: string) => void;
  commissionId: string;
  currentMembers: string[];
}

export default function AddMemberModal({
  isOpen,
  onClose,
  onSave,
  commissionId,
  currentMembers,
}: AddMemberModalProps) {
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    const available = (data.user_profiles as UserProfile[]).filter(
      (u) => !currentMembers.includes(u.id) && u.active
    );
    setAvailableUsers(available);
  }, [commissionId, currentMembers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser) {
      onSave(selectedUser, "member");
      setSelectedUser("");
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
              disabled={!selectedUser}
            >
              Adicionar Membro
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
