import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabaseClient } from "@/utils/supabase/client";
import Link from "next/link";

export default async function CampusPage() {
  // const campuses = data.campuses
  const supabase = await supabaseClient();
  const { data, error } = await supabase.from("campus").select("*");
  console.log("campus", data);
  if (error) {
    return <div>Error loading campuses: {error.message}</div>;
  }
  if (!data || data.length === 0) {
    return <div>No campuses found</div>;
  }

  return (
    <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-lg transition-all duration-300 lg:max-w-5xl xl:max-w-6xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold text-[var(--font-color)] md:text-2xl lg:text-3xl">
          Câmpus
        </CardTitle>
        <CardDescription>Lista de câmpus disponíveis</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <div className="grid gap-6 md:grid-cols-2">
          {data.map((campus) => (
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
                  <Button className="w-full text-[var(--font-color2)] bg-[var(--button-color)] transition-all hover:bg-[var(--hover-3-color)]">
                    Ver Comissões
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
