import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileSpreadsheet, Upload } from "lucide-react";
import Link from "next/link";

const commissionId = "comissao";

export default function EmptyInventory() {
  return (
    <Card className="border-[var(--border-input)] bg-[var(--card-color)] w-full">
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        <FileSpreadsheet className="h-16 w-16 text-[var(--font-color)]/30 mb-4" />
        <h3 className="text-lg font-medium text-[var(--font-color)]">
          Nenhum dado de inventário encontrado
        </h3>
        <p className="text-sm text-[var(--font-color)]/70 mt-1 mb-6 max-w-md">
          Para visualizar o inventário, você precisa processar um arquivo de
          dados primeiro.
        </p>
        <Link href={(`/admin/comissions/${commissionId}/upload`)}>
          <Button className="flex items-center gap-2 bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white">
            <Upload className="h-4 w-4" />
            <span>Processar Arquivo</span>
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
