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

export default function OrganizationsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Organizações</h1>
        <p className="text-muted-foreground">
          Lista de organizações cadastradas
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Instituto Federal de Mato Grosso do Sul</CardTitle>
            <CardDescription>IFMS</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Detalhes sobre o Instituto Federal de Mato Grosso do Sul e suas
              unidades
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/org/ifms/campus/" className="w-full">
              <Button className="w-full">Ver Câmpus</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instituto Federal de Santa Catarina</CardTitle>
            <CardDescription>IFSC</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Detalhes sobre o Instituto Federal de Santa Catarina e suas
              unidades
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/org/ifsc/campus/" className="w-full">
              <Button className="w-full">Ver Câmpus</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
