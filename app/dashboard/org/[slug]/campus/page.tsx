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

export default function CampusPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Câmpus</h1>
        <p className="text-muted-foreground">Lista de câmpus da organização</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Câmpus Corumbá</CardTitle>
            <CardDescription>IFMS-CB</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Detalhes sobre o Câmpus Corumbá e suas comissões
            </p>
          </CardContent>
          <CardFooter>
            <Link
              href="/dashboard/org/ifms/campus/corumba/commissions/"
              className="w-full"
            >
              <Button className="w-full">Ver Comissões</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Câmpus Campo Grande</CardTitle>
            <CardDescription>IFMS-CG</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Detalhes sobre o Câmpus Campo Grande e suas comissões
            </p>
          </CardContent>
          <CardFooter>
            <Link
              href="/dashboard/org/ifms/campus/campo-grande/commissions/"
              className="w-full"
            >
              <Button className="w-full">Ver Comissões</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
