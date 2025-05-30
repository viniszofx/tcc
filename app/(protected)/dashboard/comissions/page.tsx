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
  params: Promise<{
    campus_id: string;
  }>;
}

export default async function CommissionsPage({
  params,
}: CommissionsPageProps) {
  // console.log("params", params);
  const resolvedParams = await params;
  const campus_id = resolvedParams.campus_id
    ? resolvedParams.campus_id
    : "corumba";
  console.log("campus_id", campus_id);
  const commissions = data.commissions.filter(
    (commission) => commission.campus_id === campus_id
  );

  const campus = data.campuses.find((campus) => campus.id === campus_id);
  const campusName = campus ? campus.name : "Câmpus";

  return (
    <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-lg transition-all duration-300 lg:max-w-5xl xl:max-w-6xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold text-[var(--font-color)] md:text-2xl lg:text-3xl">
          Comissões
        </CardTitle>
        <CardDescription>Lista de comissões do {campusName}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
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
                  href={`/dashboard/commissions/${commission.id}`}
                  className="w-full"
                >
                  <Button className="w-full text-[var(--font-color2)] bg-[var(--button-color)] transition-all hover:bg-[var(--hover-3-color)]">
                    Ver Comissão
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
