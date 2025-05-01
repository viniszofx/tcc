import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import data from "@/data/db.json";
import Link from "next/link";

export default function CampusPage() {
  const campuses = data.campuses;

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Câmpus</h1>
        <p className="text-muted-foreground">Lista de câmpus disponíveis</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {campuses.map((campus) => (
          <Card key={campus.id}>
            <CardHeader>
              <CardTitle>{campus.name}</CardTitle>
              <CardDescription>{campus.code}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Detalhes sobre o {campus.name} e suas comissões
              </p>
            </CardContent>
            <CardFooter>
              <Link
                href={`/dashboard/campus/${campus.id}/commissions`}
                className="w-full"
              >
                <Button className="w-full">Ver Comissões</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
