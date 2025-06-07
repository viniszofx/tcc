import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Organizacao } from "@/lib/interface";
import { Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
interface OrganizationCardProps {
  organization: Organizacao;
  onEdit: () => void;
  onDelete: () => void;
  onClick?: () => void;
}

export default function OrganizationCard({ organization, onEdit, onDelete, onClick }: OrganizationCardProps) {
  return (
    <Card className="border border-[var(--border-color)] rounded-xl shadow-sm flex flex-col justify-between min-h-[180px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-[var(--font-color)]">{organization.nome}</CardTitle>
        <CardDescription className="text-[var(--font-color)] opacity-80">Sigla: {organization.nome_curto}</CardDescription>
      </CardHeader>
      <CardFooter className="flex items-center justify-end gap-3 pt-0 pb-4 px-6">
        <Link href={`/admin/organizations/${organization.organizacao_id}`}>
          <Button
            className="bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-3-color)] hover:text-white"
            size="icon"
            variant="default"
            title="Ver"
          >
            <Eye size={18} />
            <span className="sr-only">Ver</span>
          </Button>
        </Link>
        <Button
          variant="outline"
          onClick={onEdit}
          className="text-[var(--font-color)] border-[var(--border-color)]"
          size="icon"
          title="Atualizar"
        >
          <Pencil size={18} />
        </Button>
        <Button
          variant="destructive"
          onClick={onDelete}
          size="icon"
          title="Deletar"
        >
          <Trash2 size={18} />
        </Button>
      </CardFooter>
    </Card>
  );
}