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

interface Campus {
  id: string;
  name: string;
  code: string;
  created_at?: string;
}

const mockCampuses: Campus[] = [
  {
    id: "1",
    name: "Campus São Paulo",
    code: "SPO",
  },
  {
    id: "2",
    name: "Campus Guarulhos",
    code: "GRU",
  },
  {
    id: "3",
    name: "Campus Suzano",
    code: "SUZ",
  },
];

async function getCampusData(): Promise<Campus[]> {
  try {
    const supabase = await supabaseClient();
    const { data, error } = await supabase.from("campus").select("*");

    if (error) {
      console.error("Supabase error:", error);
      return mockCampuses;
    }

    return data || mockCampuses;
  } catch (error) {
    console.error("Failed to fetch campus data:", error);
    return mockCampuses;
  }
}

export default async function CampusPage() {
  const campusData = await getCampusData();

  if (campusData.length === 0) {
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
          {campusData.map((campus) => (
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
