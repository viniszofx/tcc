"use client"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface DeleteUserDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  userName: string
}

export function DeleteUserDialog({ isOpen, onClose, onConfirm, userName }: DeleteUserDialogProps) {
  const handleDelete = () => {
    onConfirm()
    onClose()
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-[var(--bg-simple)]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[var(--font-color)]">Confirmar exclusão</AlertDialogTitle>
          <AlertDialogDescription className="text-[var(--font-color)]">
            Tem certeza que deseja excluir o usuário <span className="font-bold">{userName}</span>? Esta ação não pode
            ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-[var(--border-color)] bg-[var(--bg-simple)] text-[var(--font-color)] hover:bg-[var(--hover-color)] hover:text-white">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-[var(--button-2-color)] text-white hover:bg-red-600">
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
