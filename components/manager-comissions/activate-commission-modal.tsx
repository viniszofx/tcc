"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Commission } from "@/types/core";

interface ActivateCommissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  commission: Commission;
  isLoading?: boolean;
}

export function ActivateCommissionModal({
  isOpen,
  onClose,
  onConfirm,
  commission,
  isLoading = false,
}: ActivateCommissionModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-[var(--bg-simple)] border-[var(--border-color)]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[var(--font-color)]">
            Ativar Comissão
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[var(--font-color)] opacity-70">
            A comissão <strong>"{commission.name}"</strong> está atualmente inativa.
            <br />
            <br />
            Deseja ativar esta comissão? Isso permitirá que ela seja utilizada
            normalmente para gerenciar inventários e membros.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={onClose}
            disabled={isLoading}
            className="bg-[var(--bg-simple)] border-[var(--border-color)] text-[var(--font-color)] hover:bg-[var(--hover-3-color)]"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isLoading ? "Ativando..." : "Ativar Comissão"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}