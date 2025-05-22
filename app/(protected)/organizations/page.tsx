import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getOrganizations } from "@/lib/data-service";
import Link from "next/link";

export default function OrganizationsPage() {
  const organizations = getOrganizations();

  return (
    <div className="p-6 space-y-6 mx-auto max-w-3xl bg-[var(--bg-simple)] shadow-lg rounded-lg transition-all duration-300 lg:max-w-5xl xl:max-w-6xl ">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Organizações</h1>
        <p className="text-muted-foreground">
          Lista de organizações cadastradas
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {organizations.map((org) => (
          <Card key={org.id}>
            <CardHeader>
              <CardTitle>{org.name}</CardTitle>
              <CardDescription>{org.shortName}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Detalhes sobre o {org.name} e suas unidades
              </p>
            </CardContent>
            <CardFooter>
              <Link
                href={`/dashboard/org/${org.id}/campus/`}
                className="w-full"
              >
                <Button className="w-full">Ver Câmpus</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
