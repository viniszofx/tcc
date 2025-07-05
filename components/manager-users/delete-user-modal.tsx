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
import { UserProfile } from '@/types';
import { AlertTriangle } from "lucide-react";

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onConfirmDelete: (user: UserProfile) => void;
  isDeleting?: boolean;
}

export function DeleteUserModal({
  isOpen,
  onClose,
  user,
  onConfirmDelete,
  isDeleting = false,
}: DeleteUserModalProps) {
  if (!user) return null;

  const handleConfirm = () => {
    onConfirmDelete(user);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[var(--bg-simple)] border-[var(--border-color)] max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-[var(--font-color)]">
                Confirmar Exclusão
              </DialogTitle>
              <DialogDescription className="text-[var(--font-color)] opacity-70">
                Esta ação não pode ser desfeita.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-3">
            <p className="text-[var(--font-color)]">
              Tem certeza que deseja excluir o usuário{" "}
              <strong>{user.name}</strong> ({user.email})?
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm font-medium mb-2">
                Esta ação irá remover permanentemente:
              </p>
              <ul className="text-red-700 text-sm space-y-1">
                <li>• O usuário do sistema e do Supabase Auth</li>
                <li>• Todas as suas associações com campus</li>
                <li>• Todas as suas associações com comissões</li>
                <li>• Todas as suas associações com organizações</li>
                <li>• Todo o histórico de inventário relacionado</li>
                <li>• Referências em itens de inventário (itens serão mantidos)</li>
              </ul>
            </div>

            <p className="text-[var(--font-color)] text-sm opacity-80">
              O usuário precisará ser recriado caso queira acessar o sistema novamente.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="border-[var(--border-color)] text-[var(--font-color)] hover:bg-[var(--hover-color)]"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? "Excluindo..." : "Confirmar Exclusão"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
