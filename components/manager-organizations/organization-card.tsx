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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Organization } from '@/types';
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { NavigationButton } from "@/components/ui/navigation-button";

interface OrganizationCardProps {
  organization: Organization;
  onEdit: () => void;
  onDelete: () => void;
  onClick?: () => void;
  disableDelete?: boolean;
}

export default function OrganizationCard({
  organization,
  onEdit,
  onDelete,
  onClick,
  disableDelete,
}: OrganizationCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete();
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <Card className="border border-[var(--border-color)] bg-[var(--bg-simple)] transition-all duration-300 rounded-xl shadow-sm flex flex-col justify-between min-h-[180px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm sm:text-base lg:text-lg font-semibold text-[var(--font-color)] truncate">
          {organization.name}
        </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-[var(--font-color)] opacity-80 truncate">
          Sigla: {organization.shortName}
        </CardDescription>
        <CardDescription className="text-xs sm:text-sm text-[var(--font-color)] opacity-80 space-y-1">
          <div className="truncate">ID: {organization.id}</div>
          <div className="mt-1">
            Status:{" "}
            <span
              className={
                organization.active
                  ? "text-green-600 font-medium"
                  : "text-gray-500 font-medium"
              }
            >
              {organization.active ? "Ativo" : "Inativo"}
            </span>
          </div>
        </CardDescription>
        </CardHeader>
        <CardFooter className="flex items-center justify-end gap-3 pt-0 pb-4 px-6">
          <NavigationButton
            href={`/application/organizations/${organization.id}`}
            className="bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-3-color)] hover:text-white"
            size="icon"
            variant="default"
            title="Ver"
          >
            <Eye size={18} />
            <span className="sr-only">Ver</span>
          </NavigationButton>
          <Button
            variant="outline"
            onClick={onEdit}
            className="text-[var(--font-color)] border-[var(--border-color)]"
            size="icon"
            title="Atualizar"
          >
            <Pencil size={18} />
          </Button>
          {!disableDelete && (
            <Button
              variant="destructive"
              onClick={handleDeleteClick}
              size="icon"
              title="Deletar"
            >
              <Trash2 size={18} />
            </Button>
          )}
        </CardFooter>
      </Card>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a organização "{organization.name}
              "? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
