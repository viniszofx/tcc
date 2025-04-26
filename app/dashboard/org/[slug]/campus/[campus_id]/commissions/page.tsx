import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function CommissionsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Comissões</h1>
        <p className="text-muted-foreground">Lista de comissões do câmpus</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Comissão de Inventário 2024</CardTitle>
            <CardDescription>ID: 5564896513</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Comissão responsável pelo inventário anual de 2024
            </p>
          </CardContent>
          <CardFooter>
            <Link
              href="/dashboard/org/ifms/campus/corumba/commissions/5564896513"
              className="w-full"
            >
              <Button className="w-full">Ver Comissão</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comissão de Desfazimento</CardTitle>
            <CardDescription>ID: 56494946156</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Comissão responsável pelo desfazimento de bens inservíveis
            </p>
          </CardContent>
          <CardFooter>
            <Link
              href="/dashboard/org/ifms/campus/corumba/commissions/56494946156"
              className="w-full"
            >
              <Button className="w-full">Ver Comissão</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
