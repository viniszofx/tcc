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

interface CommissionsPageProps {
  params: {
    campus_id: string;
  };
}

export default function CommissionsPage({ params }: CommissionsPageProps) {
  const commissions = data.commissions.filter(
    (commission) => commission.campus_id === params.campus_id
  );

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Comissões</h1>
        <p className="text-muted-foreground">Lista de comissões do câmpus</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {commissions.map((commission) => (
          <Card key={commission.id}>
            <CardHeader>
              <CardTitle>{commission.name}</CardTitle>
              <CardDescription>ID: {commission.id}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {commission.description}
              </p>
            </CardContent>
            <CardFooter>
              <Link
                href={`/dashboard/campus/${params.campus_id}/commissions/${commission.id}`}
                className="w-full"
              >
                <Button className="w-full">Ver Comissão</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
