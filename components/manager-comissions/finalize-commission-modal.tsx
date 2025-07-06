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

interface FinalizeCommissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  commission: Commission;
  isLoading?: boolean;
}

export function FinalizeCommissionModal({
  isOpen,
  onClose,
  onConfirm,
  commission,
  isLoading = false,
}: FinalizeCommissionModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-[var(--bg-simple)] border-[var(--border-color)]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[var(--font-color)]">
            Finalizar Comissão
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[var(--font-color)] opacity-70">
            Você está prestes a finalizar a comissão <strong>"{commission.name}"</strong>.
            <br />
            <br />
            <strong>Atenção:</strong> Esta ação não pode ser desfeita. Uma vez finalizada,
            a comissão não poderá mais ser utilizada para gerenciar inventários ou membros.
            <br />
            <br />
            Tem certeza de que deseja continuar?
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
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? "Finalizando..." : "Finalizar Comissão"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}